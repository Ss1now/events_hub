# 🧪 Complete Testing Guide - Rice Events Hub

This guide covers **every feature** in your application with step-by-step testing instructions.

---

## 📋 Pre-Testing Setup

### 1. **Create Test Accounts**
You'll need at least 3 accounts for comprehensive testing:
- **Admin account** (manually set `isAdmin: true` in MongoDB)
- **User 1** (event creator/host)
- **User 2** (attendee/co-host)

### 2. **Access Points**
- **Local:** `http://localhost:3000`
- **Live:** `https://events-qz5wrt1e5-howards-projects-16e60ac8.vercel.app`

---

## 🎫 Event Management Testing

### ✅ Test 1: Create Event (No RSVP Required)
**Path:** Profile → Create event button

**Steps:**
1. Click "Create event" in header or profile
2. Fill out form:
   - Title: "Test Party at Jones"
   - Description: "A fun gathering"
   - Event Type: "Social" (or custom text)
   - Location: "Jones Commons"
   - Start: Tomorrow 7:00 PM
   - End: Tomorrow 10:00 PM
   - RSVP Required: **OFF**
   - Upload 1-3 images
3. Click "Create Event"
4. Verify: EventCreatedModal appears
5. Click "View Event Details"

**Expected Results:**
- ✅ Event created successfully
- ✅ Images uploaded to Cloudinary (check Cloudinary dashboard)
- ✅ Event appears on homepage in "Upcoming" tab
- ✅ Event status = "future"
- ✅ Your profile shows event under "Events I Host"

---

### ✅ Test 2: Create Event (With RSVP)
**Path:** Profile → Create event

**Steps:**
1. Create event with same details as Test 1
2. Toggle "RSVP Required" to **ON**
3. Set capacity: 20
4. Set RSVP deadline: Tomorrow 5:00 PM
5. Submit

**Expected Results:**
- ✅ Event shows "RSVP" button (not "I'm Going")
- ✅ Shows "0/20 spots reserved"
- ✅ RSVP deadline displayed
- ✅ Capacity tracker visible

---

### ✅ Test 3: Edit Event (Future Event)
**Path:** Profile → Events I Host → Edit button

**Steps:**
1. Click "Edit" on a future event
2. Change title to "Updated: [Original Title]"
3. Change description
4. Upload new images (replace old ones)
5. Change end time to 2 hours later
6. Save changes

**Expected Results:**
- ✅ Event updated successfully
- ✅ Old images deleted from Cloudinary
- ✅ New images uploaded to Cloudinary
- ✅ All interested/RSVP'd users receive notification
- ✅ EventUpdateNotification popup appears for affected users

---

### ✅ Test 4: Edit Live Event
**Path:** Create event starting NOW, then edit it

**Steps:**
1. Create event: Start = now, End = 2 hours from now
2. Wait for event to go live (refresh page)
3. Verify status badge shows "Happening Now"
4. Edit the event (change description)
5. Save

**Expected Results:**
- ✅ Live event can be edited
- ✅ Notifications sent to interested users
- ✅ Status remains "Happening Now"

---

### ✅ Test 5: Cannot Edit Past Event
**Steps:**
1. Go to a past event (or wait for test event to end)
2. Check profile → Events I Host
3. Verify no "Edit" button on past events

**Expected Results:**
- ✅ Edit button hidden for past events
- ✅ Delete button still available

---

### ✅ Test 6: Delete Event
**Path:** Profile → Events I Host → Delete

**Steps:**
1. Click delete on any event
2. Confirm deletion
3. Check Cloudinary dashboard

**Expected Results:**
- ✅ Event removed from database
- ✅ Images deleted from Cloudinary
- ✅ Event removed from all users' interested/reserved lists
- ✅ Confirmation toast appears

---

### ✅ Test 7: Search & Filter Events
**Path:** Homepage

**Steps:**
1. Create 3 events with different statuses (past, live, future)
2. Test search bar: type "jones"
3. Click "Upcoming" filter
4. Click "Happening Now" filter
5. Click "Past" filter
6. Search by location, type, host name

**Expected Results:**
- ✅ Search filters events in real-time
- ✅ Status filters show correct events
- ✅ Search works across title, location, type, host

---

## 👥 User Interaction Testing

### ✅ Test 8: Mark Interest (No RSVP Event)
**Path:** Event detail page → "I'm Going" button

**Steps:**
1. Log in as User 2
2. Find an event (no RSVP required)
3. Click "I'm Going"
4. Check SuccessModal appears
5. Click "Add to Google Calendar"
6. Click "Download ICS file"
7. Go to profile → "Going" tab

**Expected Results:**
- ✅ SuccessModal with calendar options
- ✅ Google Calendar link works
- ✅ ICS file downloads with event details
- ✅ Event appears in "Going" tab
- ✅ Can click "Cancel Interest" to remove

---

### ✅ Test 9: RSVP to Event
**Path:** Event detail page → "RSVP" button

**Steps:**
1. Log in as User 2
2. Find event requiring RSVP (before deadline)
3. Click "RSVP"
4. Verify capacity counter updates
5. Go to profile → "Going" tab
6. Click "Cancel RSVP"

**Expected Results:**
- ✅ RSVP confirmed message
- ✅ Counter shows "1/20 spots reserved"
- ✅ Event in "Going" tab
- ✅ Cancel RSVP works
- ✅ Counter decrements

---

### ✅ Test 10: RSVP After Deadline
**Steps:**
1. Create event with RSVP deadline in the past
2. Try to RSVP

**Expected Results:**
- ✅ "RSVP Closed" badge shown
- ✅ RSVP button disabled
- ✅ Error message if button clicked

---

### ✅ Test 11: RSVP at Capacity
**Steps:**
1. Create event with capacity = 1
2. RSVP as User 2
3. Log in as User 3
4. Try to RSVP

**Expected Results:**
- ✅ "Event Full" message
- ✅ RSVP button disabled
- ✅ Shows "1/1 spots reserved"

---

## ⭐ Rating System Testing

### ✅ Test 12: Live Rating (No RSVP Event)
**Path:** Live event card → "Rate Live Event" button

**Steps:**
1. Create event starting NOW (no RSVP required)
2. As User 2, find the live event
3. Click gold "Rate Live Event" button
4. Select 4 stars
5. Click "Submit Rating"
6. Try to rate again

**Expected Results:**
- ✅ Live rating modal opens
- ✅ Rating submitted successfully
- ✅ Event card shows average rating (gold/amber theme)
- ✅ Can update rating anytime during event
- ✅ Average recalculates correctly

---

### ✅ Test 13: Live Rating (RSVP Event - Not Reserved)
**Steps:**
1. Create live event requiring RSVP
2. As User 2 (without RSVP), try to rate

**Expected Results:**
- ✅ "Only reserved users can rate" error
- ✅ Rating modal doesn't submit

---

### ✅ Test 14: Live Rating (RSVP Event - Reserved)
**Steps:**
1. Create live event requiring RSVP
2. RSVP as User 2
3. Rate the event 5 stars

**Expected Results:**
- ✅ Rating accepted
- ✅ Average displayed on card

---

### ✅ Test 15: Post-Event Review (Automatic Popup)
**Path:** Automatically appears after event ends

**Steps:**
1. Create event ending in 2 minutes
2. Mark interest or RSVP
3. Wait for event to end
4. Visit homepage
5. Wait 2 seconds

**Expected Results:**
- ✅ RatingPopup appears automatically
- ✅ Shows event title and details
- ✅ Can skip or rate now
- ✅ Skipping prevents future popups for this event

---

### ✅ Test 16: Post-Event Review (Manual)
**Path:** Past event detail page → "Submit Review" section

**Steps:**
1. Go to past event you attended
2. Scroll to "Submit Review" section
3. Select 5 stars
4. Add comment: "Great event!"
5. Upload 2 images
6. Click "Submit Review"
7. Check review appears on event page

**Expected Results:**
- ✅ Review submitted successfully
- ✅ Images uploaded to Cloudinary (reviews folder)
- ✅ Review displays with stars, comment, images
- ✅ Average rating calculated
- ✅ Event shows in profile → "Past Events"

---

### ✅ Test 17: Edit Review
**Path:** Event detail page → Your review → Edit button

**Steps:**
1. Find an event you've reviewed
2. Scroll to your review
3. Click "Edit" button
4. Change rating from 5 to 4 stars
5. Update comment: "Updated review"
6. Remove one existing image
7. Add one new image
8. Click "Update Review"

**Expected Results:**
- ✅ Edit button only appears on YOUR reviews
- ✅ Review form pre-fills with existing data
- ✅ Existing images shown separately
- ✅ Can remove existing images individually
- ✅ Can add new images
- ✅ Review updates successfully
- ✅ "(edited)" label appears on review
- ✅ Old images deleted from Cloudinary
- ✅ New images uploaded
- ✅ Average rating recalculated

---

### ✅ Test 18: Review Duplicate Prevention
**Steps:**
1. Submit a review for an event
2. Try to submit another review
3. Check localStorage
4. Dismiss rating popup, reload page

**Expected Results:**
- ✅ "Already rated" error message
- ✅ Rating popup doesn't show again
- ✅ localStorage tracks dismissed events

---

### ✅ Test 19: Host Cannot Rate Own Event
**Steps:**
1. As event creator, go to your past event
2. Try to submit review

**Expected Results:**
- ✅ No review form shown
- ✅ Message: "Hosts cannot rate their own events"

---

## 🤝 Co-hosting System Testing

### ✅ Test 20: Auto-Generated Username
**Path:** Register new account → Check profile

**Steps:**
1. Register with email: john.doe@rice.edu
2. Go to profile
3. Check Personal Information section

**Expected Results:**
- ✅ Username auto-generated: "johndoe" or "johndoe1"
- ✅ Username is unique
- ✅ Displayed as @johndoe

---

### ✅ Test 21: Edit Username
**Path:** Profile → Edit username field

**Steps:**
1. Click "Edit" on Personal Information
2. Change username to "testuser123"
3. Save
4. Try username with spaces/special chars
5. Try existing username

**Expected Results:**
- ✅ Valid username saves successfully
- ✅ Invalid characters rejected
- ✅ Duplicate usernames rejected
- ✅ Live validation feedback

---

### ✅ Test 22: Invite Co-host
**Path:** Profile → Events I Host → "Invite Co-host"

**Steps:**
1. As User 1, create a future event
2. Click "Invite Co-host" button
3. Search by username: "@testuser"
4. Search by email: "user2@rice.edu"
5. Select User 2 from results
6. Click "Send Invitation"

**Expected Results:**
- ✅ Search finds users by username AND email
- ✅ Case-insensitive search
- ✅ Invitation sent successfully
- ✅ Toast confirmation

---

### ✅ Test 23: Accept Co-host Invitation
**Path:** Profile → Co-host Invitations section

**Steps:**
1. Log in as User 2
2. Check for notification popup (30s polling)
3. Go to profile
4. See invitation in "Co-host Invitations"
5. Click "Accept"

**Expected Results:**
- ✅ CohostInvitationNotification popup appears
- ✅ Shows inviter name and event title
- ✅ Can "Accept", "Decline", or "View Event"
- ✅ Accepting adds you as co-host
- ✅ Event appears in "Events I Host"
- ✅ Invitation removed from pending

---

### ✅ Test 24: Decline Co-host Invitation
**Steps:**
1. Get invited as co-host
2. Click "Decline" in notification

**Expected Results:**
- ✅ Invitation status = "declined"
- ✅ Removed from pending list
- ✅ NOT added to event co-hosts

---

### ✅ Test 25: Co-host Edit Permissions
**Path:** Profile → Events I Host → Edit co-hosted event

**Steps:**
1. As co-host, go to co-hosted event
2. Click "Edit"
3. Make changes and save

**Expected Results:**
- ✅ Co-host can edit event
- ✅ Same permissions as original host
- ✅ Cannot remove original host
- ✅ Notifications sent to attendees

---

### ✅ Test 26: Co-host Display
**Path:** Event card and detail page

**Steps:**
1. View event with co-hosts
2. Check event card
3. Check event detail page

**Expected Results:**
- ✅ Shows "Hosted by [Name] • Co-hosts: @user1, @user2"
- ✅ Purple theme for co-host usernames
- ✅ Clickable usernames (if profile links added)

---

## 🔔 Notification System Testing

### ✅ Test 27: Event Update Notifications
**Path:** Automatic when host edits event

**Steps:**
1. As User 2, mark interest in User 1's event
2. As User 1, edit the event
3. As User 2, wait up to 30 seconds
4. Check for notification popup

**Expected Results:**
- ✅ EventUpdateNotification slides in from top-right
- ✅ Blue gradient header with bell icon
- ✅ Shows event title and "Event updated"
- ✅ "View Event" and "Dismiss" buttons
- ✅ Clicking "View" navigates to event
- ✅ Clicking "Dismiss" marks as read
- ✅ Won't show again after dismissal

---

### ✅ Test 28: Multiple Notifications Queue
**Steps:**
1. Mark interest in 3 events
2. Have host edit all 3 events
3. Wait for notifications

**Expected Results:**
- ✅ Notifications appear one at a time
- ✅ Queue system manages multiple notifications
- ✅ Each can be dismissed individually

---

### ✅ Test 29: Notification Persistence
**Steps:**
1. Receive notification, don't dismiss
2. Refresh page
3. Wait 30 seconds

**Expected Results:**
- ✅ Notification appears again
- ✅ Persists until dismissed

---

## 📝 Feedback System Testing

### ✅ Test 30: Submit Feedback (Logged In)
**Path:** Footer → "Feedback" link

**Steps:**
1. Log in as User 1
2. Click "Feedback" in footer (any page)
3. FeedbackModal opens
4. Type feedback: "Great app! Love the features."
5. Check character counter
6. Submit

**Expected Results:**
- ✅ Modal opens with blur backdrop
- ✅ Character counter shows "35/1000"
- ✅ Feedback submitted successfully
- ✅ User email and name auto-captured
- ✅ Success toast notification
- ✅ Modal closes

---

### ✅ Test 31: Submit Feedback (Anonymous)
**Path:** Footer → "Feedback" (not logged in)

**Steps:**
1. Log out
2. Click "Feedback" in footer
3. Submit feedback without logging in

**Expected Results:**
- ✅ Feedback submitted successfully
- ✅ Email stored as "Anonymous"
- ✅ userId and userName = null

---

### ✅ Test 32: Feedback Character Limit
**Steps:**
1. Open feedback modal
2. Type 1001 characters
3. Try to submit

**Expected Results:**
- ✅ Character counter shows "1001/1000" in red
- ✅ Submit button disabled or validation error
- ✅ Cannot exceed limit

---

### ✅ Test 33: Admin Feedback Dashboard
**Path:** Admin panel → Feedback tab

**Steps:**
1. Log in as admin
2. Go to `/admin/feedback`
3. View all feedback
4. Check stats cards

**Expected Results:**
- ✅ Shows stats: Total, New, Read, Resolved
- ✅ All feedback entries displayed
- ✅ Color-coded status badges (blue/yellow/green)
- ✅ Shows user info or "Anonymous"

---

### ✅ Test 34: Filter & Search Feedback
**Path:** Admin feedback dashboard

**Steps:**
1. Use status filter dropdown: "New", "Read", "Resolved"
2. Use search bar: search by feedback text
3. Search by email
4. Search by username

**Expected Results:**
- ✅ Filter shows only selected status
- ✅ Search works across all fields
- ✅ Real-time filtering

---

### ✅ Test 35: Update Feedback Status
**Path:** Admin feedback dashboard

**Steps:**
1. Find feedback with status "New"
2. Click status dropdown
3. Change to "Read"
4. Change to "Resolved"

**Expected Results:**
- ✅ Status updates immediately
- ✅ Stats cards update
- ✅ Badge color changes

---

### ✅ Test 36: Delete Feedback
**Path:** Admin feedback dashboard

**Steps:**
1. Click delete button on any feedback
2. Confirm deletion

**Expected Results:**
- ✅ Feedback removed from database
- ✅ Stats update
- ✅ Confirmation toast

---

## 👤 User Profile Testing

### ✅ Test 37: View Profile Tabs
**Path:** Profile page

**Steps:**
1. Go to profile
2. Click through all tabs:
   - Events I Host
   - Going
   - Past Events
3. Check event counts

**Expected Results:**
- ✅ "Events I Host" shows created + co-hosted events
- ✅ "Going" shows interested + RSVP'd events
- ✅ "Past Events" shows attended events with "Rate" button
- ✅ Accurate counts in tab labels

---

### ✅ Test 38: Calendar Export
**Path:** Profile → Going tab → Add to Calendar

**Steps:**
1. Mark interest in an event
2. Go to profile → "Going" tab
3. Click "Add to Calendar" dropdown
4. Try "Google Calendar"
5. Try "Download ICS"

**Expected Results:**
- ✅ Google Calendar link pre-fills event details
- ✅ ICS file downloads with correct format
- ✅ All event details included

---

### ✅ Test 39: Edit Personal Info
**Path:** Profile → Personal Information → Edit

**Steps:**
1. Click "Edit" button
2. Change name
3. Change college
4. Change username
5. Save

**Expected Results:**
- ✅ All fields editable
- ✅ Saves successfully
- ✅ Updates reflected immediately

---

### ✅ Test 40: Clickable Event Rows
**Path:** Profile → Events I Host

**Steps:**
1. Click anywhere on an event row (not action buttons)
2. Click "Edit" button
3. Click "Invite" button
4. Click "Delete" button

**Expected Results:**
- ✅ Row click navigates to event detail
- ✅ Action buttons DON'T trigger navigation
- ✅ Buttons trigger their specific actions

---

## 🛡️ Admin Panel Testing

### ✅ Test 41: Admin Access Control
**Path:** Try to access `/admin`

**Steps:**
1. Log out
2. Go to `/admin/bloglist`
3. Log in as regular user
4. Try to access admin panel
5. Log in as admin
6. Access admin panel

**Expected Results:**
- ✅ Not logged in → redirected to login
- ✅ Regular user → 403 Forbidden
- ✅ Admin → full access

---

### ✅ Test 42: Admin Dashboard Stats
**Path:** Admin → Blog List

**Steps:**
1. Check stats cards at top
2. Create new event
3. Refresh admin panel

**Expected Results:**
- ✅ Shows Total, Live, Upcoming, Past event counts
- ✅ Stats update in real-time
- ✅ Color-coded cards

---

### ✅ Test 43: Admin Search & Filter
**Path:** Admin bloglist

**Steps:**
1. Use search bar: search by title, host, location
2. Click "All Events" filter
3. Click "Happening Now" filter
4. Click "Upcoming" filter
5. Click "Past" filter

**Expected Results:**
- ✅ Search works across all fields
- ✅ Filters show correct events
- ✅ Live results counter updates

---

### ✅ Test 44: Admin Bulk Delete
**Path:** Admin bloglist

**Steps:**
1. Check "Select All" checkbox
2. Uncheck a few events
3. Click "Delete Selected" button
4. Confirm deletion

**Expected Results:**
- ✅ All checked events deleted
- ✅ Images removed from Cloudinary
- ✅ Confirmation dialog shown
- ✅ Success toast appears

---

### ✅ Test 45: Admin Delete Any Event
**Path:** Admin bloglist

**Steps:**
1. Find event created by another user
2. Click delete button
3. Confirm

**Expected Results:**
- ✅ Admin can delete any event
- ✅ Regular users can only delete own events

---

## 🔐 Authentication Testing

### ✅ Test 46: Register New Account
**Path:** `/register`

**Steps:**
1. Fill registration form:
   - Name: "Test User"
   - Email: "test123@rice.edu"
   - Password: "password123"
2. Submit
3. Check profile for auto-generated username

**Expected Results:**
- ✅ Account created successfully
- ✅ Redirected to homepage
- ✅ JWT token stored
- ✅ Username auto-generated from email

---

### ✅ Test 47: Login
**Path:** `/login`

**Steps:**
1. Enter email and password
2. Submit
3. Check localStorage for token

**Expected Results:**
- ✅ Login successful
- ✅ JWT token in localStorage
- ✅ Redirected to homepage
- ✅ Header shows "My Profile" and "Create event"

---

### ✅ Test 48: Logout
**Path:** Profile dropdown → Logout

**Steps:**
1. Click profile icon/name in header
2. Click "Logout"
3. Try to access protected routes

**Expected Results:**
- ✅ Token removed from localStorage
- ✅ Redirected to homepage
- ✅ Header shows "Login" and "Register"
- ✅ Cannot access profile or create events

---

### ✅ Test 49: Protected Routes
**Steps:**
1. Log out
2. Try to access:
   - `/me` (profile)
   - `/me/postevent` (create event)
   - `/admin/*` (admin panel)

**Expected Results:**
- ✅ Redirected to login page
- ✅ After login, redirected back to intended page

---

## 🖼️ Image Upload Testing

### ✅ Test 50: Event Images (Cloudinary)
**Path:** Create/Edit event

**Steps:**
1. Create event with 5 images (max limit)
2. Check Cloudinary dashboard → "events" folder
3. Edit event, replace all images
4. Check Cloudinary again
5. Delete event
6. Check Cloudinary

**Expected Results:**
- ✅ All images uploaded to Cloudinary
- ✅ Stored in "events" folder
- ✅ Old images deleted when replaced
- ✅ All images deleted when event deleted
- ✅ Images persist on Vercel (not in /public)

---

### ✅ Test 51: Review Images (Cloudinary)
**Path:** Submit/Edit review

**Steps:**
1. Submit review with 3 images
2. Check Cloudinary → "reviews" folder
3. Edit review, replace images
4. Check Cloudinary

**Expected Results:**
- ✅ Review images in "reviews" folder
- ✅ Old images deleted when replaced
- ✅ Images load correctly on event page

---

### ✅ Test 52: Image Format & Size
**Steps:**
1. Upload JPEG, PNG, WEBP images
2. Upload very large image (10MB+)
3. Upload 6 images (exceeds limit)

**Expected Results:**
- ✅ All formats accepted
- ✅ Large images handled (may take longer)
- ✅ Max 5 images enforced

---

## 🌐 Cross-Browser & Responsive Testing

### ✅ Test 53: Mobile Responsiveness
**Devices:** iPhone, Android

**Steps:**
1. Test on mobile browser
2. Create event on mobile
3. Browse events on mobile
4. Submit review on mobile
5. Check all modals

**Expected Results:**
- ✅ All features work on mobile
- ✅ Modals responsive
- ✅ Touch interactions smooth
- ✅ Images scale properly

---

### ✅ Test 54: Different Browsers
**Browsers:** Chrome, Safari, Firefox, Edge

**Steps:**
1. Test core features in each browser
2. Check localStorage compatibility
3. Check modal animations

**Expected Results:**
- ✅ Works in all modern browsers
- ✅ Consistent UI/UX
- ✅ No console errors

---

## 🐛 Edge Cases & Error Handling

### ✅ Test 55: Network Errors
**Steps:**
1. Disconnect internet
2. Try to create event
3. Try to submit review
4. Reconnect internet

**Expected Results:**
- ✅ Error messages shown
- ✅ No data loss (form data retained)
- ✅ Retry works after reconnection

---

### ✅ Test 56: Invalid Data
**Steps:**
1. Create event with end time before start time
2. Submit rating without stars
3. Submit empty feedback
4. Upload non-image file

**Expected Results:**
- ✅ Validation errors shown
- ✅ Form doesn't submit
- ✅ Clear error messages

---

### ✅ Test 57: Concurrent Edits
**Steps:**
1. Open same event in 2 tabs
2. Edit in both tabs simultaneously
3. Submit both

**Expected Results:**
- ✅ Last edit wins
- ✅ No data corruption
- ✅ Proper error handling

---

## ✅ Complete Testing Checklist

### Event Management (7 tests)
- [ ] Create event (no RSVP)
- [ ] Create event (with RSVP)
- [ ] Edit future event
- [ ] Edit live event
- [ ] Cannot edit past event
- [ ] Delete event
- [ ] Search & filter

### User Interactions (4 tests)
- [ ] Mark interest
- [ ] RSVP to event
- [ ] RSVP after deadline
- [ ] RSVP at capacity

### Rating System (8 tests)
- [ ] Live rating (no RSVP)
- [ ] Live rating (RSVP required - not reserved)
- [ ] Live rating (RSVP required - reserved)
- [ ] Auto rating popup
- [ ] Manual review submission
- [ ] Edit review
- [ ] Duplicate prevention
- [ ] Host cannot rate own event

### Co-hosting (7 tests)
- [ ] Auto-generated username
- [ ] Edit username
- [ ] Invite co-host
- [ ] Accept invitation
- [ ] Decline invitation
- [ ] Co-host edit permissions
- [ ] Co-host display

### Notifications (3 tests)
- [ ] Event update notifications
- [ ] Multiple notifications queue
- [ ] Notification persistence

### Feedback System (7 tests)
- [ ] Submit feedback (logged in)
- [ ] Submit feedback (anonymous)
- [ ] Character limit
- [ ] Admin dashboard
- [ ] Filter & search
- [ ] Update status
- [ ] Delete feedback

### User Profile (4 tests)
- [ ] View profile tabs
- [ ] Calendar export
- [ ] Edit personal info
- [ ] Clickable event rows

### Admin Panel (5 tests)
- [ ] Access control
- [ ] Dashboard stats
- [ ] Search & filter
- [ ] Bulk delete
- [ ] Delete any event

### Authentication (4 tests)
- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Protected routes

### Images (3 tests)
- [ ] Event images (Cloudinary)
- [ ] Review images (Cloudinary)
- [ ] Image formats & size

### Responsive & Cross-browser (2 tests)
- [ ] Mobile responsiveness
- [ ] Different browsers

### Error Handling (3 tests)
- [ ] Network errors
- [ ] Invalid data
- [ ] Concurrent edits

---

## 🎯 Priority Testing Order

**Phase 1: Core Features (Must Test First)**
1. Register/Login
2. Create event
3. Mark interest/RSVP
4. Submit review
5. Cloudinary image upload

**Phase 2: Advanced Features**
6. Co-hosting system
7. Notifications
8. Edit review
9. Feedback system

**Phase 3: Admin & Edge Cases**
10. Admin panel
11. Error handling
12. Cross-browser testing

---

## 📊 Testing Report Template

After completing tests, document results:

```markdown
## Test Results - [Date]

### Environment
- Browser: Chrome 120
- Device: MacBook Pro
- URL: https://your-app.vercel.app

### Passed Tests: X/57
### Failed Tests: Y/57

### Issues Found:
1. [Description]
2. [Description]

### Critical Bugs:
- None / [List bugs]

### Recommendations:
- [Suggestions]
```

---

## 🚀 Automated Testing (Future Enhancement)

Consider adding:
- **Jest** for unit tests
- **Playwright** for E2E tests
- **Cypress** for integration tests

---

**Good luck testing! 🎉**
