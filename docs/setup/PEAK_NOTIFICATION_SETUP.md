# Peak Notification Setup for Pub/Public Events

This feature automatically notifies users who marked interest in pub/public events when those events reach PEAK status.

## How It Works

1. **Database Tracking**: Added `peakNotificationSent` and `peakNotificationTime` fields to event model
2. **Email Service**: Created styled email template with event details and urgency messaging
3. **Cron Job**: Runs every 5 minutes to check live pub/public events
4. **Algorithm Check**: Uses existing timeline computation to detect PEAK stage
5. **One-Time Notification**: Each event only sends notification once when first reaching PEAK

## Setup Instructions

### 1. Email Service (Resend)

Peak notifications use the same Resend service as event update emails (`noreply@riceparties.com`).

No additional setup needed - uses existing `RESEND_API_KEY`.

### 2. Environment Variables

Add to your `.env.local`:
```env
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
CRON_SECRET=your-secret-key
```

### 3. Vercel Cron Setup

The `vercel.json` file is already configured to run the cron job every 5 minutes:
```json
{
  "crons": [
    {
      "path": "/api/check-peak",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

When you deploy to Vercel:
1. Add all environment variables in Vercel dashboard
2. The cron will automatically run every 5 minutes
3. Check logs in Vercel dashboard → Deployments → Functions

### 4. Manual Testing

You can manually trigger the peak check:
```bash
curl -X GET http://localhost:3000/api/check-peak \
  -H "Authorization: Bearer your-cron-secret"
```

## Email Template Features

- **Eye-catching design** with gradient backgrounds and party emojis
- **Peak urgency message** encouraging immediate action
- **Event details** including location, time, host
- **Live updates link** to event page
- **Mobile responsive** for all devices

## Notification Logic

**Event qualifies for PEAK notification when:**
- Event status = 'live'
- Event is tagged as 'pub' or 'public'
- Timeline stage = 'PEAK' (composite ≥ 65, trend ≥ -5)
- Notification has NOT been sent yet (`peakNotificationSent: false`)

**Notification is sent to:**
- All users who clicked "I'm Going" on the event
- Only users with valid email addresses

**After sending:**
- `peakNotificationSent` set to `true`
- `peakNotificationTime` records when notification was sent
- Event will NOT be checked again (prevents duplicate emails)

## Monitoring

Check cron execution in:
1. Vercel Dashboard → Your Project → Logs → Functions
2. Filter by `/api/check-peak`
3. Look for `[Peak Notification]` log entries

## Cost Considerations

- **Vercel Cron**: Free tier includes 100 cron jobs/day (5-minute interval = 288/day, requires Pro plan)
- **Resend**: Free tier includes 100 emails/day, 3,000/month (same service used for event updates)
- **Alternative**: Use GitHub Actions cron (free) or reduce frequency to every 10-15 minutes

## Testing Checklist

- [ ] Resend API key configured (same as event updates)
- [ ] Environment variables set
- [ ] Create test pub event
- [ ] Mark yourself as interested
- [ ] Submit live feedback to push event to PEAK
- [ ] Trigger cron manually or wait for automatic run
- [ ] Check email inbox for notification from noreply@riceparties.com
- [ ] Verify `peakNotificationSent` flag in database
