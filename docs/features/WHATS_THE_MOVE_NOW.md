# What's the Move Now - Feature Documentation

## Overview
"What's the Move Now" is a time-limited comment section for pub/public events that activates after the event ends. It allows attendees to share where they're heading next and see afterparty plans.

## Key Features

### 1. Anonymous Comments
- Users can choose to post anonymously when sharing their next move
- Anonymous posts display as "Anonymous" with a 🎭 mask icon
- Non-anonymous posts show the user's username

### 2. 5-Hour Time Window
- Section becomes available when a pub/public event ends (status = 'past')
- Automatically expires 5 hours after the event's endDateTime
- Shows countdown timer: "Xh Xm remaining" or "Xm Xs remaining"
- After expiry, section displays "This section has expired" message

### 3. Email Notifications
When a pub/public event ends, emails are sent to:
- Users who clicked "I'm going" (interestedUsers)
- Users who rated the event live

**Email Contents:**
- Event details and location
- Call to action: Rate the event
- Call to action: Check What's the Move Now
- Urgency message: 5-hour time limit
- Link to event page

## Technical Implementation

### Database Schema (blogmodel.js)
```javascript
moveNowComments: [{
    user: ObjectId,          // Null for anonymous
    username: String,         // "Anonymous" or actual username
    comment: String,
    isAnonymous: Boolean,
    timestamp: Date
}],
moveNowExpiresAt: Date,      // endDateTime + 5 hours
endNotificationSent: Boolean,
endNotificationTime: Date
```

### API Routes

#### POST /api/move-now
- Add a comment to What's the Move Now
- Requires authentication (JWT token)
- Supports anonymous option
- Validates event is past and within 5-hour window
- Sets moveNowExpiresAt on first comment

#### GET /api/move-now?eventId=xxx
- Fetch all comments for an event
- Returns: comments, expiresAt, timeRemaining, hasExpired, available
- No authentication required (public read)

#### GET /api/check-ended
- Cron job endpoint (called every 5 minutes)
- Finds newly ended pub/public events
- Sends email notifications
- Sets moveNowExpiresAt timestamp
- Marks endNotificationSent = true

### Components

#### WhatsMoveNow.jsx
- Client component with real-time updates
- Auto-refreshes comments every 30 seconds
- Countdown timer updates every second
- Anonymous toggle checkbox
- Comment form with validation
- Comment list with timestamps

### Email Service

#### sendEventEndedEmail.js
- Uses Resend API (noreply@riceparties.com)
- HTML email with gradient design
- Event details, rating prompt, What's the Move Now info
- Urgency messaging about 5-hour limit

### Cron Jobs

**vercel.json:**
```json
{
  "path": "/api/check-ended",
  "schedule": "*/5 * * * *"
}
```

**Frequency:** Every 5 minutes

**Authorization:** Requires `Bearer ${CRON_SECRET}` header

## User Flow

1. **Event Ends** (status changes to 'past')
2. **Cron Job Triggers** (every 5 minutes)
   - Finds newly ended pub/public events
   - Sends emails to interested users and raters
   - Sets moveNowExpiresAt = endDateTime + 5 hours
   - Marks endNotificationSent = true
3. **User Opens Email**
   - Clicks link to event page
4. **User Sees What's the Move Now Section**
   - Sees countdown timer
   - Can post comments (with anonymous option)
   - Sees other users' comments
5. **5 Hours Pass**
   - Section expires
   - Shows "This section has expired" message
   - No new comments allowed
   - Existing comments remain visible

## Display Logic

### Event Detail Page (blogs/[id]/page.jsx)
- **Live pub/public events:** Show LiveMetrics, LiveFeedbackForm, LiveComments
- **Past pub/public events:** Show WhatsMoveNow component
- **Regular events:** Show standard review/rating system

### Visibility Rules
- Only visible for pub/public events (publicEventType = 'pub' or 'public')
- Only visible when status = 'past'
- Shows time remaining until expiration
- After 5 hours, shows expired message but keeps comments visible

## Testing

### Manual Testing
1. Create a pub or public event
2. Set endDateTime to past time
3. Run status update to mark event as 'past'
4. Trigger cron manually:
   ```bash
   curl -X GET http://localhost:3000/api/check-ended \
     -H "Authorization: Bearer ${CRON_SECRET}"
   ```
5. Check email delivery
6. Visit event page and verify What's the Move Now appears
7. Test posting comments (anonymous and non-anonymous)
8. Verify 5-hour expiration logic

### Environment Variables Required
```env
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
CRON_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

## Integration Points

### Related Features
- **Peak Notifications:** Separate system for live events reaching PEAK
- **Live Metrics:** Shows during live events for pub/public
- **Live Comments:** Different from What's the Move Now (for during event)
- **Event Reviews:** Standard rating system for all past events

### Email Service
- Uses same Resend setup as peak notifications
- Same sender: noreply@riceparties.com
- Similar email template design with gradient styling

## Future Enhancements
- Comment reactions/likes
- Reply threads
- Location sharing with map integration
- Image attachments for afterparty updates
- Push notifications when new moves are posted
- Moderation tools for inappropriate content
