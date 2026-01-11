# Patch Notes Subscription - Admin Guide

## Overview

Users can now subscribe to receive patch notes and platform updates. This feature allows you (as admin) to collect emails of interested users and send them announcements manually from your personal email.

## How It Works

### For Users
1. Click the bell icon (🔔) in the header
2. Toggle "Patch Notes & Updates" checkbox
3. Save preferences
4. User is now subscribed

### For Admins

#### Viewing Subscribers

1. Log in as admin
2. Navigate to Admin Panel
3. Click "Patch Notes Subscribers" in the sidebar
4. View complete list of opted-in users

#### Sending Announcements

**Method 1: Copy Individual Emails**
- Click the copy icon next to any email address
- Email is copied to clipboard
- Use in your email client

**Method 2: Bulk Copy (Recommended)**
- Click "Copy All Emails" button at the top
- All subscriber emails copied as comma-separated list
- Paste into BCC field of your email client

**Method 3: Direct mailto Link**
- Click "Email" button next to any subscriber
- Opens your default email client with recipient pre-filled

## Sending Your First Patch Notes

### Step-by-Step

1. **Access Subscriber List**
   - Go to `/admin/patchnotes`
   - Review current subscribers

2. **Copy Emails**
   - Click "Copy All Emails"
   - Emails copied: `user1@rice.edu, user2@rice.edu, ...`

3. **Compose Email**
   - Open Gmail/Outlook/your email client
   - Create new email
   - Paste emails in **BCC field** (for privacy)
   - Subject: e.g., "Rice Events v0.6.0 - New Features!"
   
4. **Write Content**
   Example template:
   ```
   Hi Rice Events community!

   We're excited to announce Rice Events v0.6.0 with the following updates:

   🎉 New Features:
   - Feature 1
   - Feature 2
   - Feature 3

   🐛 Bug Fixes:
   - Fix 1
   - Fix 2

   💡 Improvements:
   - Improvement 1
   - Improvement 2

   Check out the full changelog: [link]

   Best,
   [Your Name]
   Rice Events Team
   ```

5. **Send**
   - Double-check BCC field (not TO or CC)
   - Send email

## Admin Panel Features

### Subscriber Table Columns
- **Name**: User's full name
- **Username**: User's @username
- **Email**: Email address (with copy button)
- **Subscribed On**: When they opted in
- **Actions**: Quick email button

### Search & Filter
- Search bar searches across name, username, and email
- Real-time filtering
- Shows result count

### Statistics
- Total subscriber count
- Purple badge display
- Updates in real-time

## Best Practices

### When to Send
- Major version releases (v0.x.0, v1.0.0)
- Significant new features
- Important announcements
- Monthly/quarterly updates

### When NOT to Send
- Minor bug fixes (patch versions)
- Internal changes
- Too frequently (max once per week)

### Email Guidelines
1. **Use BCC**: Never use TO or CC for privacy
2. **Keep it Brief**: Bullet points work best
3. **Add Links**: Link to full changelog or blog post
4. **Personalize**: Write from your personal email for authenticity
5. **Proofread**: Check spelling and links before sending

### Privacy
- Always use BCC (not TO or CC)
- Don't share subscriber list
- Users can unsubscribe anytime via the bell icon
- Respect user preferences

## Technical Details

### Database
- Subscription stored in: `user.emailSubscriptions.patchNotes`
- Query finds all users where `patchNotes: true`
- Sorted by creation date (newest first)

### API Endpoint
```
GET /api/admin/patchnotes-subscribers
Authorization: Bearer <admin_token>
```

Returns:
```json
{
  "success": true,
  "count": 42,
  "subscribers": [...]
}
```

### Security
- Admin-only endpoint (checked via JWT + isAdmin flag)
- Non-admins receive 403 Forbidden
- Unauthorized requests receive 401

## Troubleshooting

### "No subscribers yet"
- Users need to manually opt in
- Promote the feature in announcements
- Add callout on homepage/events

### "Admin access required"
- Ensure you're logged in as admin
- Check `isAdmin: true` in your user document
- Re-login if needed

### Emails not copying
- Try different browser (Chrome/Firefox/Safari)
- Check clipboard permissions
- Use individual copy buttons instead

## Future Enhancements

Potential future features:
- Draft and preview emails in admin panel
- Schedule sending for specific date/time
- Email templates with rich formatting
- Track open rates and engagement
- Automated changelog email generation
- Segment subscribers (all users vs active users)

---

**Questions?** Check EMAIL_SUBSCRIPTION.md for full system documentation.
