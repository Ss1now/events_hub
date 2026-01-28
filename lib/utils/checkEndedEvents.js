import Blogmodel from '@/lib/models/blogmodel';
import User from '@/lib/models/usermodel';
import { connectDB } from '@/lib/config/db';
import { sendEventEndedEmail } from '@/lib/email/sendEventEndedEmail';

export async function checkEndedEvents() {
    try {
        await connectDB();

        console.log('[Event Ended Check] Starting check for newly ended events...');

        // Find pub/public events that:
        // 1. Just became 'past' (status is past)
        // 2. Haven't sent end notification yet
        // 3. Are pub or public events
        const endedEvents = await Blogmodel.find({
            status: 'past',
            publicEventType: { $in: ['pub', 'public'] },
            endNotificationSent: { $ne: true }
        }).populate('authorId', 'email username');

        console.log(`[Event Ended Check] Found ${endedEvents.length} newly ended events`);

        const results = {
            checkedEvents: endedEvents.length,
            emailsSent: 0,
            errors: []
        };

        for (const event of endedEvents) {
            try {
                console.log(`[Event Ended Check] Processing: ${event.title}`);

                // Set moveNowExpiresAt (5 hours after event ends)
                if (!event.moveNowExpiresAt) {
                    const expiresAt = new Date(event.endDateTime);
                    expiresAt.setHours(expiresAt.getHours() + 5);
                    event.moveNowExpiresAt = expiresAt;
                    console.log(`[Event Ended Check] Set moveNowExpiresAt to ${expiresAt}`);
                }

                // Get all users who:
                // 1. Clicked "I'm going" (in interestedUsers)
                // 2. Rated the event live (in liveRatings array)
                const interestedUserIds = event.interestedUsers || [];
                
                // Get users who rated the event (from the liveRatings array embedded in the event)
                const ratedUserIds = (event.liveRatings || []).map(rating => rating.userId);

                // Combine and deduplicate user IDs
                const allUserIds = [...new Set([...interestedUserIds, ...ratedUserIds])];
                console.log(`[Event Ended Check] Found ${allUserIds.length} users to notify`);

                if (allUserIds.length === 0) {
                    console.log(`[Event Ended Check] No users to notify for ${event.title}`);
                    event.endNotificationSent = true;
                    event.endNotificationTime = new Date();
                    await event.save();
                    continue;
                }

                // Fetch user details
                const users = await User.find({
                    _id: { $in: allUserIds }
                }).select('email username');

                console.log(`[Event Ended Check] Sending emails to ${users.length} users`);

                // Send emails to all users
                let emailCount = 0;
                for (const user of users) {
                    try {
                        const result = await sendEventEndedEmail(
                            user.email,
                            user.username,
                            event
                        );

                        if (result.success) {
                            emailCount++;
                            console.log(`[Event Ended Check] Email sent to ${user.email}`);
                        } else {
                            console.error(`[Event Ended Check] Failed to send to ${user.email}:`, result.error);
                            results.errors.push({
                                event: event.title,
                                user: user.email,
                                error: result.error
                            });
                        }
                    } catch (emailError) {
                        console.error(`[Event Ended Check] Error sending to ${user.email}:`, emailError);
                        results.errors.push({
                            event: event.title,
                            user: user.email,
                            error: emailError.message
                        });
                    }
                }

                results.emailsSent += emailCount;

                // Mark notification as sent
                event.endNotificationSent = true;
                event.endNotificationTime = new Date();
                await event.save();

                console.log(`[Event Ended Check] Completed ${event.title}: ${emailCount} emails sent`);

            } catch (eventError) {
                console.error(`[Event Ended Check] Error processing event ${event.title}:`, eventError);
                results.errors.push({
                    event: event.title,
                    error: eventError.message
                });
            }
        }

        console.log('[Event Ended Check] Summary:', results);
        return results;

    } catch (error) {
        console.error('[Event Ended Check] Fatal error:', error);
        throw error;
    }
}
