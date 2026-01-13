# GitHub Actions Setup for Email Automation

This guide walks you through setting up GitHub Actions to automate email recommendations and reminders for Rice Events.

## Overview

GitHub Actions will trigger your email cron endpoints on a schedule:
- **Weekly Recommendations**: Every Monday at 9:00 AM UTC
- **Hourly Reminders**: Every hour at minute 0

## Prerequisites

- Your app deployed on Vercel (or any hosting platform)
- CRON_SECRET already configured in your `.env.local`
- GitHub repository for your project

## Setup Steps

### 1. Get Your App URL

Your deployed Vercel app URL, for example:
```
https://events-hub.vercel.app
```

### 2. Add GitHub Secrets

Go to your GitHub repository:

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

#### Secret 1: `APP_URL`
- **Name**: `APP_URL`
- **Value**: Your full app URL (e.g., `https://events-hub.vercel.app`)
- **Note**: No trailing slash

#### Secret 2: `CRON_SECRET`
- **Name**: `CRON_SECRET`
- **Value**: Copy from your `.env.local` file
- **Current value**: `bda213fb498db2ccbc794ded2cfb22802df6df3d66ebb0f845862a3e3ccab56c`

### 3. Verify Workflow Files

The following workflow files should be in your repository:

```
.github/
  workflows/
    weekly-recommendations.yml  # Sends recommendations every Monday
    hourly-reminders.yml       # Checks for reminders every hour
```

These files are already created and configured.

### 4. Push to GitHub

Commit and push the workflow files:

```bash
git add .github/
git commit -m "Add GitHub Actions for email automation"
git push origin main
```

### 5. Verify Actions Are Running

1. Go to your GitHub repository
2. Click the **Actions** tab
3. You should see:
   - "Weekly Event Recommendations"
   - "Hourly Event Reminders"
4. Workflows will appear in the list after the first scheduled run

### 6. Test Manually (Optional)

To test without waiting for the schedule:

1. Go to **Actions** tab
2. Click on "Weekly Event Recommendations" or "Hourly Event Reminders"
3. Click **Run workflow** dropdown
4. Click **Run workflow** button
5. Monitor the execution in real-time

## Workflow Schedules

### Weekly Recommendations
- **Schedule**: `0 9 * * 1` (Monday at 9:00 AM UTC)
- **Endpoint**: `GET /api/cron/recommendations`
- **Converts to your timezone**:
  - UTC 9:00 AM = 3:00 AM CST (Houston time)
  - Adjust cron if needed in `.github/workflows/weekly-recommendations.yml`

### Hourly Reminders
- **Schedule**: `0 * * * *` (Every hour at minute 0)
- **Endpoint**: `GET /api/cron/reminders`
- **Checks**: 24-hour and 1-hour reminders automatically

## Customizing Schedules

Edit the cron expressions in the workflow files:

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Modify this line
```

### Cron Expression Examples

- `0 9 * * 1` - Every Monday at 9:00 AM UTC
- `0 9 * * *` - Every day at 9:00 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Every Sunday at midnight UTC
- `30 8 * * 1-5` - Weekdays at 8:30 AM UTC

Use [crontab.guru](https://crontab.guru/) to build custom schedules.

## Monitoring

### View Execution Logs

1. Go to **Actions** tab in GitHub
2. Click on a workflow run
3. Click on the job name
4. Expand the step to see curl response and HTTP status

### Expected Output

Success (HTTP 200):
```
HTTP Status: 200
Response: {"success":true,"msg":"Sent 5 recommendation emails"}
```

Error (HTTP 401):
```
HTTP Status: 401
Response: {"success":false,"msg":"Unauthorized"}
```

### Common Issues

#### 401 Unauthorized
- **Cause**: CRON_SECRET mismatch
- **Fix**: Verify `CRON_SECRET` in GitHub Secrets matches `.env.local`

#### 404 Not Found
- **Cause**: Incorrect APP_URL
- **Fix**: Verify APP_URL in GitHub Secrets (no trailing slash)

#### Workflow Not Running
- **Cause**: Workflow files not in `main` branch
- **Fix**: Ensure `.github/workflows/*.yml` are pushed to main branch

#### No Emails Sent
- **Cause**: RESEND_API_KEY not set in Vercel
- **Fix**: Add RESEND_API_KEY to Vercel environment variables

## Cost

**GitHub Actions is FREE** for:
- Public repositories (unlimited)
- Private repositories (2,000 minutes/month)

Your workflows use ~1-2 minutes/month total:
- Weekly recommendations: ~30 seconds × 4 times/month = 2 minutes
- Hourly reminders: ~10 seconds × 720 times/month = 2 hours (120 minutes)

**Total: ~122 minutes/month** (well within free tier)

## Migration from Vercel Cron

You can now remove Vercel Cron to avoid charges:

### Remove vercel.json

Delete or remove the `crons` section:

```json
{
  "crons": []
}
```

Or remove the file entirely if it only contained cron config.

### Keep Your Cron Endpoints

Your `/api/cron/recommendations` and `/api/cron/reminders` endpoints should remain unchanged. GitHub Actions will call them instead of Vercel.

## Security

- ✅ CRON_SECRET validates all requests
- ✅ Secrets stored securely in GitHub
- ✅ HTTPS encryption for all API calls
- ✅ No secrets exposed in logs or code

## Troubleshooting

### Test Locally

Test your cron endpoints locally:

```bash
# Test recommendations
curl -X GET "http://localhost:3000/api/cron/recommendations" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test reminders
curl -X GET "http://localhost:3000/api/cron/reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Check Vercel Logs

If emails aren't sending:
1. Go to Vercel dashboard
2. Select your project
3. Click **Logs** tab
4. Filter by `/api/cron/` to see execution logs

## Next Steps

1. ✅ Add GitHub Secrets (`APP_URL` and `CRON_SECRET`)
2. ✅ Push workflow files to GitHub
3. ✅ Test with manual workflow trigger
4. ✅ Monitor first scheduled run
5. ✅ Remove Vercel Cron (optional, to save costs)
6. ✅ Add RESEND_API_KEY to Vercel if not already set

## Support

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cron Expression Reference](https://crontab.guru/)
- [GitHub Actions Pricing](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
