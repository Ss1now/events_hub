# Changelog

All notable changes to Rice Events Hub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.0] - 2026-01-11

### Added

#### Email Subscription System
- **Complete email notification preferences management**
  - Bell icon button in header for easy access
  - Beautiful subscription preferences modal
  - Three subscription types: Recommendations, Reminders, Updates
  - Frequency control (daily or weekly) for recommendations
  - Privacy information and unsubscribe options
  - Visual indicator (purple dot) when subscriptions are active

- **Event Recommendations Email**
  - Intelligent multi-tier recommendation algorithm
  - **Tier 1**: Personalized suggestions based on user's past event categories/locations
  - **Tier 2**: Popular events (sorted by ratings) if <3 personalized matches
  - **Tier 3**: Any upcoming events if still <3 total matches
  - Handles early launch scenarios with few total events
  - Works for new users with no interaction history
  - Sends 1-5 relevant upcoming events (minimum 1 if any available)
  - Professional HTML email template with event cards
  - User-configurable frequency (daily or weekly)
  - Scheduled via cron job
  
- **Event Reminders Email**
  - Automated reminders before events user is attending
  - Two-tier reminder system: 24 hours + 1 hour before event
  - Only sent to users who RSVP'd to the event
  - Yellow alert banner design
  - Full event details with date, time, location
  - "View Event Details" call-to-action button

- **Event Updates Email**
  - Instant notifications when hosts edit events
  - Sent to users who RSVP'd or showed interest
  - Highlights what changed in yellow info box
  - Blue update banner design
  - Triggered automatically on event edit
  - Only for future and live events (not past events)

#### Database Schema Updates
- **User Model**
  - `emailSubscriptions.recommendations`: Boolean (default: false)
  - `emailSubscriptions.reminders`: Boolean (default: false)
  - `emailSubscriptions.updates`: Boolean (default: false)
  - `emailSubscriptions.frequency`: String ('daily' or 'weekly', default: 'weekly')

- **EmailQueue Model** (New Collection)
  - Queue system for scheduled email delivery
  - Tracks sent status and errors
  - Supports all three email types
  - Indexed for efficient querying
  - Stores metadata for personalization

#### API Endpoints
- **`GET /api/email-subscription`** - Fetch user's email preferences
- **`POST /api/email-subscription`** - Update email preferences
- **`POST /api/email/send`** (action: 'send-recommendations') - Trigger recommendation emails
- **`POST /api/email/send`** (action: 'send-reminder') - Send event reminder
- **`POST /api/email/send`** (action: 'send-update') - Send event update notification
- **`GET /api/cron/recommendations`** - Vercel Cron endpoint for weekly recommendations
- **`GET /api/cron/reminders`** - Vercel Cron endpoint for hourly reminder checks

#### UI Components
- `components/EmailSubscriptionButton.jsx` - Bell icon with active indicator
- `components/EmailSubscriptionModal.jsx` - Full preferences management UI
  - Toggle switches for each notification type
  - Frequency selector (Daily/Weekly)
  - Privacy information box
  - Smooth animations and transitions

#### Email Templates
- **Professional HTML design** with Rice Events branding
  - Purple gradient headers
  - Responsive layouts for mobile and desktop
  - Clear call-to-action buttons
  - Event cards with images and details
  - Unsubscribe/manage preferences links
  - Consistent footer with copyright

- **Recommendation Template**
  - Grid of 3-5 event cards
  - Each card shows: title, date, time, location, description preview
  - Individual "View Event" buttons
  - Personalized greeting

- **Reminder Template**
  - Countdown notice (24h or 1h)
  - Formatted date display ("Friday, January 12, 2026")
  - Full event information
  - Single prominent CTA button

- **Update Template**
  - Blue alert banner
  - Changes summary in highlighted box
  - Updated event details
  - Direct link to event page

#### Documentation
- **EMAIL_SUBSCRIPTION.md** - Complete guide for email system
  - System overview and architecture
  - Database schema documentation
  - API endpoint reference
  - Email template specifications
  - Scheduling and cron job setup
  - Resend configuration guide
  - Testing procedures
  - Privacy and unsubscribe handling
  - Troubleshooting guide
  - Performance considerations

#### Automated Scheduling
- **Vercel Cron Integration**
  - `vercel.json` configuration for automated email jobs
  - Weekly recommendations cron (Monday 9am UTC)
  - Hourly reminders cron (checks every hour)
  - Secure cron authentication with CRON_SECRET
  - Automatic event detection for 24h and 1h reminders
  - Smart time window detection (23-25h for 24h reminders, 30-90min for 1h reminders)
  - Error logging and reporting for failed sends
  - Production-ready with Vercel deployment

### Changed

#### Header Component
- **Email subscription integration**
  - Added bell icon button next to Profile
  - Bell icon fills when user has active subscriptions
  - Purple notification dot indicator
  - Responsive sizing for mobile and desktop
  - Modal integration

#### Event Edit API
- **Automatic email notifications**
  - Triggers update emails when event is edited
  - Async email sending (non-blocking)
  - Only notifies subscribed users
  - Passes change summary to email

#### Environment Variables
- Updated `.env.example` with email system variables
- RESEND_API_KEY remains optional for development
- Added CRON_SECRET for secure cron job authentication

### Technical
- Resend SDK integration with professional templates
- Async email sending to prevent blocking
- Email queue system for scheduled delivery
- Efficient database queries with proper indexing
- Error handling and logging for failed emails
- Console fallback when RESEND_API_KEY not set
- Personalization algorithm for recommendations
- Event status checking (future/live/past)
- Batch email processing for recommendations
- Individual email processing for reminders/updates

### Security
- JWT authentication for all email preference APIs
- User can only update own preferences
- Email addresses never exposed to other users
- Unsubscribe links in all emails
- Privacy notes included in UI and emails
- No email sharing with third parties

---

## [0.4.3] - 2026-01-11

### Changed

#### Email System Refinements
- **Password Reset Email Branding**
  - Updated email subject from "Rice Events Hub" to "Rice Events"
  - Updated email header title from "Rice Events Hub" to "Rice Events"
  - Updated email body text from "Rice Events Hub" to "Rice Events"
  - Updated email footer from "Rice Events Hub" to "Rice Events"
  - Removed clock emoji (⏰) from expiration notice
  - Removed lock emoji (🔒) from security notice
  - Cleaner, more professional email appearance

#### UI/UX Improvements
- **Mobile Navigation Enhancement**
  - Fixed Logout button visibility on mobile devices
  - Logout button now displays on all screen sizes
  - Consistent button styling across mobile and desktop
  - Improved mobile header usability

- **Rating System Refinement**
  - Removed placeholder text from rating comment textarea
  - Cleaner, more minimal rating popup interface
  - Consistent with app-wide form simplification approach

### Technical
- Responsive button classes standardized across header component
- Email template HTML updated for brand consistency
- Form inputs streamlined for better UX

---

## [0.4.2] - 2026-01-11

### Added

#### Password Recovery System
- **Complete password reset functionality for users who forget their credentials**
  - "Forgot your password?" link on login page
  - Email-based password reset flow
  - Secure token generation using crypto (SHA-256 hashing)
  - Token expiration after 1 hour for security
  - Password validation (minimum 6 characters)
  - Password confirmation matching
  
- **Forgot Password Page** (`/forgot-password`)
  - Clean, user-friendly interface
  - Email input with validation
  - Success confirmation screen
  - Loading states and error handling
  - Development mode shows reset URL in console
  
- **Reset Password Page** (`/reset-password`)
  - Token verification on page load
  - Invalid/expired token error screen
  - New password input with confirmation
  - Real-time password validation
  - Success screen with auto-redirect to login
  - Loading and verification states

#### API Endpoints
- **`POST /api/reset-password`** (action: 'request-reset')
  - Generates secure reset token
  - Stores hashed token in database with 1-hour expiration
  - Returns success message (doesn't reveal if email exists for security)
  - Development mode returns reset URL for testing
  
- **`POST /api/reset-password`** (action: 'reset-password')
  - Validates reset token and expiration
  - Updates user password with bcrypt hashing
  - Clears reset token after successful reset
  
- **`GET /api/reset-password?token={token}`**
  - Verifies token validity and expiration
  - Returns user email if token is valid

#### Database Schema
- **User Model Updates**
  - `resetPasswordToken`: String (optional) - stores hashed reset token
  - `resetPasswordExpires`: Date (optional) - token expiration timestamp

#### Email Integration
- **Resend Email Service**
  - Professional HTML email templates
  - Purple-themed branding matching app design
  - Responsive email layout for all devices
  - Clear call-to-action button for password reset
  - Security information and expiration notice
  - Fallback to console logging for development

#### Documentation
- **EMAIL_SETUP.md** - Complete guide for email service integration
  - Resend setup instructions
  - Alternative Nodemailer configuration
  - Environment variables documentation
  - Testing procedures
  - Security best practices
  - Troubleshooting guide

### Changed
- **Login Page**
  - Added "Forgot your password?" link above sign-in button
  - Purple-themed link matching app design

- **Environment Variables**
  - Added `NEXT_PUBLIC_BASE_URL` for reset link generation
  - Added `RESEND_API_KEY` for email service (optional)
  - Updated `.env.example` with email configuration options

### Technical
- Crypto-based secure token generation (32-byte random token)
- SHA-256 hashing for token storage
- Token expiration validation (1 hour window)
- Bcrypt password hashing for new passwords
- Security best practice: doesn't reveal if email exists in database
- Resend SDK integration with professional email templates
- Comprehensive error handling and user feedback
- Auto-redirect after successful password reset
- Email delivery with error handling (doesn't break flow if email fails)

### Security
- Reset tokens are cryptographically secure (crypto.randomBytes)
- Tokens stored as SHA-256 hashes in database
- Token expiration prevents indefinite reset links
- Password reset doesn't reveal valid email addresses
- New passwords validated and hashed with bcrypt
- Tokens cleared immediately after successful reset
- Email failures don't expose user existence

---

## [0.4.1] - 2026-01-11

### Changed

#### Mobile Responsive Design
- **Complete mobile optimization across all pages**
  - Header: Reduced padding, smaller buttons, compact layout on mobile
  - Hidden "Logout" and "Register" buttons on small screens for cleaner UI
  - Button text shortened ("Create event" → "Create", "My Profile" → "Profile")
  - Responsive font sizes throughout (text-xs to text-base scaling)
  
- **Homepage & Event List**
  - Adjusted search bar sizing for mobile screens
  - Filter tabs now horizontally scrollable on mobile
  - Filter button text shortened ("Happening Now" → "Now")
  - Reduced gaps and padding on small screens
  - Improved event card spacing (space-y-4 on mobile, space-y-6 on desktop)

- **Event Cards (BlogItem)**
  - Cards stack vertically on mobile, horizontal on desktop
  - Date badge and action buttons rearranged for mobile (horizontal layout)
  - Reduced button padding and text sizes on mobile
  - Description limited to 2 lines on mobile with line-clamp
  - Smaller icons and badge text
  - "Rate" button text hidden on mobile (icon only)
  - Adjusted calendar badge sizing (min-w-[60px] on mobile, min-w-[80px] on desktop)

- **Event Detail Page**
  - Responsive header with smaller logo and compact "Create" button
  - Event title scales from text-2xl (mobile) to text-4xl (desktop)
  - Event info cards use reduced padding on mobile
  - Action buttons stack vertically on mobile, horizontal on desktop
  - Calendar integration buttons stack on mobile
  - Share button shows icon only on mobile
  - Download ICS button text shortened to ".ics" on mobile
  - Responsive date badge with adjusted font sizes

- **Typography & Spacing**
  - Consistent text scaling: text-xs/sm on mobile → text-sm/base on desktop
  - Reduced padding throughout: p-4 on mobile → p-6/p-8 on desktop
  - Smaller gaps between elements on mobile
  - Border radius adjustments: rounded-xl on mobile → rounded-2xl on desktop

### Technical
- Added Tailwind responsive classes (sm:, md:, lg:) across all components
- Implemented flex-col/flex-row transitions for layout changes
- Used whitespace-nowrap for button text that shouldn't wrap
- Applied line-clamp for text truncation on mobile
- Optimized touch targets for mobile interaction

---

## [0.4.0] - 2026-01-11

### Added

#### Review Editing Feature
- **Users can now edit their existing reviews**
  - "Edit" button appears on user's own reviews
  - Review form pre-fills with existing rating, comment, and images
  - Can modify rating, update comment text, and change images
  - Existing images shown separately from new uploads
  - Can remove existing images and add new ones (max 5 total)
  - Edit timestamps tracked with "(edited)" label on reviews
  - PUT endpoint for updating reviews

#### User Feedback System
- **Global feedback collection mechanism**
  - "Feedback" link in footer (accessible from any page)
  - FeedbackModal component with clean, minimal design
  - Textarea for user feedback (1000 character limit)
  - Character counter for feedback input
  - Auto-captures logged-in user information
  - Anonymous feedback support for non-logged-in users
  
- **Admin Feedback Dashboard**
  - Dedicated admin panel at `/admin/feedback`
  - Statistics cards showing Total, New, Read, Resolved counts
  - Filter by status (All, New, Read, Resolved)
  - Search functionality for feedback content
  - Status update buttons (Mark as Read, Mark as Resolved)
  - Delete feedback capability
  - Color-coded status badges (blue/yellow/green)
  - Responsive grid layout
  - Real-time feedback management

#### API Endpoints
- **`POST /api/feedback`** - Submit feedback (public access)
- **`GET /api/feedback`** - Fetch all feedback with stats (admin only)
- **`PATCH /api/feedback`** - Update feedback status (admin only)
- **`DELETE /api/feedback`** - Delete feedback (admin only)
- **`PUT /api/rating`** - Update existing review (authenticated users)

#### Database Schema
- **Feedback Model** (`lib/models/feedbackmodel.js`)
  - `feedback`: String (required, max 1000 characters)
  - `email`: String (default 'Anonymous')
  - `userId`: ObjectId reference to User (optional)
  - `userName`: String (auto-captured if logged in)
  - `status`: Enum ['new', 'read', 'resolved'] (default 'new')
  - `createdAt`: Date (auto-generated)

#### UI Components
- `components/FeedbackModal.jsx` - Feedback submission modal
- `app/admin/feedback/page.jsx` - Admin feedback management dashboard

### Changed

#### UI/UX Refinements
- **Branding Updates**
  - Changed "Rice Party" to "Rice Events" across the application
  - Removed "minimal + playful" tagline from all pages
  - Updated logo text in headers and footers
  - Consistent branding in event detail pages

- **Button Text Updates**
  - "Post an event" → "Create event" (all instances)
  - "Post New Event" → "Create New Event"
  - "Post a New Event" → "Create a New Event"
  - "Post Event" → "Create Event" (submit button)

- **Navigation & Tab Labels**
  - "I'm Going" → "Going" (user profile tabs)
  - "Participated" → "Past Events" (user profile tabs)

- **Status Label Terminology**
  - "Future" → "Upcoming" (filter buttons and status badges)
  - "Ongoing" / "Live" → "Happening Now" (filter buttons and status badges)
  - Database status values unchanged ('future', 'live', 'past')
  - Consistent display labels across all components

- **Form Simplification**
  - Removed all placeholder text hints from forms
  - "Upload Images (Optional, Max 5)" → "Upload Images"
  - Removed placeholders from event creation form fields
  - Removed placeholders from rating form fields
  - Cleaner, more minimal form appearance

- **Event Type Input**
  - Changed from dropdown selection to free-text input
  - Hosts can now enter custom event types
  - More flexibility for event categorization

- **Search Bar**
  - "Search events by name, location, type..." → "Search events"
  - Removed search hint paragraph "Try 'jones'..."
  - Cleaner search interface

#### Component Updates
- `components/header.jsx` - Updated branding and button text
- `components/footer.jsx` - Updated branding, added feedback link
- `components/bloglist.jsx` - Updated filter labels and search UI
- `components/blogitem.jsx` - Updated status badge labels
- `app/blogs/[id]/page.jsx` - Updated branding and button text
- `app/me/page.jsx` - Updated tab labels
- `app/me/postevent/page.jsx` - Simplified form, removed placeholders
- `app/admin/bloglist/page.jsx` - Updated filter labels
- `components/FeedbackModal.jsx` - Minimalist design without hints
- `components/ReviewForm.jsx` - Enhanced to support editing mode
- `components/ReviewList.jsx` - Added edit button and user identification
- `components/admincomponents/sidebar.jsx` - Added "User Feedback" link

#### Review System Enhancement
- **ReviewForm now supports dual mode**
  - Create mode: Empty form for new reviews
  - Edit mode: Pre-filled form with existing data
  - Dynamic form title ("Write a Review" vs "Edit Your Review")
  - Dynamic button text ("Submit Review" vs "Update Review")
  - Handles both new image uploads and existing image management

- **ReviewList improvements**
  - Fetches current user ID to identify ownership
  - Edit button only visible on user's own reviews
  - Shows "(edited)" timestamp for modified reviews
  - Passes review data to parent for editing

### Fixed
- **Review editing modal not opening**
  - Fixed conditional rendering logic in blog detail page
  - Review form now shows when `showReviewForm` is true regardless of `hasRated`
  - Proper state management for editing flow

### Technical
- Text input sanitization for event types
- Multi-file image upload with existing image preservation
- Review update timestamp tracking (`updatedAt` field)
- Global feedback collection with admin authorization
- Feedback status workflow (new → read → resolved)
- Character counting for feedback input
- Toast notifications for all user actions
- Responsive admin dashboard layout

---

## [0.3.0] - 2026-01-10

### Added

#### Event Update Notification System
- **Real-time Notifications for Event Changes**
  - Users who clicked "I'm Going" or RSVP'd receive notifications when event is updated
  - Notifications appear for both future and live events
  - Slide-in notification popup in top-right corner
  - Similar design to co-host invitation notifications
  - Shows event title, update timestamp, and quick actions
  - "View Event" and "Dismiss" action buttons
  - Auto-polling every 30 seconds for new notifications
  - Multiple notifications queued and displayed one at a time
  - Read/unread status tracking

- **EventUpdateNotification Component**
  - Framer Motion slide-in animations
  - Blue gradient header design
  - Bell icon with event information
  - Notification counter for multiple updates
  - Smooth exit animations

#### Co-host Feature
- **Auto-generated Username System**
  - Usernames automatically generated from email on registration
  - Format: email prefix (alphanumeric only) with numeric suffix if needed
  - Example: john.doe@rice.edu → johndoe, johndoe1, etc.
  - All usernames are unique and sparse (optional for existing users)

- **Username Management**
  - Users can edit their username in Personal Information dashboard
  - Username editing alongside name, email, and residential college
  - Validation: 3-20 characters, lowercase letters, numbers, underscores only
  - Real-time duplicate checking
  - Username format enforced with live input sanitization

- **Event Co-hosting Functionality**
  - Invite co-hosts by username or email search
  - Real-time user search with autocomplete
  - Search results show full name and username together
  - Send co-host invitations to other users
  - Invitations appear as notifications
  - Accept or decline co-host invitations
  - Co-hosts gain full editing permissions for events
  - **Invite button in "Events I Host" section**
  - Invite functionality available from event management table
  - Invite button only visible for future events
  
- **EventCreatedModal Component**
  - Shows after successful event creation
  - Displays event details preview
  - "View Event Details" button
  - "Invite Co-host" button for immediate invitation
  - Clean, modern design with gradient accents

- **CohostInviteModal Component**
  - Search users by username or email
  - Live search results with user avatars
  - One-click invitation system
  - Visual feedback during invitation process
  - Filters out existing co-hosts and event author

- **CohostInvitationNotification Component**
  - Real-time notification system for co-host invitations
  - Accept/Decline/View Event actions
  - Shows invitation sender and event details
  - Queues multiple invitations
  - Auto-polling for new invitations (30s interval)

#### Database Schema Updates
- **User Model**
  - `username`: String (unique, sparse) - auto-generated from email, optional for existing users
  - `cohostInvitations`: Array of invitation objects with event details, inviter info, and status
  - `eventUpdateNotifications`: Array of event update notifications with read status
  - Username generation logic ensures uniqueness with numeric suffixes

- **Blog/Event Model**
  - `cohosts`: Array of co-host objects (userId, name, username)
  - Each co-host entry stores username for quick display

#### API Endpoints
- **`GET /api/cohost`** - Search users by username or email
- **`POST /api/cohost`** - Send co-host invitation
- **`PATCH /api/cohost`** - Accept or decline co-host invitation
- **`DELETE /api/cohost`** - Remove co-host (author only)
- **`PATCH /api/user/notifications`** - Mark event update notifications as read

#### UI Enhancements
- **Co-host Display**
  - Event detail pages: "Hosted by [Host Name] • Co-hosts: @username1, @username2"
  - Event cards: "Hosted by [Host Name] • Co-hosts: @username1, @username2"
  - Purple-themed username display for co-hosts
  - Clear visual separation between host and co-hosts

- **Event Creation Flow**
  - New success modal after event creation
  - Direct access to invite co-hosts
  - Improved onboarding for event hosts

- **Personal Information Dashboard**
  - Username field added to profile editor
  - Displays as @username in view mode
  - Live validation and format enforcement
  - Shows character requirements and limits
  - Auto-generation of username from email on first profile load

- **Event Management Table**
  - Clickable event rows navigate to event details
  - Action buttons (Edit, Invite, Delete) stop click propagation
  - Invite button only appears for future events
  - Improved user experience with hover effects

#### Files Added
- `components/EventCreatedModal.jsx` - Post-creation success modal
- `components/CohostInviteModal.jsx` - Co-host invitation interface
- `components/CohostInvitationNotification.jsx` - Real-time invitation notifications
- `components/EventUpdateNotification.jsx` - Real-time event update notifications
- `app/api/cohost/route.js` - Co-host management API

#### Files Updated
- `lib/models/usermodel.js` - Username now sparse (optional), added eventUpdateNotifications
- `auth/users.js` - Auto-generate usernames on registration
- `lib/models/blogmodel.js` - Added cohosts array
- `app/api/blog/route.js` - Return created event data, check cohost permissions, notify users on event updates
- `app/api/user/route.js` - Include cohosted events, invitations, username editing, auto-generate missing usernames, return eventUpdateNotifications
- `app/api/user/notifications/route.js` - Added PATCH endpoint for marking notifications as read
- `app/me/page.jsx` - Added username editing in personal info, cohost invite modal integration, clickable event rows
- `app/me/postevent/page.jsx` - Integrated EventCreatedModal
- `app/blogs/[id]/page.jsx` - Display host name + cohost usernames
- `components/blogitem.jsx` - Show host name + cohost usernames on cards
- `components/bloglist.jsx` - Pass cohosts prop to BlogItem
- `components/CohostInviteModal.jsx` - Show name and username in search results
- `app/layout.js` - Added CohostInvitationNotification and EventUpdateNotification

### Changed

#### Event Update Notifications
- **Automatic notification creation when hosts edit future or live events**
  - All users who clicked "I'm Going" or RSVP'd receive notifications
  - Notifications created in user's `eventUpdateNotifications` array
  - Includes event title, timestamp, and read status
  - PUT /api/blog now notifies affected users automatically

#### Permissions System
- **Event editing now available to co-hosts**
  - Co-hosts have same editing permissions as original author
  - Authorization checks updated in PUT /api/blog
  - Only original author can remove co-hosts

#### User Profile
- **Cohosted Events Section** (Data available, UI to be added)
  - API returns events where user is a co-host
  - Separate from "Events I Host"

#### Username System
- **Existing users supported**
  - Username field made optional (sparse) for backward compatibility
  - Auto-generation on first profile load for users without usernames
  - Username saved to database after generation or editing

### Fixed
- **MongoDB connection import case sensitivity**
  - Fixed `ConnectDB` vs `connectDB` import error in cohost API
  - Standardized to `connectDB` across all files

- **Username persistence issues**
  - Fixed username not saving to MongoDB
  - Updated findByIdAndUpdate to use $set operator with strict: false
  - Fixed username not loading after page refresh
  - Auto-generation triggers when username field missing

### Technical
- Username-based search system with case-insensitive matching
- Real-time invitation notification system with polling (30s interval)
- Real-time event update notification system with polling (30s interval)
- Sparse indexing for optional username field (backward compatibility)
- Co-host permissions layered onto existing authorization
- Modal system expanded with event creation flow and update notifications
- Enhanced user search with filtering logic
- Notification read/unread status tracking in database
- Event row click navigation with action button click prevention
- Conditional rendering of invite button based on event status

---

## [0.2.6] - 2026-01-10

### Removed

#### Theme and Dress Code Properties
- **Simplified event creation by removing theme and dress code fields**
  - Removed theme input field from all event forms
  - Removed dress code input field from all event forms
  - Removed theme and dress code from database schema
  - Removed theme and dress code displays from event detail pages
  - Removed theme and dress code from search filters
  - Removed theme and dress code from calendar exports (Google Calendar & ICS)
  - Removed theme and dress code from event cards and lists

#### Backend Changes
- `lib/models/blogmodel.js` - Removed theme and dressCode schema fields
- `app/api/blog/route.js` - Removed theme and dressCode from POST and PUT operations

#### Frontend Changes
- `app/admin/addproduct/page.jsx` - Removed theme and dress code inputs
- `app/me/postevent/page.jsx` - Removed theme and dress code inputs
- `app/me/editevent/[id]/page.jsx` - Removed theme and dress code inputs
- `app/blogs/[id]/page.jsx` - Removed theme and dress code badges and detail rows
- `app/me/page.jsx` - Removed from calendar export descriptions
- `components/blogitem.jsx` - Removed props and calendar export references
- `components/bloglist.jsx` - Removed from search filter and component props

### Technical
- Streamlined event data model for better user experience
- Reduced form complexity for event hosts
- Simplified event detail displays
- Updated search functionality to focus on core event attributes

---

## [0.2.5] - 2026-01-10

### Added

#### Modern Share Functionality
- **New ShareModal component with mainstream share capabilities**
  - Copy link to clipboard with one click
  - Share to WhatsApp, Instagram, Messages (SMS), LinkedIn
  - Share via Email
  - Beautiful mobile-responsive modal design
  - Animated slide-up modal on mobile, centered on desktop
  - Event preview card showing title, description, and image
  - Visual feedback when link is copied
  - Quick access link display with copy button
  - Blurred glass-effect background (bg-black/40 backdrop-blur-md)

#### UI Enhancements
- **Updated Share button on event detail page**
  - Added share icon for better visual clarity
  - Opens modern share modal on click
  - Consistent styling with other action buttons

### Changed
- **Participated Events Calendar Button**
  - Removed "Add to Calendar" button from participated events tab
  - Past events now only show: View Details and Rate Event buttons
  - Improved UX by removing unnecessary actions for past events

#### Files Added
- `components/ShareModal.jsx` - Complete share modal component

#### Files Updated
- `app/blogs/[id]/page.jsx` - Integrated ShareModal component
- `app/me/page.jsx` - Removed calendar button from participated events

### Technical
- Framer Motion animations for smooth modal transitions
- Responsive grid layout for share options (3 columns)
- Social media platform integrations with proper URL encoding
- Clipboard API for modern copy functionality
- Toast notifications for user feedback
- Instagram workaround: Copies link with toast notification
- Messages integration: SMS protocol with pre-filled text

---

## [0.2.4] - 2026-01-10

### Changed

#### RSVP Count Auto-calculation
- **Removed manual "Reserved" input field from event creation and editing forms**
  - Hosts no longer need to manually enter reserved count
  - Reserved count now automatically calculated from `reservedUsers` array length
  - Prevents inconsistencies between reserved count and actual RSVP list

#### Database Schema Update
- **Converted `reserved` from stored field to virtual property**
  - `reserved` is now dynamically calculated as `reservedUsers.length`
  - Reduces data redundancy and ensures accuracy
  - Virtual field automatically included in JSON/Object responses
  - No database migration required - field automatically calculated for all events

#### Files Updated
- `app/admin/addproduct/page.jsx` - Removed reserved input
- `app/me/postevent/page.jsx` - Removed reserved input
- `app/me/editevent/[id]/page.jsx` - Removed reserved input
- `lib/models/blogmodel.js` - Converted to virtual field
- `app/api/blog/route.js` - Removed manual count updates

### Technical
- Backward compatible - virtual field returns same value as before
- API responses unchanged - `reserved` still returned in all endpoints
- Frontend displays continue to work without modifications

---

## [0.2.3] - 2026-01-10

### Changed

#### UI/UX Terminology Update
- **Renamed "Reservation" to "RSVP" across entire application**
  - Updated all user-facing labels, buttons, and messages
  - Changed "Reserve Spot" to "RSVP"
  - Changed "Cancel Reservation" to "Cancel RSVP"  
  - Changed "Reservation Closed" to "RSVP Closed"
  - Changed "Reservation Deadline" to "RSVP Deadline"
  - Changed "Reservation Confirmed!" to "RSVP Confirmed!"
  - Updated all error messages and toast notifications
  - Updated API action from `cancel-reservation` to `cancel-rsvp`
  - Updated function names (handleCancelReservation → handleCancelRSVP)
  - Updated variable names (isReservationDeadlinePassed → isRSVPDeadlinePassed)
  
#### Files Updated
- `app/admin/addproduct/page.jsx` - Admin event creation form
- `app/me/postevent/page.jsx` - User event creation form
- `app/me/editevent/[id]/page.jsx` - Event editing form
- `app/me/page.jsx` - User profile with RSVP management
- `app/blogs/[id]/page.jsx` - Event detail page
- `app/api/blog/route.js` - Event API endpoints
- `app/api/rating/route.js` - Rating API with RSVP checks
- `app/api/live-rating/route.js` - Live rating API with RSVP checks
- `components/blogitem.jsx` - Event card component
- `components/SuccessModal.jsx` - Success confirmation modal
- `components/LiveRatingButton.jsx` - Live rating component
- `README.md` - Documentation updates

### Technical
- Database field names remain unchanged (`needReservation`, `reservationDeadline`) for backward compatibility
- All existing events and RSVPs continue to work without migration
- API backwards compatible with `cancel-rsvp` action (previously `cancel-reservation`)

---

## [0.2.2] - 2026-01-09

### Security

#### Critical Security Fixes
- **Removed all hardcoded MongoDB credentials from public repository**
  - Removed exposed MongoDB URI from `lib/config/db.js`
  - Updated `ADMIN_SETUP.md` to use environment variables instead of hardcoded connection strings
  - Cleaned all example credentials from `README.md`
  - Fixed GitHub Secret Scanning alerts

#### Database Connection Security
- **Enhanced `lib/config/db.js` with environment variable validation**
  - Now requires `process.env.MONGODB_URI` to be set
  - Throws descriptive error if MongoDB URI is missing
  - Removed insecure fallback to hardcoded credentials
  - Added comprehensive error messages for debugging

#### Environment Variable Management
- **Updated `.env.example` with security best practices**
  - Removed placeholder credentials
  - Added instructions for generating secure JWT_SECRET using Node.js crypto
  - Added reference to MongoDB Atlas for obtaining connection URI
  - Included security warnings and setup instructions

### Added

#### Security Documentation
- **Created comprehensive `SECURITY.md`**
  - Environment variable security best practices
  - MongoDB credential management guide
  - JWT token security recommendations
  - API security guidelines
  - File upload security considerations
  - Admin access security protocols
  - Step-by-step guide for credential rotation
  - Security checklist for deployment and maintenance
  - Incident response procedures for exposed credentials
  - Links to OWASP, MongoDB security docs, and JWT best practices

### Changed

#### Documentation Security Updates
- **Updated `README.md` security sections**
  - Removed example MongoDB URIs with real credentials
  - Added instructions to copy `.env.example` to `.env.local`
  - Enhanced security warnings in development guide
  - Improved environment setup documentation

- **Updated `ADMIN_SETUP.md`**
  - Removed hardcoded MongoDB connection string
  - Instructions now reference `.env.local` for database URI
  - Maintained all three admin setup methods with secure practices

### Technical
- `.gitignore` verified to protect all `.env*` files (except `.env.example`)
- All source code now uses `process.env.MONGODB_URI` exclusively
- Zero hardcoded credentials remaining in version control
- Ready for safe public repository deployment

---

## [0.2.1] - 2026-01-09

### Changed

#### Documentation
- **Complete README.md rewrite**
  - Comprehensive project overview with all features documented
  - Detailed tech stack breakdown with version numbers
  - Step-by-step installation and setup guide
  - Complete project structure with file/folder explanations
  - Full database schema documentation for Event and User models
  - Extensive API documentation with all endpoints, request/response examples
  - User workflow diagrams and explanations
  - Admin features and setup instructions
  - Component architecture breakdown
  - Development guide with common tasks and best practices
  - Deployment instructions for Vercel and MongoDB Atlas
  - Professional formatting with badges, emojis, and table of contents
  - Production-ready onboarding document for new developers

- **Updated CHANGELOG.md format**
  - Reformatted to follow Keep a Changelog standard
  - Added semantic versioning links
  - Organized into Added/Changed/Fixed/Removed/Technical sections
  - Better categorization and readability
  - Version comparison links at bottom

### Technical
- Improved project documentation structure
- Enhanced developer onboarding experience
- Added comprehensive API reference documentation
- Documented all user workflows and system architecture

---

## [0.2.0] - 2026-01-09

### Added

#### Event Images
- Multi-image upload support (up to 5 images per event)
- Image preview with individual removal before submission
- Grid layout for displaying event images
- Optional images (events can have 0-5 images)
- Conditional rendering to prevent blank frames

#### Live Event Ratings
- Real-time rating system for ongoing events
- Amber/gold themed live rating display on event cards
- Access control: unreserved events = anyone can rate, reserved events = only reserved users
- Live rating modal with star selection and visual feedback
- Separate from post-event ratings
- Real-time average calculation and display
- `LiveRatingButton` component for seamless integration

#### Post-Event Rating System
- Automatic rating prompts for users who attended events
- Triple-layer duplicate prevention (database + session + dismissal tracking)
- Star rating (1-5) with emoji feedback indicators
- Optional text comments (max 1000 characters)
- Optional photo uploads (up to 5 images per review)
- `RatingPrompt` component with smart filtering
- `RatingPopup` component with skip functionality
- Average rating and review count on event cards
- Full review display on event detail pages

#### Event Editing & Notifications
- Live event editing capability for hosts
- Automatic notification creation when live events are edited
- Notification queue system using MongoDB
- `EventUpdateNotification` popup component
- Double-layer duplicate notification prevention (database + localStorage)
- View event or dismiss actions in notifications

#### API Endpoints
- `POST /api/live-rating` - Submit or update live event rating
- `GET /api/live-rating` - Fetch user's live rating status and event stats
- `GET /api/user/notifications` - Retrieve pending event update notifications
- `POST /api/user/notifications/dismiss` - Mark notifications as read

#### UI Components
- `EventUpdateNotification.jsx` - Global notification system
- `LiveRatingButton.jsx` - Live rating display and interaction
- `RatingPrompt.jsx` - Auto-prompt for post-event ratings
- `RatingPopup.jsx` - Full-featured rating modal

### Changed

#### Database Schema
- **Event/Blog Model**
  - `image` (String) → `images` ([String]) - support multiple images
  - Added `lastUpdated` field to track modifications
  - Added `updateNotifications` array for change history
  - Added `liveRatings` array for real-time ratings
  - Added `averageLiveRating` and `totalLiveRatings` fields

- **User Model**
  - Added `pendingNotifications` array for notification queue
  - Added `ratedEvents` array to track rated events

#### UI/UX
- Modal backdrops changed from solid black to frosted glass effect
- Applied `rgba(255,255,255,0.1)` with `backdrop-filter: blur(10px)` to all modals
- Added inline "Rate" button on past event cards
- Enhanced animations and transitions throughout

#### API Routes
- `POST /api/blog` - Updated to handle multiple image uploads
- `PUT /api/blog` - Now allows live event editing and creates notifications
- `DELETE /api/blog` - Updated for image array handling
- `POST /api/rating` - Enhanced with multi-image upload support

#### Event Editing
- Edit capability extended from future-only to future + live events
- Past events remain locked from editing
- Edit button visibility updated for live events

### Fixed
- Image field errors when no image was uploaded
- Blank image frames appearing on event cards without images
- Rating popups appearing multiple times for same event
- Duplicate notifications showing repeatedly
- Import case sensitivity issue (`ConnectDB` vs `connectDB`)
- localStorage tracking for notification and rating prompts

### Technical
- Implemented multi-image handling across all components
- Built notification queueing system with MongoDB
- Enhanced localStorage strategies for client-side state tracking
- Real-time rating calculation algorithms
- Improved FormData handling for file uploads
- Better conditional rendering patterns throughout application

---

## [0.1.0] - 2026-01-09

### Added

#### Admin System
- Role-based access control with `isAdmin` field in user model
- Admin verification utility (`lib/utils/adminAuth.js`)
- Protected admin routes with authentication and authorization
- Admin panel with modern dashboard design
- Real-time event metrics (Total, Live, Upcoming, Past)
- Statistics cards with color-coded indicators
- Smart search functionality (title, host, type, location)
- Status filtering (All, Live, Future, Past events)
- Bulk selection with checkboxes
- Bulk delete operations
- Live results counter
- Modern sidebar navigation
- User profile display in admin header (name, email, avatar)
- Quick logout functionality

#### Documentation
- `ADMIN_SETUP.md` with admin user creation instructions
- Three methods documented: MongoDB Compass, Shell, API
- Security notes and best practices
- `.env.example` template for environment variables

### Changed

#### Admin Panel UI
- Complete redesign with professional modern aesthetic
- Enhanced data table with better readability
- Status badges with color coding (Live/Upcoming/Past)
- Improved date/time formatting
- Row hover effects for better UX
- Responsive layout for all screen sizes
- Smooth hover effects and transitions

#### Database
- Improved MongoDB connection handling with reuse checks
- Added connection error handling
- Environment variable support for `MONGODB_URI`

#### API
- Fixed hardcoded localhost URLs (now uses relative paths)
- Better authentication token handling in admin routes
- Improved error messages and status codes
- Enhanced DELETE protection (users delete own, admins delete any)
- Added confirmation dialogs to prevent accidental deletions

### Removed
- `/admin/addproduct` page (duplicate functionality)
- `/admin/subscription` page (unused feature)
- Simplified admin sidebar navigation

### Fixed
- Admin bloglist not sending authentication tokens on delete
- Hardcoded URLs preventing deployment compatibility
- Missing admin status checks in frontend
- Improved error handling and user feedback

### Technical
- JWT_SECRET properly configured
- Environment variable support via `.env`
- Admin root page redirects to bloglist

---

## [0.0.0] - 2026-01-09

### Added
- Initial release
- Basic event management functionality
- User authentication system
- Event creation, editing, and deletion
- Event RSVP system
- Interest tracking for events
- MongoDB database integration
- JWT-based authentication
- No styling (functional prototype)

---

[0.2.1]: https://github.com/Ss1now/events_hub/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Ss1now/events_hub/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Ss1now/events_hub/compare/v0.0.0...v0.1.0
[0.0.0]: https://github.com/Ss1now/events_hub/releases/tag/v0.0.0
