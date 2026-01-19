import userModel from '@/lib/models/usermodel';
import blogModel from '@/lib/models/blogmodel';
import { connectDB } from '@/lib/config/db';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper function to generate update email HTML
function getUpdateEmailHTML(userName, event, changes, baseURL) {
    const formattedDate = new Date(event.startDateTime).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const formattedTime = new Date(event.startDateTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #7c3aed; margin: 0;">Rice Parties</h1>
            </div>
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h2 style="margin: 0; font-size: 24px;">Event Updated</h2>
            </div>
            <div style="background-color: white; border-radius: 0 0 8px 8px; padding: 30px; border: 1px solid #e5e7eb;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                    An event you're interested in has been updated by the host:
                </p>
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                        <strong>What changed:</strong> ${changes}
                    </p>
                </div>
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 20px;">${event.title}</h3>
                    <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                        <strong>📅 ${formattedDate}</strong>
                    </p>
                    <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                        <strong>⏰ ${formattedTime}</strong>
                    </p>
                    <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                        <strong>📍 ${event.location}</strong>
                    </p>
                    ${event.description ? `
                    <p style="color: #374151; font-size: 14px; margin: 15px 0; line-height: 1.6;">
                        ${event.description}
                    </p>
                    ` : ''}
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${baseURL}/blogs/${event._id}" 
                       style="display: inline-block; background-color: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                        View Updated Event
                    </a>
                </div>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
                        You're receiving this because you RSVP'd or showed interest in this event.
                        <br>
                        <a href="${baseURL}/me" style="color: #7c3aed; text-decoration: none;">Manage email preferences</a>
                    </p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                <p>&copy; 2026 Rice Parties. All rights reserved.</p>
            </div>
        </div>
    `;
}

/**
 * Send update emails to users who RSVP'd or showed interest in an event
 * @param {string} eventId - MongoDB ObjectId of the event
 * @param {string} changes - Description of what changed
 * @returns {Promise<{success: boolean, emailsSent: number, msg: string}>}
 */
export async function sendUpdateEmails(eventId, changes = 'Event details have been updated') {
    try {
        // Ensure database connection
        await connectDB();
        console.log('[Email] Database connected');
        
        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        console.log(`[Email] Processing update emails for event: ${eventId}`);
        
        const event = await blogModel.findById(eventId);
        if (!event) {
            console.log(`[Email] Event not found: ${eventId}`);
            return { success: false, emailsSent: 0, msg: 'Event not found' };
        }

        console.log(`[Email] Event found: ${event.title}`);
        console.log(`[Email] Event interestedUsers:`, event.interestedUsers);
        console.log(`[Email] Event reservedUsers:`, event.reservedUsers);
        
        // Find all affected users (anyone who clicked "I'm going" or RSVP'd)
        const allAffectedUsers = await userModel.find({
            $or: [
                { reservedEvents: eventId },      // Users who RSVP'd (for events with reservation)
                { interestedEvents: eventId }     // Users who clicked "I'm going" (all events)
            ]
        }).select('email name emailSubscriptions');
        
        console.log(`[Email] ========================================`);
        console.log(`[Email] Total affected users (RSVP'd or clicked "I'm going"): ${allAffectedUsers.length}`);
        allAffectedUsers.forEach(u => {
            console.log(`  - Email: ${u.email}, Name: ${u.name}, updates opt-in: ${u.emailSubscriptions?.updates || false}`);
        });
        console.log(`[Email] ========================================`);
        
        // Find users who have updates enabled (either RSVP'd or interested)
        const users = await userModel.find({
            $or: [
                { reservedEvents: eventId },      // Users who RSVP'd
                { interestedEvents: eventId }     // Users who clicked "I'm going"
            ],
            'emailSubscriptions.updates': true
        }).select('email name');

        console.log(`[Email] Users with updates ENABLED: ${users.length}`);

        if (users.length === 0) {
            console.log('[Email] No users to notify (none have updates enabled)');
            return { success: true, emailsSent: 0, msg: 'No users to notify' };
        }

        console.log(`[Email] Preparing to send ${users.length} emails in parallel...`);

        // Send all emails in parallel using Promise.all for much faster delivery
        const emailPromises = users.map(async (user) => {
            try {
                console.log(`[Email] Processing user: ${user.email}`);
                
                const htmlContent = getUpdateEmailHTML(
                    user.name || 'there',
                    event,
                    changes,
                    baseURL
                );

                if (resend) {
                    console.log(`[Email] Attempting to send to: ${user.email}`);
                    const emailResult = await resend.emails.send({
                        from: 'Rice Parties <noreply@riceparties.com>',
                        to: user.email,
                        subject: `Event Updated: ${event.title}`,
                        html: htmlContent
                    });
                    console.log(`[Email] ✓ Sent update email to: ${user.email}`);
                    console.log(`[Email] Resend response:`, emailResult);
                    return { success: true, email: user.email };
                } else {
                    console.log(`[DEV] Would send update email to: ${user.email}`);
                    return { success: true, email: user.email };
                }

            } catch (emailError) {
                console.error(`[Email] ✗ Error sending update to ${user.email}:`, emailError);
                console.error(`[Email] Error details:`, emailError.message, emailError.stack);
                return { success: false, email: user.email, error: emailError.message };
            }
        });

        // Wait for all emails to complete
        const results = await Promise.all(emailPromises);
        const emailsSent = results.filter(r => r.success).length;
        const emailsFailed = results.filter(r => !r.success).length;

        console.log(`[Email] Successfully sent ${emailsSent} update emails`);
        if (emailsFailed > 0) {
            console.log(`[Email] Failed to send ${emailsFailed} emails`);
        }
        
        return {
            success: true,
            emailsSent,
            emailsFailed,
            msg: `Sent ${emailsSent} update emails${emailsFailed > 0 ? `, ${emailsFailed} failed` : ''}`
        };

    } catch (error) {
        console.error('[Email] Error in sendUpdateEmails:', error);
        return {
            success: false,
            emailsSent: 0,
            msg: 'Error sending update emails'
        };
    }
}
