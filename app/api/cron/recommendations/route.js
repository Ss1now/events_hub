import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Vercel Cron job for sending weekly event recommendations
export async function GET(request) {
    try {
        // Verify this is actually a cron request (Vercel adds this header)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
        }

        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        // Call the email send API to trigger recommendations
        const response = await fetch(`${baseURL}/api/email/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'send-recommendations'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log(`[CRON] Recommendations sent: ${data.msg}`);
            return NextResponse.json({ 
                success: true, 
                msg: data.msg,
                timestamp: new Date().toISOString()
            });
        } else {
            console.error('[CRON] Failed to send recommendations:', data.msg);
            return NextResponse.json({ 
                success: false, 
                msg: data.msg 
            }, { status: 500 });
        }

    } catch (error) {
        console.error('[CRON] Error in recommendations cron:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Cron job failed',
            error: error.message 
        }, { status: 500 });
    }
}
