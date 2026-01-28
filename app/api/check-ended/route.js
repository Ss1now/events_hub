import { NextResponse } from 'next/server';
import { checkEndedEvents } from '@/lib/utils/checkEndedEvents';

export async function GET(request) {
    try {
        // Verify this is coming from Vercel Cron or authorized source
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, msg: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('[API] Event ended check triggered by cron');

        const results = await checkEndedEvents();

        return NextResponse.json({
            success: true,
            msg: 'Event ended notification check completed',
            ...results
        });

    } catch (error) {
        console.error('[API] Error in event ended check:', error);
        return NextResponse.json(
            { success: false, msg: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
