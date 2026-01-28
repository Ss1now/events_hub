import { connectDB } from '@/lib/config/db';
import Blogmodel from '@/lib/models/blogmodel';
import UserModel from '@/lib/models/usermodel';
import { computeTimeline } from '@/lib/utils/liveMetrics';
import LiveFeedbackModel from '@/lib/models/livefeedbackmodel';
import { sendPeakNotification } from '@/lib/email/sendPeakNotification';

/**
 * Check pub/public events and send peak notifications
 * This runs as a cron job or scheduled task
 */
export async function checkAndNotifyPeakEvents() {
    try {
        await connectDB();
        
        console.log('[Peak Notification] Starting check...');

        // Find all live pub/public events that haven't sent peak notification yet
        const events = await Blogmodel.find({
            status: 'live',
            publicEventType: { $in: ['pub', 'public'] },
            peakNotificationSent: { $ne: true }
        }).populate('interestedUsers');

        console.log(`[Peak Notification] Found ${events.length} eligible events to check`);
        console.log('[Peak Notification] Event IDs:', events.map(e => ({ id: e._id, title: e.title, type: e.publicEventType })));

        for (const event of events) {
            // Get live feedback for this event
            const feedback = await LiveFeedbackModel.find({ 
                eventId: event._id 
            }).sort({ timestamp: -1 });

            if (feedback.length === 0) {
                console.log(`[Peak Notification] No feedback for event: ${event.title}`);
                continue;
            }

            // Compute timeline
            const timeline = computeTimeline(
                feedback,
                event.capacityProfile,
                new Date(event.endDateTime)
            );

            console.log(`[Peak Notification] Event "${event.title}" - Stage: ${timeline.stage}, Composite: ${timeline.compositeNow}`);

            // Check if event is at PEAK
            if (timeline.stage === 'PEAK') {
                // Get interested users with email addresses
                const interestedUsers = await UserModel.find({
                    _id: { $in: event.interestedUsers }
                }).select('name email');

                if (interestedUsers.length > 0) {
                    console.log(`[Peak Notification] Sending notifications to ${interestedUsers.length} users for: ${event.title}`);
                    
                    // Send notification
                    const result = await sendPeakNotification(event, interestedUsers);

                    if (result.success) {
                        // Mark event as notified
                        event.peakNotificationSent = true;
                        event.peakNotificationTime = new Date();
                        await event.save();

                        console.log(`[Peak Notification] Successfully sent to ${result.count} users for: ${event.title}`);
                    } else {
                        console.error(`[Peak Notification] Failed to send for: ${event.title}`, result.error);
                    }
                } else {
                    console.log(`[Peak Notification] No interested users with email for: ${event.title}`);
                }
            }
        }

        return { success: true, checkedEvents: events.length };
    } catch (error) {
        console.error('[Peak Notification] Error:', error);
        return { success: false, error: error.message };
    }
}
