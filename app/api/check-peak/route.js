import { checkAndNotifyPeakEvents } from '@/lib/utils/checkPeakEvents';

/**
 * API Route: Check peak events and send notifications
 * GET /api/check-peak
 * 
 * This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
 * to check for events at PEAK and notify interested users
 */
export async function GET(request) {
    try {
        // Verify authorization (optional - add API key check for security)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return Response.json(
                { success: false, msg: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Run the peak notification check
        const result = await checkAndNotifyPeakEvents();

        if (result.success) {
            return Response.json({
                success: true,
                msg: 'Peak notification check completed',
                checkedEvents: result.checkedEvents
            }, { status: 200 });
        } else {
            return Response.json({
                success: false,
                msg: 'Error checking peak events',
                error: result.error
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in check-peak API:', error);
        return Response.json({
            success: false,
            msg: 'Server error',
            error: error.message
        }, { status: 500 });
    }
}
