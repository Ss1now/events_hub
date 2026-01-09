# Events Hub - Comprehensive Project Analysis

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Authentication System](#authentication-system)
7. [Core Features](#core-features)
8. [User Workflows](#user-workflows)
9. [Admin Features](#admin-features)
10. [Component Architecture](#component-architecture)
11. [Key Technical Implementations](#key-technical-implementations)

---

## Project Overview

**Rice Events Hub** (also branded as "Rice Party") is a full-stack event management platform built with Next.js 16.1.1 and React 19. It enables users to discover, create, manage, and rate campus events at Rice University. The platform features real-time event status updates, reservation systems, live ratings, post-event reviews, and comprehensive notification systems.

**Key Capabilities:**
- Event creation with multi-image uploads
- Real-time event status tracking (future → live → past)
- Reservation management with capacity limits
- Live ratings during events
- Post-event reviews with photos
- Event update notifications
- Admin panel for event moderation
- Google Calendar integration
- Residential college affiliations

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16.1.1 (App Router)
- **React:** 19.2.3 with React Compiler enabled
- **Styling:** Tailwind CSS 4.0
- **UI Components:** Custom components with modern design
- **Notifications:** React Toastify 11.0.5
- **HTTP Client:** Axios 1.13.2
- **Fonts:** Google Fonts (Geist Sans, Geist Mono)

### Backend
- **Runtime:** Node.js with Next.js API Routes
- **Database:** MongoDB (Atlas Cloud)
- **ODM:** Mongoose 9.1.2
- **Authentication:** JWT (jsonwebtoken 9.0.3)
- **Password Hashing:** bcryptjs 3.0.3
- **Validation:** validator 13.15.26

### Development Tools
- **Linting:** ESLint 9 with Next.js config
- **Build System:** Next.js with Babel React Compiler
- **PostCSS:** Tailwind CSS PostCSS plugin

### Database Connection
- MongoDB Atlas cluster: `rice-events` database
- Connection string stored in environment variables
- Persistent connection management with Mongoose

---

## Project Structure

```
events_hub/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.js                # Root layout with fonts & ToastContainer
│   ├── page.js                  # Home page (Header + BlogList + Footer + RatingPrompt)
│   │
│   ├── api/                     # API Routes (Server-side)
│   │   ├── auth/
│   │   │   └── route.js        # POST: Login & Registration
│   │   ├── blog/
│   │   │   └── route.js        # GET, POST, PUT, DELETE, PATCH (events CRUD)
│   │   ├── rating/
│   │   │   └── route.js        # POST, GET (post-event reviews)
│   │   ├── live-rating/
│   │   │   └── route.js        # POST, GET (real-time ratings)
│   │   └── user/
│   │       ├── route.js        # GET, PUT (user profile & events)
│   │       └── notifications/
│   │           ├── route.js    # GET (fetch notifications)
│   │           └── dismiss/
│   │               └── route.js # POST (dismiss notification)
│   │
│   ├── login/
│   │   └── page.jsx            # Login page
│   ├── register/
│   │   └── page.jsx            # Registration page with college selector
│   │
│   ├── blogs/
│   │   └── [id]/
│   │       └── page.jsx        # Event detail page (dynamic route)
│   │
│   ├── me/
│   │   ├── page.jsx            # User profile dashboard
│   │   ├── postevent/
│   │   │   └── page.jsx        # Create event form
│   │   └── editevent/
│   │       └── [id]/
│   │           └── page.jsx    # Edit event form
│   │
│   └── admin/
│       ├── layout.jsx          # Admin layout with sidebar
│       ├── page.jsx            # Redirects to /admin/bloglist
│       └── bloglist/
│           └── page.jsx        # Admin event management dashboard
│
├── components/                  # React Components
│   ├── header.jsx              # Top navigation (login/logout/post event)
│   ├── footer.jsx              # Footer component
│   ├── bloglist.jsx            # Event listing with filters & search
│   ├── blogitem.jsx            # Event card component
│   ├── StarRating.jsx          # Reusable star rating component
│   ├── RatingPrompt.jsx        # Auto-prompt for unrated events
│   ├── RatingPopup.jsx         # Modal for submitting ratings
│   ├── ReviewForm.jsx          # Review submission form
│   ├── ReviewList.jsx          # Display list of reviews
│   ├── LiveRatingButton.jsx    # Live rating display & modal
│   ├── SuccessModal.jsx        # Success confirmation modal
│   ├── EventUpdateNotification.jsx  # Global notification system
│   └── admincomponents/
│       ├── sidebar.jsx         # Admin sidebar navigation
│       └── blogtableitem.jsx   # Admin event table row
│
├── lib/                        # Backend Logic
│   ├── config/
│   │   └── db.js              # MongoDB connection handler
│   ├── models/
│   │   ├── blogmodel.js       # Event/Blog schema
│   │   └── usermodel.js       # User schema
│   └── utils/
│       └── adminAuth.js       # Admin authorization helper
│
├── auth/
│   └── users.js               # Login & registration logic
│
├── context/
│   └── AuthContext.js         # React Context for auth (not actively used)
│
├── assets/
│   └── assets.js              # Static assets (logo, icons)
│
├── public/
│   └── images/
│       ├── blogs/             # Event images (uploaded)
│       └── reviews/           # Review images (uploaded)
│
├── package.json               # Dependencies
├── next.config.mjs            # Next.js config (React Compiler enabled)
├── tailwind.config.mjs        # Tailwind CSS config
├── postcss.config.mjs         # PostCSS config
├── eslint.config.mjs          # ESLint config
├── jsconfig.json              # JavaScript path aliases
├── CHANGELOG.md               # Version history
├── ADMIN_SETUP.md             # Admin user setup guide
└── README.md                  # Project documentation
```

---

## Database Schema

### Event Model (`blogmodel.js`)

**Collection:** `blog`

```javascript
{
  // Basic Info
  title: String (required),
  description: String (required),
  images: [String],                    // Array of image URLs (0-5 images)
  date: Date (default: now),           // Creation date
  
  // Timing
  startDateTime: Date (required),
  endDateTime: Date (required),
  status: String (enum: ['live', 'future', 'past'], default: 'future'),
  lastUpdated: Date (default: now),
  
  // Event Details
  eventType: String (required),         // e.g., "Private Party", "Workshop"
  theme: String (required),             // e.g., "Warm Neutrals"
  dressCode: String (required),         // e.g., "Cozy Chic"
  location: String (required),          // e.g., "Jones College Rooftop"
  host: String (required),              // Host name
  
  // Reservation System
  needReservation: Boolean (default: false),
  reserved: Number (default: 0),
  capacity: Number,
  reservationDeadline: Date,
  
  // User Interactions
  interestedUsers: [ObjectId] (ref: 'user'),
  reservedUsers: [ObjectId] (ref: 'user'),
  authorId: ObjectId (ref: 'user', required),
  
  // Notifications
  updateNotifications: [{
    message: String,
    timestamp: Date (default: now),
    notifiedUsers: [ObjectId] (ref: 'user')
  }],
  
  // Live Ratings (during event)
  liveRatings: [{
    userId: ObjectId (ref: 'user', required),
    rating: Number (1-5, required),
    timestamp: Date (default: now)
  }],
  averageLiveRating: Number (0-5, default: 0),
  totalLiveRatings: Number (default: 0),
  
  // Post-Event Ratings (after event)
  ratings: [{
    userId: ObjectId (ref: 'user', required),
    userName: String (required),
    rating: Number (1-5, required),
    comment: String (default: ''),
    images: [String] (default: []),
    date: Date (default: now)
  }],
  averageRating: Number (0-5, default: 0),
  totalRatings: Number (default: 0)
}
```

**Key Features:**
- **Dynamic Status:** Auto-calculated based on current time vs. start/end times
- **Dual Rating Systems:** Separate live and post-event ratings
- **Notification Queue:** Tracks updates and which users have been notified
- **Multi-Image Support:** 0-5 images per event
- **Reservation Management:** Capacity limits with deadline enforcement

---

### User Model (`usermodel.js`)

**Collection:** `user`

```javascript
{
  // Authentication
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  
  // Profile
  name: String (optional, default: ''),
  residentialCollege: String (optional),     // Rice University colleges
  isAdmin: Boolean (default: false),
  
  // Event Tracking
  interestedEvents: [ObjectId] (ref: 'blog'),
  reservedEvents: [ObjectId] (ref: 'blog'),
  ratedEvents: [ObjectId] (ref: 'blog'),
  
  // Notifications
  pendingNotifications: [{
    eventId: ObjectId (ref: 'blog'),
    notificationId: ObjectId,
    timestamp: Date
  }]
}
```

**Key Features:**
- **Role-Based Access:** Admin flag for privileged operations
- **Event Relationships:** Tracks all user interactions with events
- **Notification Queue:** Personal notification inbox
- **College Affiliation:** Rice University residential college system

---

## API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth`
**Purpose:** User login and registration

**Request Body:**
```javascript
{
  action: 'login' | 'register',
  email: string,
  password: string,
  name?: string,              // Register only
  residentialCollege?: string // Register only
}
```

**Response:**
```javascript
{
  success: boolean,
  token?: string,  // JWT token
  msg?: string     // Error message
}
```

**Flow:**
1. Login: Validates credentials, returns JWT
2. Register: Creates user with hashed password, returns JWT
3. JWT contains user ID, signed with `JWT_SECRET`

---

### Events (`/api/blog`)

#### GET `/api/blog?id={eventId}`
**Purpose:** Fetch single event or all events

**Query Parameters:**
- `id` (optional): Event MongoDB ObjectId

**Response:**
```javascript
// Single event
{
  _id, title, description, images, startDateTime, endDateTime,
  status, eventType, theme, dressCode, location, host,
  needReservation, reserved, capacity, reservationDeadline,
  interestedUsers, reservedUsers, authorId,
  liveRatings, averageLiveRating, totalLiveRatings,
  ratings, averageRating, totalRatings,
  updateNotifications
}

// All events
{
  blogs: [/* array of events */]
}
```

**Features:**
- Auto-updates event status based on current time
- Returns all event data including ratings and reservations

---

#### POST `/api/blog`
**Purpose:** Create new event

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Request Body:** FormData
```javascript
{
  title: string,
  description: string,
  images: File[],              // 0-5 images
  startDateTime: datetime,
  endDateTime: datetime,
  eventType: string,
  theme: string,
  dressCode: string,
  location: string,
  needReservation: boolean,
  reserved: number,
  capacity: number,
  reservationDeadline?: datetime,
  host: string
}
```

**Response:**
```javascript
{
  success: boolean,
  msg: string
}
```

**Flow:**
1. Validates JWT token
2. Uploads images to `/public/images/blogs/`
3. Calculates initial status (future/live/past)
4. Creates event with authorId from JWT
5. Returns success/error

---

#### PUT `/api/blog`
**Purpose:** Edit existing event

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Request Body:** FormData
```javascript
{
  eventId: string,
  title: string,
  description: string,
  images?: File[],            // Optional new images
  startDateTime: datetime,
  endDateTime: datetime,
  eventType: string,
  theme: string,
  dressCode: string,
  location: string,
  needReservation: boolean,
  reserved: number,
  capacity: number,
  reservationDeadline?: datetime,
  host: string
}
```

**Response:**
```javascript
{
  success: boolean,
  msg: string,
  isLiveEdit: boolean        // True if edited during live status
}
```

**Flow:**
1. Validates JWT and ownership
2. Checks edit permissions (only future/live events, not past)
3. Uploads new images if provided, deletes old ones
4. If live edit: Creates notification for interested/reserved users
5. Updates event and returns status

**Restrictions:**
- Only event author can edit
- Cannot edit past events
- Live edits trigger notifications

---

#### DELETE `/api/blog?id={eventId}`
**Purpose:** Delete event

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Query Parameters:**
- `id`: Event MongoDB ObjectId

**Response:**
```javascript
{
  success: boolean,
  msg: string
}
```

**Authorization:**
- Event author OR
- Admin user

**Flow:**
1. Validates JWT
2. Checks if user is author OR admin
3. Deletes event images from filesystem
4. Deletes event from database

---

#### PATCH `/api/blog`
**Purpose:** User actions (interested, reserve, cancel)

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Request Body:**
```javascript
{
  action: 'interested' | 'reserve' | 'cancel-reservation',
  eventId: string
}
```

**Response:**
```javascript
// Interested
{
  success: boolean,
  msg: string,
  interestedCount: number,
  isInterested: boolean      // New state
}

// Reserve
{
  success: boolean,
  msg: string,
  reserved: number,
  capacity: number
}

// Cancel Reservation
{
  success: boolean,
  msg: string,
  reserved: number,
  capacity: number
}
```

**Business Logic:**

**Interested:**
- Toggles user's interested status
- Updates event's `interestedUsers` array
- Updates user's `interestedEvents` array

**Reserve:**
- Validates reservation deadline
- Checks capacity limits
- Prevents duplicate reservations
- Updates event's `reservedUsers` and `reserved` count
- Updates user's `reservedEvents` array

**Cancel Reservation:**
- Removes user from `reservedUsers`
- Decrements `reserved` count
- Updates user's `reservedEvents` array

---

### Ratings (`/api/rating`)

#### POST `/api/rating`
**Purpose:** Submit post-event review

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Request Body:** FormData
```javascript
{
  eventId: string,
  rating: number (1-5),
  comment?: string,
  images?: File[]           // 0-5 images
}
```

**Response:**
```javascript
{
  success: boolean,
  msg: string,
  averageRating: number,
  totalRatings: number
}
```

**Validation Rules:**
1. Event must be in 'past' status
2. User cannot rate their own hosted events
3. If event requires reservation, only reserved users can rate
4. If event doesn't require reservation, anyone can rate
5. One rating per user per event
6. Rating must be 1-5

**Flow:**
1. Validates user and event
2. Uploads review images to `/public/images/reviews/`
3. Adds rating to event's `ratings` array
4. Recalculates `averageRating` and `totalRatings`
5. Adds event to user's `ratedEvents`

---

#### GET `/api/rating?eventId={eventId}`
**Purpose:** Get all reviews for an event

**Query Parameters:**
- `eventId`: Event MongoDB ObjectId

**Response:**
```javascript
{
  success: boolean,
  ratings: [{
    userId, userName, rating, comment, images, date
  }],
  averageRating: number,
  totalRatings: number
}
```

---

### Live Ratings (`/api/live-rating`)

#### POST `/api/live-rating`
**Purpose:** Submit/update real-time rating during event

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Request Body:** FormData
```javascript
{
  eventId: string,
  rating: number (1-5)
}
```

**Response:**
```javascript
{
  success: boolean,
  msg: string,
  averageLiveRating: number,
  totalLiveRatings: number
}
```

**Validation:**
1. Event must be in 'live' status (between start and end times)
2. If event requires reservation, only reserved users can rate
3. Users can update their rating multiple times

**Flow:**
1. Validates event is live
2. Checks reservation requirement
3. Adds or updates user's live rating
4. Recalculates `averageLiveRating` and `totalLiveRatings`

---

#### GET `/api/live-rating?eventId={eventId}`
**Purpose:** Check user's live rating status

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Response:**
```javascript
{
  success: boolean,
  hasRated: boolean,
  userRating: number,
  averageLiveRating: number,
  totalLiveRatings: number
}
```

---

### User Profile (`/api/user`)

#### GET `/api/user`
**Purpose:** Get current user's profile and events

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Response:**
```javascript
{
  success: boolean,
  user: {
    id, name, email, residentialCollege, isAdmin, ratedEvents
  },
  events: [/* user's created events */],
  interestedEvents: [/* events user is interested in */],
  reservedEvents: [/* events user reserved */]
}
```

**Features:**
- Auto-updates event statuses
- Returns all user's event relationships
- Used for profile page and event tracking

---

#### PUT `/api/user`
**Purpose:** Update user profile

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Request Body:**
```javascript
{
  name?: string,
  residentialCollege?: string
}
```

**Response:**
```javascript
{
  success: boolean,
  msg: string,
  user: {
    id, name, email, residentialCollege
  }
}
```

---

### Notifications (`/api/user/notifications`)

#### GET `/api/user/notifications`
**Purpose:** Get pending event update notifications

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Response:**
```javascript
{
  success: boolean,
  notifications: [{
    _id,
    eventId,
    eventTitle,
    notificationId,
    message,
    timestamp
  }]
}
```

**Flow:**
1. Fetches user's `pendingNotifications`
2. Joins with event data
3. Returns formatted notification list

---

#### POST `/api/user/notifications/dismiss`
**Purpose:** Mark notification as read

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Request Body:**
```javascript
{
  eventId: string,
  notificationId: string
}
```

**Response:**
```javascript
{
  success: boolean,
  msg: string
}
```

**Flow:**
1. Removes from user's `pendingNotifications`
2. Adds user to event's `updateNotifications.notifiedUsers`
3. Prevents re-showing

---

## Authentication System

### JWT-Based Authentication

**Token Generation:**
```javascript
// In auth/users.js
const createToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET)
}
```

**Token Storage:**
- Client-side: `localStorage.setItem('token', token)`
- Sent in headers: `Authorization: Bearer {token}`

**Token Verification:**
```javascript
// In API routes
const token = request.headers.get('authorization')?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const userId = decoded.id;
```

### Password Security

**Registration Flow:**
1. Validate email format with `validator.isEmail()`
2. Check if user exists
3. Hash password with bcryptjs (10 salt rounds)
4. Store hashed password in database
5. Generate and return JWT

**Login Flow:**
1. Find user by email
2. Compare password with `bcrypt.compare(password, hashedPassword)`
3. If match, generate and return JWT
4. If no match, return error

### Admin Authorization

**Helper Function:** `lib/utils/adminAuth.js`

```javascript
export const verifyAdmin = async (request) => {
  // Extract JWT
  // Verify token
  // Fetch user from database
  // Check isAdmin flag
  return { isAdmin: boolean, userId, error }
}
```

**Used In:**
- Admin dashboard access
- Bulk event deletion
- Event deletion (admins can delete any event)

---

## Core Features

### 1. Event Status System

**Status Types:**
- **Future:** Current time < startDateTime
- **Live:** startDateTime ≤ current time ≤ endDateTime
- **Past:** Current time > endDateTime

**Auto-Update Mechanism:**
- Calculated on every GET request
- Updated in database if status changed
- Affects UI display and permissions

**Status-Based Permissions:**
- **Future Events:**
  - Can edit
  - Can reserve (before deadline)
  - Can mark interested
  
- **Live Events:**
  - Can edit (triggers notifications)
  - Can submit live ratings
  - Can mark interested
  
- **Past Events:**
  - Cannot edit
  - Can submit post-event reviews
  - Read-only display

---

### 2. Reservation System

**Features:**
- Capacity management (max attendees)
- Reservation deadline enforcement
- Real-time availability tracking
- Reservation cancellation
- Admin override capabilities

**Validation Rules:**
```javascript
// Cannot reserve if:
- needReservation === false
- reservationDeadline passed
- capacity reached
- already reserved
```

**Database Updates:**
```javascript
// On Reserve
event.reservedUsers.push(userId)
event.reserved = event.reservedUsers.length
user.reservedEvents.push(eventId)

// On Cancel
event.reservedUsers = event.reservedUsers.filter(id => id !== userId)
event.reserved = event.reservedUsers.length
user.reservedEvents.pull(eventId)
```

---

### 3. Dual Rating Systems

#### A. Live Ratings (During Event)

**Purpose:** Real-time feedback during ongoing events

**Characteristics:**
- Only available when status === 'live'
- Can update rating multiple times
- No comments or images
- Instant feedback for hosts
- Separate from post-event ratings

**UI Display:**
- Amber/gold themed badge
- Shows average and count
- Modal for submission
- Updates in real-time

**Access Control:**
```javascript
if (needReservation) {
  // Only reserved users can rate
  const hasReservation = event.reservedUsers.includes(userId);
} else {
  // Anyone can rate
}
```

#### B. Post-Event Reviews (After Event)

**Purpose:** Detailed feedback after event completion

**Characteristics:**
- Only available when status === 'past'
- One review per user
- Supports 1-5 star rating
- Optional comment (max 1000 chars)
- Optional images (0-5 photos)
- Cannot edit after submission

**UI Display:**
- Star rating with average
- Full review cards with images
- Sorted by date (newest first)
- Profile integration

**Access Control:**
```javascript
// Cannot rate if:
- Event is not past
- User is event host
- Already rated
- (If needReservation) User didn't reserve
```

**Auto-Prompt System:**
- `RatingPrompt` component monitors user's attended events
- Shows popup 2 seconds after page load
- Only shows once per event (localStorage tracking)
- Can dismiss or skip to rate later

---

### 4. Notification System

**Trigger:** Live event editing by host

**Flow:**
1. Host edits live event
2. System creates notification in event's `updateNotifications`
3. Notification added to `pendingNotifications` of all interested/reserved users
4. Global `EventUpdateNotification` component polls for notifications
5. Shows frosted glass modal with event details
6. User can dismiss or view event
7. Dismissed notifications marked in database and localStorage

**Duplicate Prevention:**
```javascript
// Database level
notification.notifiedUsers.includes(userId)

// Session level
localStorage.getItem('shownEventNotifications')

// Component level
const [notifications, setNotifications] = useState([])
```

**Notification Data:**
```javascript
{
  message: "Event details have been updated for '{title}'",
  timestamp: Date,
  notifiedUsers: [userId1, userId2, ...]
}
```

---

### 5. Multi-Image Upload

**Features:**
- Upload 0-5 images per event
- Preview before submission
- Individual image removal
- Grid layout display
- Optional (events can have no images)

**File Handling:**
```javascript
// Upload
const timestamp = Date.now();
const filePath = `./public/images/blogs/${timestamp}_${index}_${filename}`;
await writeFile(filePath, buffer);
const imageUrl = `/images/blogs/${timestamp}_${index}_${filename}`;

// Delete (on edit/delete)
fs.unlink(`./public${imageUrl}`, () => {});
```

**Storage Locations:**
- Events: `/public/images/blogs/`
- Reviews: `/public/images/reviews/`

**Supported Formats:**
- All image types (`image/*`)

---

### 6. Search & Filtering

**Search Capabilities:**
- Event title
- Description
- Event type
- Location
- Theme
- Dress code
- Host name

**Filters:**
- Future events
- Live events
- Past events

**Implementation:**
```javascript
const filteredEvents = blogs.filter((item) => {
  const matchesStatus = item.status === menu;
  const matchesSearch = 
    item.title.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm) ||
    // ... other fields
  return matchesStatus && matchesSearch;
});
```

---

### 7. Calendar Integration

**Google Calendar:**
- "Add to Google Calendar" button
- Opens Google Calendar web interface
- Pre-fills event details

**ICS Export:**
- "Download .ics" button
- Creates iCalendar format file
- Compatible with Apple Calendar, Outlook, etc.

**Data Included:**
```javascript
- Event title
- Start/end datetime
- Description
- Location
- Event type, theme, dress code
- Host information
```

---

## User Workflows

### 1. User Registration & Login

**Registration:**
```
User → /register
  ↓
Fill form (email, password, optional: name, college)
  ↓
POST /api/auth (action: 'register')
  ↓
Server: Hash password, create user, generate JWT
  ↓
Store token in localStorage
  ↓
Redirect to home page
```

**Login:**
```
User → /login
  ↓
Fill credentials
  ↓
POST /api/auth (action: 'login')
  ↓
Server: Verify password, generate JWT
  ↓
Store token in localStorage
  ↓
Redirect to home page
```

---

### 2. Create Event

```
User (logged in) → Click "Post an event"
  ↓
/me/postevent
  ↓
Fill form:
  - Title, description
  - Upload images (0-5)
  - Start/end datetime
  - Event type, theme, dress code
  - Location, host
  - Reservation settings (optional)
  ↓
POST /api/blog (with JWT)
  ↓
Server:
  - Upload images
  - Calculate status
  - Create event with authorId
  ↓
Redirect to home page
  ↓
Event appears in "Future" tab
```

---

### 3. Browse & Search Events

```
User → Home page
  ↓
See three tabs: Future, Live, Past
  ↓
Use search bar (real-time filtering)
  ↓
Click event card → /blogs/[id]
  ↓
View full event details:
  - Images gallery
  - Event info
  - Live rating (if live)
  - Reviews (if past)
  - Action buttons
```

---

### 4. Mark Interest / Reserve Event

**Mark Interested (No Reservation):**
```
User → Event detail page
  ↓
Click "I'm Going"
  ↓
PATCH /api/blog (action: 'interested')
  ↓
Server: Add to interestedUsers & user.interestedEvents
  ↓
Show success modal with calendar options
  ↓
Can add to Google Calendar or download .ics
```

**Reserve Event:**
```
User → Event detail page (reservation required)
  ↓
Check: Deadline not passed, capacity available
  ↓
Click "Reserve Spot"
  ↓
PATCH /api/blog (action: 'reserve')
  ↓
Server:
  - Validate capacity & deadline
  - Add to reservedUsers
  - Increment reserved count
  ↓
Show success modal
  ↓
Event appears in "Reserved Events" on profile
```

---

### 5. Rate Event (Live)

```
Event becomes live (startDateTime reached)
  ↓
User attends event
  ↓
Click amber "Rate Live" button
  ↓
Modal opens with star rating
  ↓
Select 1-5 stars
  ↓
POST /api/live-rating
  ↓
Server:
  - Validate event is live
  - Check reservation requirement
  - Add/update liveRatings
  - Recalculate average
  ↓
Rating updates on event card
  ↓
User can update rating anytime during event
```

---

### 6. Review Event (Post-Event)

**Auto-Prompt:**
```
Event ends (endDateTime passed)
  ↓
User returns to site (attended event)
  ↓
RatingPrompt component detects unrated past event
  ↓
After 2 seconds → Show popup modal
  ↓
User can:
  - Skip → Dismiss (won't show again)
  - Rate Now → Review form
```

**Manual Review:**
```
User → Profile → Participated Events
  ↓
Click "Rate" button on past event
  ↓
OR: Event detail page → "Submit Review" section
  ↓
Fill review form:
  - Star rating (1-5)
  - Comment (optional)
  - Upload images (0-5)
  ↓
POST /api/rating
  ↓
Server:
  - Validate eligibility
  - Upload images
  - Add to ratings array
  - Recalculate average
  ↓
Review appears on event page
  ↓
Event added to user.ratedEvents
```

---

### 7. Edit Event

```
User (event author) → Profile → "My Events"
  ↓
Click "Edit" on event (must be future or live)
  ↓
/me/editevent/[id]
  ↓
Pre-filled form with existing data
  ↓
Make changes
  ↓
PUT /api/blog
  ↓
Server:
  - Verify ownership
  - Check event is not past
  - Upload new images (if any)
  - Delete old images
  - If live → Create notification
  ↓
If live edit:
  - Notification sent to interested/reserved users
  - EventUpdateNotification shows popup
  ↓
Event updated
```

---

### 8. Delete Event

```
User (author or admin) → Event card/detail
  ↓
Click "Delete"
  ↓
Confirm deletion
  ↓
DELETE /api/blog?id={eventId}
  ↓
Server:
  - Verify author OR admin
  - Delete image files
  - Delete event document
  ↓
Event removed from lists
```

---

### 9. Receive Notifications

```
Host edits live event
  ↓
Notification created in event.updateNotifications
  ↓
Added to pendingNotifications of all interested/reserved users
  ↓
User visits any page
  ↓
EventUpdateNotification component:
  - GET /api/user/notifications
  - Filter out already-shown (localStorage)
  ↓
Show frosted glass modal:
  - Event title
  - Update message
  - Timestamp
  ↓
User actions:
  - View Event → Navigate to /blogs/[id]
  - Dismiss → POST /api/user/notifications/dismiss
  ↓
Notification removed from queue
  ↓
Won't show again (database + localStorage)
```

---

### 10. Profile Management

```
User → Click "My Profile"
  ↓
/me
  ↓
GET /api/user
  ↓
View tabs:
  - Hosted Events
  - Interested Events
  - Reserved Events
  - Participated Events (past)
  ↓
Actions per tab:
  - Hosted: Edit, Delete
  - Interested: Remove interest
  - Reserved: Cancel reservation, Add to calendar
  - Participated: Rate (if not rated)
  ↓
Edit Personal Info:
  - Click "Edit Personal Info"
  - Update name, residential college
  - PUT /api/user
  - Profile updated
```

---

## Admin Features

### Admin Access Control

**Setup:**
- Admin flag must be manually set in database
- Three methods documented in `ADMIN_SETUP.md`:
  1. MongoDB Compass GUI
  2. MongoDB Shell
  3. Temporary API route (delete after use)

**Verification:**
```javascript
// On admin page load
const userResponse = await axios.get('/api/user');
if (!userResponse.data.user.isAdmin) {
  redirect to home
}
```

---

### Admin Dashboard (`/admin/bloglist`)

**Features:**

1. **Statistics Cards**
   - Total events
   - Live events count
   - Future events count
   - Past events count

2. **Search & Filter**
   - Search by title, host, type, location
   - Filter by status (all, future, live, past)
   - Real-time filtering

3. **Bulk Operations**
   - Select all checkbox
   - Individual event selection
   - Bulk delete selected events

4. **Event Table**
   - Sortable columns
   - Event preview with images
   - Quick actions (view, delete)
   - Status badges

5. **Event Management**
   - Delete ANY event (regardless of author)
   - View full event details
   - Monitor reservations and ratings

**Authorization:**
```javascript
// DELETE /api/blog
const isAuthor = blog.authorId.toString() === userId;
const isAdmin = user?.isAdmin || false;

if (!isAuthor && !isAdmin) {
  return 403 Unauthorized;
}
```

**Admin Sidebar:**
- Dashboard (stats)
- Event List
- Logout

---

## Component Architecture

### Page Components

**Home (`app/page.js`):**
```jsx
<Header />           // Navigation
<BlogList />         // Event cards with filters
<Footer />           // Footer
<RatingPrompt />     // Auto-prompt for reviews
```

**Event Detail (`app/blogs/[id]/page.jsx`):**
```jsx
<Header />
<EventHeader />      // Title, date, location, tags
<LiveRatingButton /> // If status === 'live'
<ActionButtons />    // Reserve/Interest/Share
<EventImages />      // Image gallery
<EventDetails />     // Full description
<ReviewSection />    // If status === 'past'
  <ReviewForm />
  <ReviewList />
<Footer />
```

**Profile (`app/me/page.jsx`):**
```jsx
<Header />
<PersonalInfo />     // Edit name, college
<EventTabs />
  <HostedEvents />
  <InterestedEvents />
  <ReservedEvents />
  <ParticipatedEvents />
<Footer />
```

**Admin (`app/admin/bloglist/page.jsx`):**
```jsx
<AdminLayout>
  <Sidebar />
  <StatsCards />
  <SearchBar />
  <FilterTabs />
  <BulkActions />
  <EventTable />
</AdminLayout>
```

---

### Reusable Components

**StarRating (`components/StarRating.jsx`):**
- Props: `rating`, `onRatingChange`, `readonly`, `size`
- Modes: Interactive (clickable) or display-only
- Hover effects for interactive mode
- Half-star support for display mode

**LiveRatingButton (`components/LiveRatingButton.jsx`):**
- Displays current live rating average
- Opens modal for rating submission
- Checks reservation requirements
- Updates in real-time
- Amber/gold themed

**RatingPrompt (`components/RatingPrompt.jsx`):**
- Auto-detects unrated past events
- Shows 2 seconds after page load
- Opens RatingPopup modal
- Tracks shown events in localStorage

**RatingPopup (`components/RatingPopup.jsx`):**
- Full review submission form
- Star rating + comment + images
- Skip or submit options
- Prevents duplicate popups

**SuccessModal (`components/SuccessModal.jsx`):**
- Shows after reserve/interest actions
- Calendar integration options
- Celebration animation

**EventUpdateNotification (`components/EventUpdateNotification.jsx`):**
- Global notification listener
- Polls on page load
- Frosted glass modal
- Dismiss or view event
- Prevents duplicate shows

**BlogItem (`components/blogitem.jsx`):**
- Event card component
- Status badge
- Quick actions (interest/reserve)
- Live rating display
- Responsive design

---

### Layout Components

**Root Layout (`app/layout.js`):**
```jsx
<html>
  <body className={fonts}>
    {children}
    <EventUpdateNotification />  // Global
    <ToastContainer />            // Global
  </body>
</html>
```

**Admin Layout (`app/admin/layout.jsx`):**
```jsx
<div className="flex">
  <Sidebar />
  <main>{children}</main>
</div>
```

---

## Key Technical Implementations

### 1. Dynamic Event Status

**Auto-Calculation:**
```javascript
const now = new Date();
const startTime = new Date(event.startDateTime);
const endTime = new Date(event.endDateTime);

let currentStatus;
if (now < startTime) {
  currentStatus = 'future';
} else if (now >= startTime && now <= endTime) {
  currentStatus = 'live';
} else {
  currentStatus = 'past';
}

if (event.status !== currentStatus) {
  event.status = currentStatus;
  await event.save();
}
```

**Applied On:**
- GET /api/blog (all events)
- GET /api/blog?id={id} (single event)
- GET /api/user (user's events)

---

### 2. Image Upload & Storage

**Upload Process:**
```javascript
const formData = await request.formData();
const images = formData.getAll('images');
const imageUrls = [];

const timestamp = Date.now();
const dir = './public/images/blogs';
await mkdir(dir, { recursive: true });

for (let i = 0; i < images.length; i++) {
  const image = images[i];
  const imageByteData = await image.arrayBuffer();
  const buffer = Buffer.from(imageByteData);
  const filePath = `${dir}/${timestamp}_${i}_${image.name}`;
  await writeFile(filePath, buffer);
  imageUrls.push(`/images/blogs/${timestamp}_${i}_${image.name}`);
}

event.images = imageUrls;
```

**Deletion:**
```javascript
if (event.images && event.images.length > 0) {
  event.images.forEach(image => {
    fs.unlink(`./public${image}`, () => {});
  });
}
```

---

### 3. Rating Calculations

**Average Rating:**
```javascript
event.totalRatings = event.ratings.length;
const sum = event.ratings.reduce((acc, r) => acc + r.rating, 0);
event.averageRating = sum / event.totalRatings;
```

**Live Rating:**
```javascript
const totalRatings = event.liveRatings.length;
const sumRatings = event.liveRatings.reduce((sum, r) => sum + r.rating, 0);
event.averageLiveRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
event.totalLiveRatings = totalRatings;
```

---

### 4. Notification Queue

**Create Notification:**
```javascript
// On live event edit
const notificationId = new mongoose.Types.ObjectId();

event.updateNotifications.push({
  _id: notificationId,
  message: `Event details have been updated for "${event.title}"`,
  timestamp: new Date(),
  notifiedUsers: []
});

const affectedUsers = [...event.interestedUsers, ...event.reservedUsers];

await userModel.updateMany(
  { _id: { $in: affectedUsers } },
  {
    $push: {
      pendingNotifications: {
        eventId: event._id,
        notificationId: notificationId,
        timestamp: new Date()
      }
    }
  }
);
```

**Dismiss Notification:**
```javascript
// Remove from user's queue
user.pendingNotifications = user.pendingNotifications.filter(
  n => !(n.eventId.toString() === eventId && 
         n.notificationId.toString() === notificationId)
);

// Mark as notified in event
notification.notifiedUsers.push(userId);
```

---

### 5. Duplicate Prevention

**Rating Prompts:**
```javascript
// Three-layer prevention
const ratedEvents = user.ratedEvents || [];                         // DB
const dismissedPopups = JSON.parse(localStorage.getItem('dismissedRatingPopups') || '[]');  // Dismissed
const shownRatingPopups = JSON.parse(localStorage.getItem('shownRatingPopups') || '[]');    // Shown

const unratedPastEvent = attendedEvents.find(event => 
  event.status === 'past' && 
  !ratedEvents.includes(event._id) &&
  !dismissedPopups.includes(event._id) &&
  !shownRatingPopups.includes(event._id)
);
```

**Notifications:**
```javascript
// Database level
notification.notifiedUsers.includes(userId)

// Session level
const shownNotifications = JSON.parse(
  localStorage.getItem('shownEventNotifications') || '[]'
);
const newNotifications = response.data.notifications.filter(
  n => !shownNotifications.includes(n.notificationId.toString())
);
```

---

### 6. MongoDB Connection Management

**Singleton Pattern:**
```javascript
export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("DB already connected");
    return;
  }
  
  await mongoose.connect(mongodbUri);
  console.log("DB Connected");
}
```

**Called In:**
- API routes (explicit calls)
- `LoadDB()` in blog route (on module load)

---

### 7. Responsive Design

**Tailwind Breakpoints:**
```javascript
// Mobile-first approach
className='text-xl sm:text-2xl md:text-3xl lg:text-4xl'
className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
className='px-5 md:px-12 lg:px-28'
```

**Adaptive Components:**
- Header: Simplified mobile menu
- Event cards: Stack on mobile, grid on desktop
- Forms: Full-width on mobile, centered on desktop

---

### 8. Client-Side Routing

**Next.js App Router:**
- File-based routing in `app/` directory
- Dynamic routes: `[id]`, `[...slug]`
- Automatic code splitting
- Client-side navigation with `useRouter`

**Protected Routes:**
```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
  }
}, []);
```

---

### 9. Form Handling

**FormData for File Uploads:**
```javascript
const formData = new FormData();
formData.append('title', data.title);
formData.append('description', data.description);
images.forEach((image) => {
  formData.append('images', image);
});

await axios.post('/api/blog', formData, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**JSON for Simple Data:**
```javascript
const response = await axios.patch('/api/blog', 
  { action: 'interested', eventId: id },
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

---

### 10. Error Handling

**API Routes:**
```javascript
try {
  // Business logic
  return NextResponse.json({ success: true, data });
} catch (error) {
  console.error(error);
  return NextResponse.json({ 
    success: false, 
    msg: 'Error message' 
  }, { status: 500 });
}
```

**Client-Side:**
```javascript
try {
  const response = await axios.post('/api/endpoint');
  if (response.data.success) {
    toast.success(response.data.msg);
  } else {
    toast.error(response.data.msg);
  }
} catch (error) {
  toast.error(error.response?.data?.msg || 'Network error');
}
```

---

## Environment Variables

**Required:**
```bash
MONGODB_URI=mongodb+srv://...          # MongoDB connection string
JWT_SECRET=your-secret-key             # JWT signing key
```

**Database:**
- Cluster: `cluster0.oju86lo.mongodb.net`
- Database: `rice-events`
- Collections: `users`, `blogs`

---

## Development Workflow

**Start Dev Server:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
npm start
```

**Linting:**
```bash
npm run lint
```

---

## Future Enhancement Opportunities

Based on the codebase analysis, here are potential improvements:

1. **Real-Time Updates:** WebSockets for live event changes
2. **Email Notifications:** Send email alerts for event updates
3. **Event Categories:** Add category filtering
4. **User Profiles:** Public user profiles with event history
5. **Social Features:** Comments, event discussions
6. **Analytics:** Event attendance tracking, popular events
7. **Mobile App:** React Native version
8. **Export Features:** Export attendee lists, event reports
9. **Calendar Sync:** Two-way Google Calendar sync
10. **Payment Integration:** Paid event ticketing

---

## Conclusion

Rice Events Hub is a comprehensive, production-ready event management platform with sophisticated features including dual rating systems, real-time notifications, reservation management, and admin capabilities. The codebase demonstrates modern web development practices with Next.js 16, React 19, MongoDB, and JWT authentication.

**Key Strengths:**
- Clean, modular architecture
- Comprehensive feature set
- Strong security practices
- Responsive design
- Real-time updates
- User-friendly workflows

**For New Developers:**
- Start with authentication flow
- Understand event lifecycle (future→live→past)
- Study API endpoint patterns
- Review component reusability
- Test user workflows end-to-end
- Explore admin features last

This analysis should provide a complete understanding of the system for onboarding new developers or continuing development.
