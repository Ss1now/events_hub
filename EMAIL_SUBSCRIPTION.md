# Email Subscription System - Rice Events

This document explains how the email subscription system works and how to set up email notifications for users.

## Overview

The email subscription system allows users to receive four types of email notifications:

1. **Event Recommendations** - Personalized event suggestions based on user interests
2. **Event Reminders** - Notifications before events they're attending (24h and 1h before)
3. **Event Updates** - Alerts when hosts modify events they're interested in
4. **Patch Notes & Updates** - Major feature updates and platform improvements (manual by admin)

## User Interface

### Subscription Management

Users can manage their email preferences by clicking the bell icon (🔔) in the header next to the Profile button.

The subscription modal allows users to:
- Toggle each notification type on/off
- Choose recommendation frequency (daily or weekly)
- View privacy information

### Notification Types

#### 1. Event Recommendations
- **Frequency**: Daily or Weekly (user choice)
- **Content**: 3-5 personalized event suggestions
- **Algorithm**: Based on user's past RSVP'd and interested events
- **Trigger**: Scheduled cron job

#### 2. Event Reminders
- **Frequency**: Per event (24h before + 1h before)
- **Content**: Event details with time, location, description
- **Trigger**: Scheduled cron job checks hourly
- **Condition**: User must have RSVP'd to the event

#### 3. Event Updates
- **Frequency**: Immediate (when host edits event)
- **Content**: Updated event details + summary of changes
- **Trigger**: When host saves event edits
- **Condition**: User RSVP'd or showed interest in the event

#### 4. Patch Notes & Updates
- **Frequency**: Manual (when major features are released)
- **Content**: Platform updates, new features, improvements
- **Trigger**: Manual by admin from personal email
- **Admin Panel**: View all opted-in subscribers at `/admin/patchnotes`
- **Workflow**: Admin copies subscriber emails and sends announcement manually

## Database Schema

### User Model Updates

```javascript
emailSubscriptions: {
  recommendations: Boolean,  // Default: false
  reminders: Boolean,        // Default: false
  updates: Boolean,          // Default: false
  patchNotes: Boolean,       // Default: false
  frequency: String          // 'daily' or 'weekly', Default: 'weekly'
}
```

### Email Queue Model (New)

```javascript
{
  userId: ObjectId,          // Reference to user
  email: String,             // User's email address
  emailType: String,         // 'recommendation', 'reminder', 'update'
  eventId: ObjectId,         // Reference to event (for reminders/updates)
  eventData: Object,         // Event details (for recommendations)
  scheduledFor: Date,        // When to send the email
  sent: Boolean,             // Whether email has been sent
  sentAt: Date,              // Timestamp of when sent
  error: String,             // Error message if send failed
  metadata: Object           // Additional data (changes summary, etc.)
}
```

## API Endpoints

### Email Subscription Management

#### GET /api/email-subscription
Get user's current email subscription preferences.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "subscriptions": {
    "recommendations": false,
    "reminders": true,
    "updates": true,
    "frequency": "weekly"
  }
}
```

#### POST /api/email-subscription
Update user's email subscription preferences.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "recommendations": true,
  "reminders": true,
  "updates": true,
  "frequency": "daily"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "Email preferences updated successfully",
  "subscriptions": { ... }
}
```

### Email Sending (Internal API)

#### POST /api/email/send

Send emails based on type. This endpoint is called by cron jobs or internal triggers.

**Body for Recommendations:**
```json
{
  "action": "send-recommendations"
}
```

**Body for Reminders:**
```json
{
  "action": "send-reminder",
  "eventId": "event_id_here"
}
```

**Body for Updates:**
```json
{
  "action": "send-update",
  "eventId": "event_id_here",
  "changes": "Time changed from 7pm to 8pm"
}
```

## Email Templates

All emails use professional HTML templates with:
- Rice Events branding (purple theme)
- Responsive design for mobile and desktop
- Clear call-to-action buttons
- Unsubscribe/manage preferences links
- Consistent footer with copyright

### Template Features

1. **Recommendations Email**
   - List of 3-5 events with images
   - Event cards showing date, time, location, description preview
   - "View Event" buttons for each event
   - Personalized greeting

2. **Reminder Email**
   - Countdown notice (24h or 1h)
   - Full event details
   - Date formatted as "Friday, January 12, 2026"
   - Yellow alert banner
   - Single "View Event Details" button

3. **Update Email**
   - Blue update banner
   - Updated event information
   - Changes summary highlighted in yellow box
   - "View Updated Event" button

## Setting Up Email Delivery

### Using Resend (Recommended)

1. **Sign up for Resend**
   - Go to https://resend.com
   - Create an account
   - Get your API key

2. **Add API Key to Environment**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

3. **Configure Domain (Production)**
   - Add your domain in Resend dashboard
   - Add DNS records (SPF, DKIM, DMARC)
   - Verify domain
   - Update sender email in `/app/api/email/send/route.js`:
     ```javascript
     from: 'Rice Events <noreply@yourdomain.com>'
     ```

### Development Mode

If `RESEND_API_KEY` is not set, emails will be logged to console instead of sent.

## Scheduling Email Jobs

You need to set up cron jobs to trigger automated emails:

### 1. Event Recommendations

**Daily Schedule (for users with frequency: 'daily'):**
```bash
0 9 * * * curl -X POST http://your-domain.com/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"action":"send-recommendations"}'
```

**Weekly Schedule (for users with frequency: 'weekly'):**
```bash
0 9 * * 1 curl -X POST http://your-domain.com/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"action":"send-recommendations"}'
```

### 2. Event Reminders

**Hourly Check (finds events starting in 24h or 1h):**
```bash
0 * * * * node scripts/send-reminders.js
```

Create `scripts/send-reminders.js`:
```javascript
const fetch = require('node-fetch');
const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function sendReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in1h = new Date(now.getTime() + 60 * 60 * 1000);

  // Find events starting in 24h or 1h
  // Query your database and call /api/email/send for each event
  
  // Example:
  const events = await findEventsStartingBetween(in24h, in1h);
  
  for (const event of events) {
    await fetch(`${baseURL}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-reminder',
        eventId: event._id
      })
    });
  }
}

sendReminders();
```

### 3. Event Updates

These are triggered automatically when a host edits an event. No cron job needed.

## Using Vercel Cron (Production)

If deploying to Vercel, you can use Vercel Cron instead of system cron jobs:

1. Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/recommendations",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/cron/reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

2. Create cron API routes at:
   - `/app/api/cron/recommendations/route.js`
   - `/app/api/cron/reminders/route.js`

## Testing

### Test Email Subscription
1. Log in to the app
2. Click the bell icon in header
3. Enable all notification types
4. Click "Save Preferences"
5. Check database to verify `emailSubscriptions` field updated

### Test Recommendation Email
```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"action":"send-recommendations"}'
```

### Test Reminder Email
```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"action":"send-reminder","eventId":"YOUR_EVENT_ID"}'
```

### Test Update Email
1. Create an event
2. RSVP to the event (or show interest)
3. Enable "Event Updates" in email preferences
4. Edit the event as the host
5. Check email inbox

## Admin Panel - Patch Notes Subscribers

Admins can view all users who opted in to receive patch notes at `/admin/patchnotes`.

### Features

- **Subscriber List**: View all users subscribed to patch notes
- **User Information**: Name, username, email, subscription date
- **Search & Filter**: Search by name, username, or email
- **Quick Actions**:
  - Copy individual email addresses
  - "Copy All Emails" button for bulk communication
  - Direct mailto links for each subscriber
- **Manual Workflow**: Admin sends update emails from personal email client

### How to Send Patch Notes

1. Navigate to `/admin/patchnotes`
2. Click "Copy All Emails" to copy all subscriber emails
3. Open your personal email client (Gmail, Outlook, etc.)
4. Create a new email with patch notes content
5. Paste subscriber emails in BCC field (for privacy)
6. Send the announcement

**Why Manual?**
- Personal touch from admin
- Flexibility in email content and formatting
- No automated email limits
- Direct from admin's verified email address
- Easy to customize per release

### API Endpoint

**GET /api/admin/patchnotes-subscribers** (Admin only)

Returns all users who subscribed to patch notes.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 42,
  "subscribers": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john.doe@rice.edu",
      "username": "johndoe",
      "createdAt": "2026-01-11T..."
    }
  ]
}
```

## Privacy & Unsubscribe

Users can manage their preferences at any time by:
1. Clicking the bell icon in the header
2. Toggling notifications on/off
3. Clicking "Manage preferences" link in any email footer

All emails include:
- Link to manage preferences
- Clear explanation of why they received the email
- Privacy note about not sharing data with third parties

## Troubleshooting

### Emails not sending

1. **Check RESEND_API_KEY is set**
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Check console logs**
   - Development: emails logged to console
   - Production: check server logs for errors

3. **Verify user has subscription enabled**
   - Check `emailSubscriptions` field in user document

4. **Check email queue**
   - Query `emailQueue` collection for pending emails
   - Look for `error` field in failed emails

### Wrong sender address

Update sender in `/app/api/email/send/route.js`:
```javascript
from: 'Rice Events <noreply@eventsrice.com>'
```

### Domain not verified

- Add DNS records in your domain provider
- Wait for DNS propagation (up to 48 hours)
- Verify in Resend dashboard

## Performance Considerations

- Emails are sent asynchronously (non-blocking)
- Failed emails are logged but don't break the flow
- Batch processing for recommendations (all users at once)
- Individual processing for reminders and updates
- Consider rate limits of your email provider (Resend: 100 emails/second on paid plans)

## Future Enhancements

- Email preview before subscribing
- More granular preferences (per event category)
- Digest emails (weekly summary of all new events)
- SMS notifications option
- Push notifications (web and mobile)
- A/B testing email templates
- Analytics dashboard (open rates, click rates)
