import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/config/db';
import userModel from '@/lib/models/usermodel';
import blogModel from '@/lib/models/blogmodel';
import emailQueueModel from '@/lib/models/emailqueuemodel';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper function to generate recommendation email HTML
function getRecommendationEmailHTML(userName, events, baseURL) {
    const eventCards = events.map(event => `
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
            <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">${event.title}</h3>
            <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong>📅 ${new Date(event.date).toLocaleDateString()}</strong> at ${event.time}
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong>📍 ${event.location}</strong>
            </p>
            <p style="color: #374151; font-size: 14px; margin: 12px 0; line-height: 1.6;">
                ${event.description.substring(0, 150)}${event.description.length > 150 ? '...' : ''}
            </p>
            <a href="${baseURL}/blogs/${event._id}" 
               style="display: inline-block; background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; margin-top: 8px;">
                View Event
            </a>
        </div>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #7c3aed; margin: 0;">Rice Events</h1>
            </div>
            <div style="background-color: white; border-radius: 8px; padding: 30px;">
                <h2 style="color: #7c3aed; margin-top: 0;">Events You Might Like</h2>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                    Based on your interests, we've found some exciting events you might enjoy:
                </p>
                ${eventCards}
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
                        You're receiving this because you subscribed to event recommendations.
                        <br>
                        <a href="${baseURL}/me" style="color: #7c3aed; text-decoration: none;">Manage preferences</a>
                    </p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <p style="color: #9ca3af; font-size: 12px;">
                    © 2026 Rice Events. All rights reserved.
                </p>
            </div>
        </div>
    `;
}

// Helper function to generate update email HTML
function getUpdateEmailHTML(userName, event, changes, baseURL) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #7c3aed; margin: 0;">Rice Events</h1>
            </div>
            <div style="background-color: white; border-radius: 8px; padding: 30px;">
                <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
                    <h2 style="color: #1e40af; margin: 0 0 8px 0; font-size: 20px;">📢 Event Updated</h2>
                    <p style="color: #1e40af; margin: 0; font-size: 14px;">The host has made changes to this event</p>
                </div>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                    An event you're interested in has been updated:
                </p>
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #7c3aed; margin: 0 0 16px 0; font-size: 22px;">${event.title}</h3>
                    <p style="color: #374151; font-size: 16px; margin: 10px 0;">
                        <strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p style="color: #374151; font-size: 16px; margin: 10px 0;">
                        <strong>🕐 Time:</strong> ${event.time}
                    </p>
                    <p style="color: #374151; font-size: 16px; margin: 10px 0;">
                        <strong>📍 Location:</strong> ${event.location}
                    </p>
                    ${changes ? `
                        <div style="margin-top: 16px; padding: 12px; background-color: #fef3c7; border-radius: 6px;">
                            <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
                                What's changed:
                            </p>
                            <p style="color: #92400e; font-size: 14px; margin: 8px 0 0 0;">
                                ${changes}
                            </p>
                        </div>
                    ` : ''}
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${baseURL}/blogs/${event._id}" 
                       style="display: inline-block; background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        View Updated Event
                    </a>
                </div>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
                        You're receiving this update because you RSVP'd or showed interest in this event.
                        <br>
                        <a href="${baseURL}/me" style="color: #7c3aed; text-decoration: none;">Manage preferences</a>
                    </p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <p style="color: #9ca3af; font-size: 12px;">
                    © 2026 Rice Events. All rights reserved.
                </p>
            </div>
        </div>
    `;
}

// POST - Send event recommendations (called by cron job)
export async function POST(request) {
    try {
        await connectDB();

        const { action, eventId, userId, changes } = await request.json();
        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        if (action === 'send-recommendations') {
            // Find users who subscribed to recommendations
            const users = await userModel.find({
                'emailSubscriptions.recommendations': true
            }).select('email name emailSubscriptions interestedEvents reservedEvents');

            let emailsSent = 0;

            for (const user of users) {
                try {
                    const now = new Date();
                    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    const excludedEventIds = [...user.interestedEvents, ...user.reservedEvents];

                    let recommendedEvents = [];

                    // Multi-tier fallback strategy for recommendations
                    // Tier 1: Try personalized recommendations (based on user history)
                    if (excludedEventIds.length > 0) {
                        // Get user's event history to understand interests
                        const userEvents = await blogModel.find({
                            _id: { $in: excludedEventIds }
                        }).select('category location');

                        // Extract categories and locations from user history
                        const userCategories = [...new Set(userEvents.map(e => e.category).filter(Boolean))];
                        const userLocations = [...new Set(userEvents.map(e => e.location).filter(Boolean))];

                        // Find events matching user's interests
                        if (userCategories.length > 0 || userLocations.length > 0) {
                            recommendedEvents = await blogModel.find({
                                date: { $gte: now, $lte: oneWeekFromNow },
                                _id: { $nin: excludedEventIds },
                                $or: [
                                    { category: { $in: userCategories } },
                                    { location: { $in: userLocations } }
                                ]
                            }).limit(5);
                        }
                    }

                    // Tier 2: If not enough personalized events, add popular events
                    if (recommendedEvents.length < 3) {
                        const popularEvents = await blogModel.find({
                            date: { $gte: now, $lte: oneWeekFromNow },
                            _id: { $nin: [...excludedEventIds, ...recommendedEvents.map(e => e._id)] }
                        })
                        .sort({ totalLiveRatings: -1, averageRating: -1 })
                        .limit(5 - recommendedEvents.length);

                        recommendedEvents = [...recommendedEvents, ...popularEvents];
                    }

                    // Tier 3: If still not enough, show any upcoming events
                    if (recommendedEvents.length < 3) {
                        const anyUpcomingEvents = await blogModel.find({
                            date: { $gte: now, $lte: oneWeekFromNow },
                            _id: { $nin: [...excludedEventIds, ...recommendedEvents.map(e => e._id)] }
                        })
                        .sort({ date: 1 }) // Soonest first
                        .limit(5 - recommendedEvents.length);

                        recommendedEvents = [...recommendedEvents, ...anyUpcomingEvents];
                    }

                    // Only skip if absolutely no events available
                    if (recommendedEvents.length === 0) {
                        console.log(`No events to recommend for ${user.email} - skipping`);
                        continue;
                    }

                    const htmlContent = getRecommendationEmailHTML(
                        user.name || 'there',
                        recommendedEvents,
                        baseURL
                    );

                    if (resend) {
                        await resend.emails.send({
                            from: 'Rice Events <onboarding@resend.dev>',
                            to: user.email,
                            subject: '✨ Events You Might Like - Rice Events',
                            html: htmlContent
                        });
                        emailsSent++;
                    } else {
                        console.log(`[DEV] Would send recommendation email to: ${user.email}`);
                    }

                } catch (emailError) {
                    console.error(`Error sending recommendation to ${user.email}:`, emailError);
                }
            }

            return NextResponse.json({
                success: true,
                msg: `Sent ${emailsSent} recommendation emails`
            });

        } else if (action === 'send-update') {
            // Send update notification for a specific event
            console.log(`[Email] Processing send-update for event: ${eventId}`);
            
            const event = await blogModel.findById(eventId);
            if (!event) {
                console.log(`[Email] Event not found: ${eventId}`);
                return NextResponse.json({ success: false, msg: 'Event not found' }, { status: 404 });
            }

            console.log(`[Email] Event found: ${event.title}`);
            
            // First, let's see all affected users (for debugging)
            const allAffectedUsers = await userModel.find({
                $or: [
                    { reservedEvents: eventId },
                    { interestedEvents: eventId }
                ]
            }).select('email name emailSubscriptions');
            
            console.log(`[Email] Total affected users (RSVP'd or interested): ${allAffectedUsers.length}`);
            allAffectedUsers.forEach(u => {
                console.log(`  - ${u.email}, updates opt-in: ${u.emailSubscriptions?.updates || false}`);
            });
            
            // Find users who RSVP'd or showed interest and have updates enabled
            const users = await userModel.find({
                $or: [
                    { reservedEvents: eventId },
                    { interestedEvents: eventId }
                ],
                'emailSubscriptions.updates': true
            }).select('email name emailSubscriptions');

            console.log(`[Email] Users with updates ENABLED: ${users.length}`);

            let emailsSent = 0;

            for (const user of users) {
                try {
                    const htmlContent = getUpdateEmailHTML(
                        user.name || 'there',
                        event,
                        changes || 'Event details have been updated',
                        baseURL
                    );

                    if (resend) {
                        await resend.emails.send({
                            from: 'Rice Events <onboarding@resend.dev>',
                            to: user.email,
                            subject: `📢 Event Updated: ${event.title}`,
                            html: htmlContent
                        });
                        emailsSent++;
                    } else {
                        console.log(`[DEV] Would send update email to: ${user.email}`);
                    }

                } catch (emailError) {
                    console.error(`Error sending update to ${user.email}:`, emailError);
                }
            }

            return NextResponse.json({
                success: true,
                msg: `Sent ${emailsSent} update emails`
            });
        }

        return NextResponse.json({ success: false, msg: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in email send API:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Server error' 
        }, { status: 500 });
    }
}
