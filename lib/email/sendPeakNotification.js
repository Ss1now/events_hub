import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send peak notification email to interested users when pub/public event reaches PEAK
 */
export async function sendPeakNotification(event, interestedUsers) {
    try {
        if (!resend) {
            console.error('[Peak Notification] Resend not configured');
            return { success: false, error: 'Resend not configured' };
        }

        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // Format event time
        const eventTime = new Date(event.startDateTime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        const eventType = event.publicEventType === 'pub' ? 'Pub' : 'Public';

        // Send email to each interested user
        const emailPromises = interestedUsers.map(async (user) => {
            try {
                const emailResult = await resend.emails.send({
                    from: 'Rice Parties <noreply@riceparties.com>',
                    to: user.email,
                    subject: `🎉 ${event.title} is at PEAK right now!`,
                    html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: 'Helvetica Neue', Arial, sans-serif;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                margin: 0;
                                padding: 20px;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: white;
                                border-radius: 16px;
                                overflow: hidden;
                                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            }
                            .header {
                                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                                padding: 40px 30px;
                                text-align: center;
                            }
                            .header h1 {
                                color: white;
                                margin: 0;
                                font-size: 32px;
                                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            }
                            .emoji {
                                font-size: 48px;
                                margin-bottom: 10px;
                            }
                            .content {
                                padding: 40px 30px;
                            }
                            .event-title {
                                font-size: 28px;
                                font-weight: bold;
                                color: #1a202c;
                                margin-bottom: 10px;
                            }
                            .peak-badge {
                                display: inline-block;
                                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                                color: white;
                                padding: 8px 20px;
                                border-radius: 20px;
                                font-weight: bold;
                                font-size: 14px;
                                margin-bottom: 20px;
                                text-transform: uppercase;
                            }
                            .info-section {
                                background: #f7fafc;
                                border-left: 4px solid #f5576c;
                                padding: 20px;
                                margin: 20px 0;
                                border-radius: 8px;
                            }
                            .info-item {
                                display: flex;
                                align-items: center;
                                margin-bottom: 12px;
                                font-size: 16px;
                            }
                            .info-item:last-child {
                                margin-bottom: 0;
                            }
                            .info-icon {
                                margin-right: 12px;
                                font-size: 20px;
                            }
                            .cta-button {
                                display: inline-block;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                text-decoration: none;
                                padding: 16px 40px;
                                border-radius: 30px;
                                font-weight: bold;
                                font-size: 18px;
                                margin-top: 20px;
                                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                                transition: transform 0.2s;
                            }
                            .cta-button:hover {
                                transform: translateY(-2px);
                            }
                            .message {
                                color: #4a5568;
                                font-size: 16px;
                                line-height: 1.6;
                                margin-bottom: 20px;
                            }
                            .footer {
                                background: #f7fafc;
                                padding: 20px;
                                text-align: center;
                                font-size: 14px;
                                color: #718096;
                            }
                            .urgency {
                                background: #fed7d7;
                                border-left: 4px solid #fc8181;
                                padding: 15px;
                                margin: 20px 0;
                                border-radius: 8px;
                            }
                            .urgency p {
                                margin: 0;
                                color: #c53030;
                                font-weight: 600;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <div class="emoji">🎉</div>
                                <h1>Party's Peaking!</h1>
                            </div>
                            
                            <div class="content">
                                <div class="event-title">${event.title}</div>
                                <span class="peak-badge">🔥 At Peak Right Now!</span>
                                
                                <p class="message">
                                    Hey ${user.name || 'there'}! 👋
                                    <br><br>
                                    The ${eventType.toLowerCase()} event you marked as interested just hit <strong>PEAK</strong>! 
                                    Live reports show the vibe is high and the crowd is perfect. This is the best time to head over!
                                </p>

                                <div class="urgency">
                                    <p>⚡ Don't wait - PEAK moments don't last forever!</p>
                                </div>
                                
                                <div class="info-section">
                                    <div class="info-item">
                                        <span class="info-icon">📍</span>
                                        <strong>Location:</strong>&nbsp;${event.location}
                                    </div>
                                    <div class="info-item">
                                        <span class="info-icon">🕐</span>
                                        <strong>Started:</strong>&nbsp;${eventTime}
                                    </div>
                                    <div class="info-item">
                                        <span class="info-icon">👥</span>
                                        <strong>Hosted by:</strong>&nbsp;${event.host}
                                    </div>
                                    ${event.publicEventType === 'pub' ? `
                                    <div class="info-item">
                                        <span class="info-icon">🍺</span>
                                        <strong>Type:</strong>&nbsp;Pub Event
                                    </div>
                                    ` : `
                                    <div class="info-item">
                                        <span class="info-icon">🌍</span>
                                        <strong>Type:</strong>&nbsp;Public Event
                                    </div>
                                    `}
                                </div>
                                
                                <center>
                                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/blogs/${event._id}" class="cta-button">
                                        View Live Updates 🚀
                                    </a>
                                </center>
                                
                                <p class="message" style="margin-top: 30px; font-size: 14px; color: #718096;">
                                    <em>This notification is based on real-time crowd and vibe reports from attendees. The event status updates automatically every 30 seconds.</em>
                                </p>
                            </div>
                            
                            <div class="footer">
                                <p>You're receiving this because you marked "${event.title}" as interested.</p>
                                <p style="margin-top: 10px;">
                                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" style="color: #667eea; text-decoration: none;">
                                        Rice Parties
                                    </a>
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                    `
                });
                console.log(`[Peak Notification] ✓ Sent to: ${user.email}`, emailResult);
                return { success: true, email: user.email };
            } catch (emailError) {
                console.error(`[Peak Notification] ✗ Error sending to ${user.email}:`, emailError);
                return { success: false, email: user.email, error: emailError.message };
            }
        });

        const results = await Promise.all(emailPromises);
        const successCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;
        
        console.log(`[Peak Notification] Sent ${successCount} emails for event: ${event.title}`);
        if (failedCount > 0) {
            console.log(`[Peak Notification] Failed to send ${failedCount} emails`);
        }
        
        return { success: true, count: successCount, failed: failedCount };
    } catch (error) {
        console.error('[Peak Notification] Error:', error);
        return { success: false, error: error.message };
    }
}
