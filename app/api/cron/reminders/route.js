import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/config/db';
import blogModel from '@/lib/models/blogmodel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Vercel Cron job for sending event reminders
export async function GET(request) {
    try {
        // Verify this is actually a cron request (Vercel adds this header)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        const now = new Date();
        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        // Find events starting in approximately 24 hours (23-25 hours window)
        const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
        const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
        
        // Find events starting in approximately 1 hour (0.5-1.5 hours window)
        const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
        const in90Minutes = new Date(now.getTime() + 90 * 60 * 1000);
        
        // Get events for 24-hour reminders
        const events24h = await blogModel.find({
            startDateTime: { $gte: in23Hours, $lte: in25Hours },
            status: 'future',
            needReservation: true,
            reservedUsers: { $exists: true, $ne: [] }
        }).select('_id title');
        
        // Get events for 1-hour reminders
        const events1h = await blogModel.find({
            startDateTime: { $gte: in30Minutes, $lte: in90Minutes },
            status: { $in: ['future', 'live'] },
            needReservation: true,
            reservedUsers: { $exists: true, $ne: [] }
        }).select('_id title');
        
        let remindersSent = 0;
        let errors = [];
        
        // Send 24-hour reminders
        for (const event of events24h) {
            try {
                const response = await fetch(`${baseURL}/api/email/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'send-reminder',
                        eventId: event._id.toString()
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    remindersSent++;
                    console.log(`[CRON] 24h reminder sent for: ${event.title}`);
                } else {
                    errors.push(`Failed for ${event.title}: ${data.msg}`);
                }
            } catch (error) {
                errors.push(`Error for ${event.title}: ${error.message}`);
            }
        }
        
        // Send 1-hour reminders
        for (const event of events1h) {
            try {
                const response = await fetch(`${baseURL}/api/email/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'send-reminder',
                        eventId: event._id.toString()
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    remindersSent++;
                    console.log(`[CRON] 1h reminder sent for: ${event.title}`);
                } else {
                    errors.push(`Failed for ${event.title}: ${data.msg}`);
                }
            } catch (error) {
                errors.push(`Error for ${event.title}: ${error.message}`);
            }
        }
        
        console.log(`[CRON] Reminders completed: ${remindersSent} sent, ${errors.length} errors`);
        
        return NextResponse.json({ 
            success: true, 
            msg: `Sent ${remindersSent} reminders`,
            events24h: events24h.length,
            events1h: events1h.length,
            totalSent: remindersSent,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[CRON] Error in reminders cron:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Cron job failed',
            error: error.message 
        }, { status: 500 });
    }
}
