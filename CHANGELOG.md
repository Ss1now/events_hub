# Changelog

All notable changes to Rice Party Events Hub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Event reservation system
- Interest tracking for events
- MongoDB database integration
- JWT-based authentication
- No styling (functional prototype)

---

[0.2.1]: https://github.com/Ss1now/events_hub/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Ss1now/events_hub/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Ss1now/events_hub/compare/v0.0.0...v0.1.0
[0.0.0]: https://github.com/Ss1now/events_hub/releases/tag/v0.0.0
