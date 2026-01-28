import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEventEndedEmail(userEmail, userName, event) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://riceparties.com';
    const eventUrl = `${baseUrl}/blogs/${event._id}`;

    const subject = `${event.title} just ended - Rate it & see what's next!`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Ended</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 25%, #4ECDC4 50%, #95E1D3 75%, #F38181 100%); background-size: 400% 400%; animation: gradientShift 15s ease infinite;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; border: 3px solid transparent; background-clip: padding-box;">
                        
                        <!-- Confetti Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #4ECDC4 100%); padding: 50px 30px; text-align: center; position: relative;">
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 20px);">
                                </div>
                                <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold; text-shadow: 0 3px 6px rgba(0,0,0,0.3); letter-spacing: 1px;">
                                    PARTY JUST ENDED!
                                </h1>
                                <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 500;">
                                    Hope you had a blast!
                                </p>
                            </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 40px 30px; background: linear-gradient(to bottom, #ffffff 0%, #fef9f3 100%);">
                                <p style="margin: 0 0 20px 0; color: #333; font-size: 18px; line-height: 1.6; font-weight: 600;">
                                    Hey ${userName || 'Party Animal'}!
                                </p>
                                
                                <p style="margin: 0 0 25px 0; color: #555; font-size: 16px; line-height: 1.7;">
                                    <strong style="color: #FF6B6B; font-size: 18px;">${event.title}</strong> just wrapped up! Time flies when you're having fun, right?
                                </p>

                                <!-- Event Details Card with Party Vibes -->
                                <div style="background: linear-gradient(135deg, #FFE66D 0%, #FFEB99 100%); border-radius: 15px; padding: 25px; margin: 25px 0; border-left: 5px solid #FF6B6B; box-shadow: 0 4px 15px rgba(255,107,107,0.2);">
                                    <div style="margin-bottom: 12px; font-size: 15px;">
                                        <strong style="color: #FF6B6B;">Location:</strong>
                                        <span style="color: #333; font-weight: 500; margin-left: 8px;">${event.location}</span>
                                    </div>
                                    <div style="margin-bottom: 12px; font-size: 15px;">
                                        <strong style="color: #FF6B6B;">Type:</strong>
                                        <span style="color: #333; margin-left: 8px;">${event.eventType}</span>
                                    </div>
                                    <div style="font-size: 15px;">
                                        <strong style="color: #FF6B6B;">Host:</strong>
                                        <span style="color: #333; margin-left: 8px;">${event.host}</span>
                                    </div>
                                </div>

                                <!-- Rate Section with Fun Styling -->
                                <div style="background: linear-gradient(135deg, #4ECDC4 0%, #7FDFD9 100%); border-radius: 15px; padding: 25px; margin: 30px 0; text-align: center;">
                                    <h2 style="margin: 0 0 12px 0; color: white; font-size: 22px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                        How Was It?
                                    </h2>
                                    <p style="margin: 0 0 20px 0; color: rgba(255,255,255,0.95); font-size: 15px; line-height: 1.6;">
                                        Share your experience and help others find their next amazing event!
                                    </p>
                                </div>

                                <!-- What's Next Section -->
                                <div style="background: linear-gradient(135deg, #F38181 0%, #F5A3A3 100%); border-radius: 15px; padding: 25px; margin: 30px 0; text-align: center;">
                                    <h2 style="margin: 0 0 12px 0; color: white; font-size: 22px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                        What's the Move Now?
                                    </h2>
                                    <p style="margin: 0; color: rgba(255,255,255,0.95); font-size: 15px; line-height: 1.6;">
                                        See where everyone's heading next and share your after-party plans!
                                    </p>
                                </div>

                                <!-- Call to Action Button with Party Style -->
                                <div style="text-align: center; margin: 40px 0 30px 0;">
                                    <a href="${eventUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%); color: #333; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: bold; font-size: 17px; box-shadow: 0 6px 20px rgba(255,107,107,0.4); text-transform: uppercase; letter-spacing: 1px; border: 3px solid white;">
                                        LET'S GO!
                                    </a>
                                </div>
                            </td>
                        </tr>

                        <!-- Footer with Party Colors -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #95E1D3 0%, #4ECDC4 100%); padding: 30px; text-align: center;">
                                <p style="margin: 0; color: white; font-size: 15px; font-weight: 600; text-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                                    Keep the good vibes rolling!
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const response = await resend.emails.send({
            from: 'noreply@riceparties.com',
            to: userEmail,
            subject: subject,
            html: html
        });

        console.log('Event ended email sent successfully:', response);
        return { success: true, messageId: response.id };
    } catch (error) {
        console.error('Error sending event ended email:', error);
        return { success: false, error: error.message };
    }
}
