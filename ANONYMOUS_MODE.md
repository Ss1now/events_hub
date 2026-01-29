# Anonymous User Functionality

## Overview
The site now allows all users to interact with events without creating an account. Users can post events, rate, review, RSVP, and comment completely anonymously.

## Changes Made

### 1. Frontend Components

#### components/blogitem.jsx
- ✅ Removed login check from `handleInterested()`
- ✅ Removed login check from `handleReserve()`
- ✅ Removed login check from `handleSubmitRating()`
- ✅ All functions now work with optional token

#### components/WhatsMoveNow.jsx
- ✅ Removed login check from comment posting

#### components/LiveRatingButton.jsx
- ✅ Removed login check from `handleOpenModal()`
- ✅ Removed login check from `handleSubmit()`
- ✅ Optional token support added

#### components/RatingPopup.jsx
- ✅ Removed login check from `handleSubmit()`
- ✅ Optional token support added

#### app/blogs/[id]/page.jsx (Event Detail Page)
- ✅ Removed login check from `handleInterested()`
- ✅ Removed login check from `handleReserve()`

#### app/me/postevent/page.jsx (Event Creation Page)
- ✅ Removed initial login check in `useEffect()`
- ✅ Removed login check from form submission

### 2. Backend API Routes

#### app/api/blog/route.js (POST - Create Event)
- ✅ Made authentication optional
- ✅ `authorId` can now be null for anonymous events
- ✅ User data fetched only if token present

#### app/api/blog/route.js (PATCH - Interested/Reserve)
- ✅ Made authentication optional
- ✅ Anonymous users increment `anonymousInterestedCount`
- ✅ Anonymous users increment `anonymousReservedCount`
- ✅ Logged-in users tracked individually in arrays
- ✅ Total counts combine both logged-in and anonymous users
- ✅ Anonymous "interested" always increments (no toggle)
- ✅ Capacity checks include anonymous reservations

#### app/api/rating/route.js (POST - Submit Review)
- ✅ Made authentication optional
- ✅ Anonymous reviews allowed with userName: "Anonymous"
- ✅ RSVP requirement check only for logged-in users
- ✅ Duplicate rating check only for logged-in users
- ✅ `userId` can be null in ratings array

#### app/api/live-rating/route.js (POST - Live Rating)
- ✅ Made authentication optional
- ✅ Anonymous ratings stored in `anonymousLiveRatings` array
- ✅ RSVP requirement check only for logged-in users
- ✅ Average calculation includes both logged-in and anonymous ratings
- ✅ Logged-in users can still update their ratings
- ✅ Anonymous users create new ratings each time

### 3. Database Schema

#### lib/models/blogmodel.js
- ✅ `authorId` field: `required: false` (allows null)
- ✅ New field: `anonymousInterestedCount` (Number, default: 0)
- ✅ New field: `anonymousReservedCount` (Number, default: 0)
- ✅ New field: `anonymousLiveRatings` (Array of {rating, timestamp})

## How It Works

### Anonymous vs Logged-In Users

| Feature | Anonymous User | Logged-In User |
|---------|---------------|----------------|
| **Post Event** | ✅ Yes, but no edit/delete | ✅ Yes, can edit/delete |
| **"I'm Going"** | ✅ Counter increments | ✅ Tracked individually, can toggle |
| **RSVP** | ✅ Counter increments | ✅ Tracked individually |
| **Live Rating** | ✅ New rating each time | ✅ Can update rating |
| **Review** | ✅ Shows as "Anonymous" | ✅ Shows user name |
| **What's Move Now** | ✅ Can comment | ✅ Can comment |
| **My Events** | ❌ No tracking | ✅ Tracked in profile |
| **Duplicate Prevention** | ❌ Can rate multiple times | ✅ One rating per event |

### Data Storage

**Logged-In Users:**
- `interestedUsers: [userId1, userId2, ...]`
- `reservedUsers: [userId1, userId2, ...]`
- `liveRatings: [{userId, rating, timestamp}, ...]`
- `ratings: [{userId, userName, rating, comment, images}, ...]`

**Anonymous Users:**
- `anonymousInterestedCount: 15`
- `anonymousReservedCount: 8`
- `anonymousLiveRatings: [{rating, timestamp}, {rating, timestamp}, ...]`
- `ratings: [{userId: null, userName: "Anonymous", rating, comment, images}, ...]`

### Display Counts

All counts now combine both logged-in and anonymous data:

```javascript
// Total interested
const totalInterested = (event.interestedUsers?.length || 0) + (event.anonymousInterestedCount || 0);

// Total reserved
const totalReserved = (event.reservedUsers?.length || 0) + (event.anonymousReservedCount || 0);

// Total live ratings
const totalLiveRatings = (event.liveRatings?.length || 0) + (event.anonymousLiveRatings?.length || 0);

// Average live rating
const sumLoggedIn = event.liveRatings.reduce((sum, r) => sum + r.rating, 0);
const sumAnonymous = event.anonymousLiveRatings.reduce((sum, r) => sum + r.rating, 0);
const average = (sumLoggedIn + sumAnonymous) / totalLiveRatings;
```

## User Experience

### No Authentication Barriers
- No "Please login" toast messages
- No redirects to `/login`
- No "guest mode" labels or UI indicators
- Functions normally as if logged in

### Limitations for Anonymous Users
1. **Cannot Edit/Delete**: Anonymous events and ratings are permanent
2. **No Toggle**: Cannot remove "interested" or change reservation
3. **No Profile Tracking**: Cannot see "my events" or "my ratings"
4. **No Duplicate Prevention**: Can submit multiple ratings (intentional for anonymity)
5. **No Email Notifications**: Event updates only sent to logged-in interested users

### Benefits
1. **Zero Friction**: Instant usage without sign-up
2. **Privacy**: No account required to participate
3. **Viral Growth**: Easy sharing on Fizz and social media
4. **Inclusive**: All Rice students can discover and rate events

## Technical Notes

### Token Handling
All API endpoints check for optional token:
```javascript
const authHeader = request.headers.get('authorization');
let userId = null;

if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch (error) {
        console.log('Invalid token, treating as anonymous');
    }
}
```

### Capacity Management
RSVP capacity checks include anonymous reservations:
```javascript
const totalReserved = (event.reservedUsers?.length || 0) + (event.anonymousReservedCount || 0);
if (totalReserved >= event.capacity) {
    return NextResponse.json({ success: false, msg: 'Event has reached capacity' });
}
```

### Data Integrity
- Anonymous counters are append-only (no decrement)
- Logged-in users maintain full CRUD functionality
- Database handles both null and valid ObjectId for `authorId`
- All existing events remain functional (default values: 0)

## Migration Notes

### Existing Data
- All existing events work as-is
- New fields have default values (0 or empty arrays)
- No database migration required
- Backward compatible with all existing code

### Future Considerations
1. **Spam Prevention**: May need rate limiting for anonymous submissions
2. **Analytics**: Track anonymous vs logged-in usage
3. **Moderation**: Admin tools to manage anonymous content
4. **Conversion**: Encourage anonymous users to create accounts
5. **Email Collection**: Optional email for anonymous event creators

## Testing Checklist

- [ ] Anonymous user can create event
- [ ] Anonymous user can click "I'm going"
- [ ] Anonymous user can RSVP
- [ ] Anonymous user can submit live rating
- [ ] Anonymous user can submit review
- [ ] Anonymous user can post What's Move Now comment
- [ ] Logged-in user functionality unchanged
- [ ] Counts display correctly (logged-in + anonymous)
- [ ] Capacity limits work with anonymous RSVPs
- [ ] No "login required" messages appear
- [ ] Event detail page shows total counts
- [ ] Event cards show total counts

## Deployment

No special deployment steps needed. All changes are backward compatible.

Server starts successfully with:
```
✓ Ready in 416ms
```

All authentication-related changes gracefully degrade to anonymous mode.
