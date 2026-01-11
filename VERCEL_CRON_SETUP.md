# ⚠️ DEPRECATED: Vercel Cron Setup Guide

**Note**: This guide is deprecated. Vercel Cron jobs are no longer free and charge for usage.

**Please use GitHub Actions instead**: See `GITHUB_ACTIONS_SETUP.md` for the free alternative.

---

## Overview

Your app now has automated email delivery via Vercel Cron:
- **Weekly Recommendations**: Every Monday at 9am UTC
- **Event Reminders**: Every hour (checks for events starting in 24h or 1h)

## Setup Instructions

### 1. Generate CRON_SECRET

Run this command to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (it will look like: `a1b2c3d4e5f6...`)

### 2. Add Environment Variables to Vercel

Go to your Vercel project settings:

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add the following variables:

   **CRON_SECRET**
   - Value: (paste the generated secret from step 1)
   - Environments: Production, Preview, Development
   
   **RESEND_API_KEY** (if not already added)
   - Value: Your Resend API key (starts with `re_`)
   - Environments: Production, Preview, Development
   
   **NEXT_PUBLIC_BASE_URL**
   - Value: `https://events-hub-one.vercel.app` (your production URL)
   - Environments: Production, Preview

3. Click **Save**

### 3. Add to Local Development

Add to your `.env.local` file:

```bash
CRON_SECRET=your_generated_secret_here
```

### 4. Deploy to Vercel

```bash
git add .
git commit -m "feat: Add Vercel Cron for automated email delivery"
git tag v0.5.0
git push origin main --tags
```

Vercel will automatically detect `vercel.json` and enable cron jobs.

### 5. Verify Cron Jobs are Active

After deployment:

1. Go to **Vercel Dashboard** → Your Project → **Cron Jobs** tab
2. You should see:
   - `GET /api/cron/recommendations` - Schedule: `0 9 * * 1`
   - `GET /api/cron/reminders` - Schedule: `0 * * * *`

## Cron Schedules Explained

### Recommendations: `0 9 * * 1`
- **0** - At minute 0
- **9** - At 9am (UTC)
- ***** - Every day of month
- ***** - Every month
- **1** - On Monday (0=Sunday, 1=Monday, etc.)

**Result**: Every Monday at 9am UTC

### Reminders: `0 * * * *`
- **0** - At minute 0
- ***** - Every hour
- ***** - Every day
- ***** - Every month
- ***** - Every day of week

**Result**: Every hour at the top of the hour

## How It Works

### Recommendations Cron
1. Runs every Monday at 9am UTC
2. Finds all users with `emailSubscriptions.recommendations: true`
3. For each user:
   - Analyzes their past RSVP'd and interested events
   - Finds 3-5 similar upcoming events
   - Sends personalized recommendation email
4. Logs results to Vercel logs

### Reminders Cron
1. Runs every hour
2. Queries for events starting in:
   - **24 hours** (23-25h window to avoid duplicates)
   - **1 hour** (30-90min window to avoid duplicates)
3. For each event:
   - Finds users who RSVP'd
   - Filters for users with `emailSubscriptions.reminders: true`
   - Sends reminder email with event details
4. Logs sent count and any errors

## Testing Locally

You can test the cron endpoints locally:

### Test Recommendations
```bash
curl -X GET http://localhost:3000/api/cron/recommendations \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test Reminders
```bash
curl -X GET http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring

### View Cron Execution Logs

1. **Vercel Dashboard** → Your Project → **Logs**
2. Filter by `/api/cron/`
3. Look for:
   - `[CRON] Recommendations sent: X emails`
   - `[CRON] Reminders completed: X sent, Y errors`

### Check for Errors

If cron jobs fail, check:
1. CRON_SECRET is set correctly in Vercel
2. RESEND_API_KEY is set and valid
3. NEXT_PUBLIC_BASE_URL is correct
4. Database connection is working
5. Vercel logs for specific error messages

## Manual Trigger (Development)

You can manually trigger emails without cron:

```bash
# Trigger recommendations
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"action":"send-recommendations"}'

# Trigger reminder for specific event
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"action":"send-reminder","eventId":"EVENT_ID_HERE"}'
```

## Cost Considerations

### Vercel Cron
- **Free on Hobby plan**: Up to 100 cron executions per day
- **Pro plan**: Higher limits
- Your setup uses: ~25 executions/day
  - Recommendations: 1/week = ~4/month
  - Reminders: 24/day = ~720/month
  
Total: Well within free tier limits

### Resend
- **Free tier**: 100 emails/day, 3,000/month
- Monitor your usage in Resend dashboard
- Upgrade if you exceed limits

## Troubleshooting

### Cron jobs not running
- Check **Cron Jobs** tab in Vercel dashboard
- Verify `vercel.json` is in root directory
- Redeploy if cron jobs don't appear

### Authentication errors
- Verify CRON_SECRET matches in Vercel environment variables
- Check authorization header format

### Emails not sending
- Verify RESEND_API_KEY is set
- Check Resend dashboard for quota limits
- Review logs for specific error messages

### No users receiving emails
- Check users have email subscriptions enabled
- Verify RSVP data is correct
- Run manual test to verify email sending works

## Next Steps

1. ✅ Set up CRON_SECRET in Vercel
2. ✅ Deploy to production
3. ✅ Verify cron jobs appear in Vercel dashboard
4. ✅ Wait for Monday 9am to see first recommendations
5. ✅ Create test events starting in 24h to test reminders
6. ✅ Monitor logs for successful execution

## Security Note

⚠️ **Never commit CRON_SECRET to Git!**
- It's in `.env.local` which is already gitignored
- Only set in Vercel environment variables
- Rotated if exposed

The CRON_SECRET prevents unauthorized access to your cron endpoints, ensuring only Vercel can trigger automated emails.
