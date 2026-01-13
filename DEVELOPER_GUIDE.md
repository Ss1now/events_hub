# Rice Events - Developer Guide

Complete technical documentation for developers working on Rice Events.

Version 0.5.8

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Key Algorithms](#key-algorithms)
- [Styling Guide](#styling-guide)
- [State Management](#state-management)
- [Security Implementation](#security-implementation)
- [Testing](#testing)
- [Deployment](#deployment)

## Architecture Overview

Rice Events is built as a full-stack Next.js application using the App Router pattern. The architecture follows a serverless model where API routes handle backend logic and React Server Components manage the frontend.

### Core Architecture Patterns

**Frontend**
- React Server Components for initial page loads
- Client Components for interactive features
- Custom hooks for reusable logic
- Context API for authentication state (legacy, minimal usage)
- LocalStorage for client-side caching

**Backend**
- Next.js API Routes as serverless functions
- MongoDB with Mongoose ODM
- JWT-based stateless authentication
- Cloudinary for image storage
- Resend for email delivery

**Data Flow**
1. User action triggers client-side event
2. Axios sends request to API route
3. API route validates JWT token
4. MongoDB query executes
5. Response returns to client
6. UI updates with toast notification

## Technology Stack

### Frontend Technologies

**Next.js 16.1.1**
- App Router for file-based routing
- React Server Components by default
- API Routes for backend endpoints
- Image optimization with next/image
- Built-in PostCSS and Tailwind support

**React 19.2.3**
- React Compiler enabled for automatic optimization
- Hooks for state and effects
- Context API for auth (minimal usage)
- Client/Server Component boundary management

**Tailwind CSS 4.0**
- Utility-first CSS framework
- Custom color palette (Rice Blue: #00205B)
- Responsive design utilities
- Custom CSS properties for theming

**Framer Motion 11.18.0**
- Modal animations (slide, fade, scale)
- Notification animations
- Smooth transitions

**Additional Libraries**
- axios 1.13.2 - HTTP client
- react-toastify 11.0.5 - Toast notifications
- js-cookie 3.1.3 - Cookie management

### Backend Technologies

**Database**
- MongoDB (cloud-hosted on Atlas)
- Mongoose 9.1.2 - ODM for schema validation

**Authentication**
- jsonwebtoken 9.0.3 - JWT signing and verification
- bcryptjs 3.0.3 - Password hashing
- validator 13.15.26 - Email and input validation

**File Storage**
- Cloudinary 2.8.0 - Image uploads and transformations
- Local fallback to /public/images/ for development

**Email Service**
- Resend - Password reset emails
- HTML email templates
- Fallback to console logging in development

## Getting Started

### Prerequisites

```bash
# Required
node >= 18.0.0
npm >= 9.0.0

# Accounts needed
MongoDB Atlas account
Cloudinary account (optional)
Resend account (optional)
```

### Installation

```bash
# Clone repository
git clone https://github.com/Ss1now/events_hub.git
cd events_hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local:
# MONGODB_URI=your-connection-string
# JWT_SECRET=generated-secret-above
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Running Development Server

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
```

### Building for Production

```bash
# Create production build
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel --prod
```

## Project Structure

```
events_hub/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   ├── auth/
│   │   │   └── route.js         # Login/Register
│   │   ├── blog/
│   │   │   └── route.js         # Event CRUD
│   │   ├── live-rating/
│   │   │   └── route.js         # Live ratings
│   │   ├── rating/
│   │   │   └── route.js         # Post-event reviews
│   │   ├── reset-password/
│   │   │   └── route.js         # Password recovery
│   │   ├── feedback/
│   │   │   └── route.js         # User feedback
│   │   ├── cohost/
│   │   │   └── route.js         # Co-host management
│   │   └── user/
│   │       ├── route.js         # User profile
│   │       └── notifications/
│   │           └── route.js     # Notification management
│   ├── admin/                    # Admin panel
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   ├── bloglist/
│   │   │   └── page.jsx
│   │   └── feedback/
│   │       └── page.jsx
│   ├── blogs/[id]/              # Event detail page
│   │   └── page.jsx
│   ├── login/
│   │   └── page.jsx
│   ├── register/
│   │   └── page.jsx
│   ├── forgot-password/
│   │   └── page.jsx
│   ├── reset-password/
│   │   └── page.jsx
│   ├── me/                       # User dashboard
│   │   ├── page.jsx
│   │   ├── postevent/
│   │   │   └── page.jsx
│   │   └── editevent/[id]/
│   │       └── page.jsx
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── header.jsx
│   ├── footer.jsx
│   ├── bloglist.jsx
│   ├── blogitem.jsx
│   ├── StarRating.jsx
│   ├── LiveRatingButton.jsx
│   ├── RatingPrompt.jsx
│   ├── RatingPopup.jsx
│   ├── ReviewForm.jsx
│   ├── ReviewList.jsx
│   ├── SuccessModal.jsx
│   ├── FeedbackModal.jsx
│   ├── ShareModal.jsx
│   ├── EventUpdateNotification.jsx
│   ├── EventCreatedModal.jsx
│   ├── CohostInviteModal.jsx
│   ├── CohostInvitationNotification.jsx
│   └── admincomponents/
│       ├── sidebar.jsx
│       └── blogtableitem.jsx
│
├── lib/                          # Backend logic
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── cloudinary.js        # Cloudinary config
│   ├── models/
│   │   ├── blogmodel.js         # Event schema
│   │   ├── usermodel.js         # User schema
│   │   └── feedbackmodel.js     # Feedback schema
│   └── utils/
│       ├── adminAuth.js         # Admin verification
│       └── cloudinary.js        # Image upload helpers
│
├── auth/
│   └── users.js                 # Auth logic
│
├── context/
│   └── AuthContext.js           # Auth context (legacy)
│
├── assets/
│   └── assets.js                # Static assets
│
├── public/
│   └── images/
│       └── blogs/               # Uploaded images
│
├── docs/                         # Documentation
│   ├── setup/
│   ├── features/
│   └── technical/
│
├── .env.local                    # Environment variables (create this)
├── .env.example                  # Environment template
├── package.json
├── next.config.mjs
├── tailwind.config.js
├── jsconfig.json
└── README.md
```

### File Naming Conventions

- **API Routes:** `route.js` (Next.js App Router convention)
- **Pages:** `page.jsx`
- **Layouts:** `layout.jsx`
- **Components:** `ComponentName.jsx` (PascalCase)
- **Utilities:** `utilityName.js` (camelCase)
- **Models:** `modelname.js` (lowercase)

## Database Schema

### Event Model (blogmodel.js)

Collection: `blog`

```javascript
const blogSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  },
  
  // Event Timing
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['future', 'live', 'past'],
    default: 'future'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Event Details
  eventType: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  host: {
    type: String,
    required: true
  },
  
  // RSVP System
  needReservation: {
    type: Boolean,
    default: false
  },
  capacity: Number,
  reservationDeadline: Date,
  
  // User Relationships
  interestedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  reservedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  
  // Co-hosting
  cohosts: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    name: String,
    username: String
  }],
  
  // Update Tracking
  updateNotifications: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notifiedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }]
  }],
  
  // Live Ratings
  liveRatings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  averageLiveRating: {
    type: Number,
    default: 0
  },
  totalLiveRatings: {
    type: Number,
    default: 0
  },
  
  // Post-Event Ratings
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    date: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  }
});

// Virtual field for reserved count
blogSchema.virtual('reserved').get(function() {
  return this.reservedUsers.length;
});
```

**Key Features:**
- Virtual `reserved` field calculated from array length
- Dual rating systems (live and post-event)
- Co-host array with denormalized names for performance
- Update notification queue
- Multi-image support (0-5 images)

### User Model (usermodel.js)

Collection: `user`

```javascript
const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  
  // Profile
  name: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  residentialCollege: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  
  // Email Subscriptions
  emailSubscriptions: {
    reminders: {
      type: Boolean,
      default: false
    },
    updates: {
      type: Boolean,
      default: false
    },
    patchNotes: {
      type: Boolean,
      default: false
    }
  },
  
  // Event Tracking
  interestedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'blog'
  }],
  reservedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'blog'
  }],
  ratedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'blog'
  }],
  
  // Co-hosting
  cohostInvitations: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blog'
    },
    eventTitle: String,
    invitedBy: String,
    invitedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  
  // Notifications
  pendingNotifications: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blog'
    },
    notificationId: mongoose.Schema.Types.ObjectId,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  eventUpdateNotifications: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blog'
    },
    eventTitle: String,
    changes: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  
  // Password Recovery
  resetPasswordToken: String,
  resetPasswordExpires: Date
});
```

**Key Features:**
- Sparse unique index on username (allows null values)
- Email subscription preferences per notification type
- Dual notification systems (pending + event updates)
- Password reset token with expiration
- Event relationship tracking

### Feedback Model (feedbackmodel.js)

Collection: `feedback`

```javascript
const feedbackSchema = new mongoose.Schema({
  feedback: {
    type: String,
    required: true,
    maxLength: 1000
  },
  email: {
    type: String,
    default: 'Anonymous'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  userName: String,
  status: {
    type: String,
    enum: ['new', 'read', 'resolved'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

**Key Features:**
- Anonymous feedback support
- Auto-capture of logged-in user info
- Status workflow: new → read → resolved

## API Reference

### Authentication

#### POST /api/auth

```javascript
// Login
{
  action: 'login',
  email: 'user@rice.edu',
  password: 'password123'
}

// Register
{
  action: 'register',
  email: 'user@rice.edu',
  password: 'password123',
  name: 'John Doe',
  residentialCollege: 'Baker College',
  emailConsent: true
}

// Response
{
  success: true,
  token: 'jwt-token',
  user: {
    _id: 'user-id',
    name: 'John Doe',
    email: 'user@rice.edu',
    isAdmin: false
  }
}
```

**Implementation Details:**
- Password hashing with bcryptjs (10 rounds)
- JWT expiration: 7 days
- Auto-generates username from email
- Sets emailSubscriptions to true if consent given

### Events

#### GET /api/blog

```javascript
// Get all events
GET /api/blog

// Get single event
GET /api/blog?id=<event-id>

// Response
{
  success: true,
  blogs: [/* array of events */]
}
```

**Status Calculation Logic:**
```javascript
const now = new Date();
if (now < event.startDateTime) status = 'future';
else if (now >= event.startDateTime && now <= event.endDateTime) status = 'live';
else status = 'past';
```

#### POST /api/blog

```javascript
// FormData
{
  title: 'Party at Jones',
  description: 'Come hang out',
  images: [File, File],  // 0-5 files
  startDateTime: '2026-01-15T19:00',
  endDateTime: '2026-01-15T23:00',
  eventType: 'Party',
  location: 'Jones Commons',
  needReservation: true,
  capacity: 50,
  reservationDeadline: '2026-01-15T17:00'
}

// Response
{
  success: true,
  msg: 'Event created',
  event: {/* created event data */}
}
```

**Image Upload Process:**
1. Validate file count (max 5)
2. Upload to /public/images/blogs/
3. Generate unique filename with timestamp
4. Store relative path in database

#### PUT /api/blog

```javascript
// Edit event (FormData)
{
  eventId: 'event-id',
  title: 'Updated Title',
  // ... other fields
  existingImages: ['path1.jpg', 'path2.jpg'],
  newImages: [File]  // Optional new uploads
}

// Response
{
  success: true,
  msg: 'Event updated',
  isLiveEdit: false
}
```

**Live Edit Notification Logic:**
```javascript
if (event.status === 'live') {
  // Create notifications for interested/reserved users
  const affectedUsers = [
    ...event.interestedUsers,
    ...event.reservedUsers
  ];
  
  affectedUsers.forEach(userId => {
    // Add to eventUpdateNotifications
  });
}
```

#### PATCH /api/blog

```javascript
// Interested action
{
  action: 'interested',
  eventId: 'event-id'
}

// RSVP action
{
  action: 'reserve',
  eventId: 'event-id'
}

// Cancel RSVP
{
  action: 'cancel-rsvp',
  eventId: 'event-id'
}

// Response
{
  success: true,
  msg: 'Action completed'
}
```

**RSVP Validation:**
```javascript
// Check capacity
if (event.reservedUsers.length >= event.capacity) {
  return error('Event is full');
}

// Check deadline
if (new Date() > event.reservationDeadline) {
  return error('RSVP deadline has passed');
}
```

#### DELETE /api/blog

```javascript
DELETE /api/blog?id=<event-id>

// Response
{
  success: true,
  msg: 'Event deleted'
}
```

**Authorization Logic:**
```javascript
// Users can delete own events
if (event.authorId === userId) allow();

// Admins can delete any event
if (user.isAdmin) allow();

// Co-hosts cannot delete (only edit)
else deny();
```

### Ratings

#### POST /api/live-rating

```javascript
{
  eventId: 'event-id',
  rating: 4  // 1-5 stars
}

// Response
{
  success: true,
  msg: 'Rating submitted',
  averageRating: 4.2,
  totalRatings: 15
}
```

**Access Control:**
```javascript
// For reserved events
if (event.needReservation) {
  if (!event.reservedUsers.includes(userId)) {
    return error('Must RSVP to rate');
  }
}

// For unreserved events
// Anyone can rate
```

**Rating Calculation:**
```javascript
// Update or add rating
const existingRating = event.liveRatings.find(r => r.userId === userId);
if (existingRating) {
  existingRating.rating = newRating;
} else {
  event.liveRatings.push({ userId, rating: newRating });
}

// Recalculate average
const sum = event.liveRatings.reduce((acc, r) => acc + r.rating, 0);
event.averageLiveRating = sum / event.liveRatings.length;
event.totalLiveRatings = event.liveRatings.length;
```

#### POST /api/rating

```javascript
// FormData
{
  eventId: 'event-id',
  rating: 5,
  comment: 'Great event!',
  images: [File, File]  // 0-5 files
}

// Response
{
  success: true,
  msg: 'Review submitted'
}
```

**Duplicate Prevention:**
```javascript
// Check if user already rated
const existingRating = event.ratings.find(r => r.userId === userId);
if (existingRating) {
  return error('Already rated this event');
}

// Add to user's rated events
user.ratedEvents.push(eventId);
```

#### PUT /api/rating

```javascript
// Edit review (FormData)
{
  eventId: 'event-id',
  rating: 4,
  comment: 'Updated comment',
  existingImages: ['path1.jpg'],
  newImages: [File]
}

// Response
{
  success: true,
  msg: 'Review updated'
}
```

**Edit Logic:**
```javascript
// Find existing review
const review = event.ratings.find(r => r.userId === userId);

// Update fields
review.rating = newRating;
review.comment = newComment;
review.updatedAt = new Date();

// Handle images
review.images = [...existingImages, ...uploadedNewImages];

// Recalculate average
updateAverageRating(event);
```

### User Management

#### GET /api/user

```javascript
// Response
{
  success: true,
  user: {
    id: 'user-id',
    name: 'John Doe',
    email: 'user@rice.edu',
    username: 'johndoe',
    residentialCollege: 'Martel',
    isAdmin: false,
    emailSubscriptions: {
      reminders: true,
      updates: true,
      patchNotes: false
    },
    cohostInvitations: [/* invitations */],
    eventUpdateNotifications: [/* notifications */]
  },
  events: [/* created events */],
  cohostedEvents: [/* co-hosted events */],
  interestedEvents: [/* interested */],
  reservedEvents: [/* reserved */]
}
```

**Population Strategy:**
```javascript
// Populate all event relationships
User.findById(userId)
  .populate('interestedEvents')
  .populate('reservedEvents')
  .populate({
    path: 'cohostInvitations.eventId',
    select: 'title startDateTime location'
  });

// Fetch created events
Event.find({ authorId: userId });

// Fetch co-hosted events
Event.find({ 'cohosts.userId': userId });
```

#### PUT /api/user

```javascript
{
  name: 'Jane Doe',
  username: 'janedoe2',
  residentialCollege: 'McMurtry College'
}

// Response
{
  success: true,
  msg: 'Profile updated'
}
```

**Username Validation:**
```javascript
// Format: 3-20 chars, lowercase letters, numbers, underscores
const usernameRegex = /^[a-z0-9_]{3,20}$/;

// Check uniqueness
const existing = await User.findOne({ username: newUsername });
if (existing && existing._id !== userId) {
  return error('Username taken');
}
```

### Co-hosting

#### GET /api/cohost

```javascript
GET /api/cohost?search=janedoe&eventId=event-id

// Response
{
  success: true,
  users: [{
    _id: 'user-id',
    name: 'Jane Doe',
    email: 'jane@rice.edu',
    username: 'janedoe'
  }]
}
```

**Search Logic:**
```javascript
// Search by username OR email (case-insensitive)
const users = await User.find({
  $or: [
    { username: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ]
});

// Filter out existing co-hosts and author
const filtered = users.filter(u => 
  u._id !== event.authorId &&
  !event.cohosts.some(c => c.userId === u._id)
);
```

#### POST /api/cohost

```javascript
{
  eventId: 'event-id',
  userId: 'user-id-to-invite'
}

// Response
{
  success: true,
  msg: 'Invitation sent'
}
```

**Invitation Creation:**
```javascript
// Add to user's cohostInvitations array
user.cohostInvitations.push({
  eventId,
  eventTitle: event.title,
  invitedBy: inviter.name,
  status: 'pending'
});
```

#### PATCH /api/cohost

```javascript
{
  invitationId: 'invitation-id',
  action: 'accept' | 'decline'
}

// Response
{
  success: true,
  msg: 'Invitation accepted'
}
```

**Accept Logic:**
```javascript
if (action === 'accept') {
  // Add to event's cohosts array
  event.cohosts.push({
    userId: user._id,
    name: user.name,
    username: user.username
  });
  
  // Update invitation status
  invitation.status = 'accepted';
}
```

### Password Recovery

#### POST /api/reset-password (Request Reset)

```javascript
{
  action: 'request-reset',
  email: 'user@rice.edu'
}

// Response
{
  success: true,
  msg: 'Reset link sent to your email'
}
```

**Token Generation:**
```javascript
const crypto = require('crypto');

// Generate random token
const resetToken = crypto.randomBytes(32).toString('hex');

// Hash for database storage
const hashedToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');

// Store in database
user.resetPasswordToken = hashedToken;
user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

// Send email with original token
const resetURL = `${baseURL}/reset-password?token=${resetToken}`;
```

#### POST /api/reset-password (Reset Password)

```javascript
{
  action: 'reset-password',
  token: 'token-from-url',
  newPassword: 'newpassword123'
}

// Response
{
  success: true,
  msg: 'Password reset successfully'
}
```

**Verification:**
```javascript
// Hash the provided token
const hashedToken = crypto
  .createHash('sha256')
  .update(token)
  .digest('hex');

// Find user with valid token
const user = await User.findOne({
  resetPasswordToken: hashedToken,
  resetPasswordExpires: { $gt: Date.now() }
});

// Update password and clear token
user.password = await bcrypt.hash(newPassword, 10);
user.resetPasswordToken = undefined;
user.resetPasswordExpires = undefined;
```

### Feedback

#### POST /api/feedback

```javascript
{
  feedback: 'Great app! Suggestion: ...'
}

// Response
{
  success: true,
  msg: 'Feedback submitted'
}
```

**Auto-capture Logic:**
```javascript
// Extract user from JWT if present
const token = request.headers.get('authorization')?.split(' ')[1];
let userId, userName, email;

if (token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id);
  userId = user._id;
  userName = user.name;
  email = user.email;
}

// Create feedback
Feedback.create({
  feedback: feedbackText,
  userId,
  userName,
  email: email || 'Anonymous'
});
```

#### GET /api/feedback (Admin)

```javascript
// Response
{
  success: true,
  feedback: [/* all feedback */],
  stats: {
    total: 45,
    new: 12,
    read: 20,
    resolved: 13
  }
}
```

#### PATCH /api/feedback (Admin)

```javascript
{
  id: 'feedback-id',
  status: 'read' | 'resolved'
}

// Response
{
  success: true,
  msg: 'Feedback updated'
}
```

## Key Algorithms

### Event Status Calculation

```javascript
function calculateEventStatus(startDateTime, endDateTime) {
  const now = new Date();
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  
  if (now < start) {
    return 'future';
  } else if (now >= start && now <= end) {
    return 'live';
  } else {
    return 'past';
  }
}

// Applied on every GET request
const events = await Event.find({});
events.forEach(event => {
  const newStatus = calculateEventStatus(
    event.startDateTime,
    event.endDateTime
  );
  
  if (event.status !== newStatus) {
    event.status = newStatus;
    event.save();
  }
});
```

### Username Generation

```javascript
function generateUsername(email) {
  // Extract prefix from email
  const prefix = email.split('@')[0];
  
  // Remove non-alphanumeric characters
  let baseUsername = prefix.replace(/[^a-z0-9]/gi, '').toLowerCase();
  
  // Ensure minimum length
  if (baseUsername.length < 3) {
    baseUsername = 'user' + baseUsername;
  }
  
  // Truncate to 20 chars
  baseUsername = baseUsername.substring(0, 20);
  
  return baseUsername;
}

async function createUniqueUsername(email) {
  let username = generateUsername(email);
  let counter = 1;
  
  // Check uniqueness
  while (await User.findOne({ username })) {
    username = generateUsername(email) + counter;
    counter++;
  }
  
  return username;
}
```

### Rating Average Calculation

```javascript
function updateAverageRating(event) {
  if (event.ratings.length === 0) {
    event.averageRating = 0;
    event.totalRatings = 0;
    return;
  }
  
  const sum = event.ratings.reduce((acc, rating) => {
    return acc + rating.rating;
  }, 0);
  
  event.averageRating = sum / event.ratings.length;
  event.totalRatings = event.ratings.length;
}

// Called after every rating submission or edit
```

### Notification Queue Processing

```javascript
function createEventUpdateNotifications(event, changes) {
  const affectedUsers = [
    ...event.interestedUsers,
    ...event.reservedUsers
  ];
  
  // Remove duplicates
  const uniqueUsers = [...new Set(affectedUsers.map(u => u.toString()))];
  
  // Create notifications for each user
  return Promise.all(uniqueUsers.map(async (userId) => {
    const user = await User.findById(userId);
    
    // Check if notification already exists
    const existingNotification = user.eventUpdateNotifications.find(
      n => n.eventId.toString() === event._id.toString() &&
           n.changes === changes &&
           !n.read
    );
    
    if (existingNotification) return; // Duplicate prevention
    
    user.eventUpdateNotifications.push({
      eventId: event._id,
      eventTitle: event.title,
      changes,
      timestamp: new Date(),
      read: false
    });
    
    await user.save();
  }));
}
```

### Duplicate Rating Prevention

```javascript
// Triple-layer prevention system

// Layer 1: Database check
const existingRating = event.ratings.find(r => 
  r.userId.toString() === userId.toString()
);

if (existingRating) {
  return { success: false, msg: 'Already rated' };
}

// Layer 2: Session storage (client-side)
const ratedEventsSession = JSON.parse(
  sessionStorage.getItem('ratedEvents') || '[]'
);

if (ratedEventsSession.includes(eventId)) {
  return; // Don't show prompt
}

sessionStorage.setItem('ratedEvents', JSON.stringify([
  ...ratedEventsSession,
  eventId
]));

// Layer 3: LocalStorage dismissal tracking
const dismissedPrompts = JSON.parse(
  localStorage.getItem('dismissedRatingPrompts') || '[]'
);

if (dismissedPrompts.includes(eventId)) {
  return; // User dismissed this prompt
}
```

## Styling Guide

### Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom Rice Blue colors
        'rice-blue': '#00205B',
        'rice-blue-dark': '#001840',
        'rice-blue-light': '#003d82',
      },
    },
  },
  plugins: [],
};
```

### CSS Custom Properties

```css
/* globals.css */
:root {
  --rice-blue: #00205B;
  --rice-blue-dark: #001840;
  --rice-blue-light: #003d82;
}
```

### Component Styling Patterns

**Status Badges**
```jsx
// Future events
<span className="bg-blue-100 text-rice-blue px-3 py-1 rounded-full text-sm font-semibold">
  Upcoming
</span>

// Live events
<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
  Happening Now
</span>

// Past events
<span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
  Past
</span>
```

**Buttons**
```jsx
// Primary button
<button className="bg-rice-blue hover:bg-rice-blue-dark text-white px-6 py-2 rounded-lg transition-colors">
  Create Event
</button>

// Secondary button
<button className="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors">
  Cancel
</button>

// Danger button
<button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors">
  Delete
</button>
```

**Modals**
```jsx
// Frosted glass backdrop
<div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
  <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
    {/* Modal content */}
  </div>
</div>
```

**Cards**
```jsx
<div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
  {/* Card content */}
</div>
```

### Responsive Design Patterns

```jsx
// Mobile-first approach
<div className="
  p-4 sm:p-6 md:p-8         // Padding scales up
  text-sm sm:text-base      // Font size increases
  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  // Grid layout
  space-y-4 sm:space-y-0 sm:space-x-4  // Spacing adjusts
">
```

### Animation Guidelines

**Framer Motion Patterns**
```jsx
import { motion, AnimatePresence } from 'framer-motion';

// Modal animations
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>

// Notification slide-in
<motion.div
  initial={{ x: 300, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: 300, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  {/* Notification content */}
</motion.div>
```

## State Management

### Authentication State

**JWT Storage**
```javascript
import Cookies from 'js-cookie';

// Set token (7 days)
Cookies.set('token', jwtToken, { expires: 7 });

// Get token
const token = Cookies.get('token');

// Remove token
Cookies.remove('token');
```

**Protected Routes**
```javascript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function ProtectedPage() {
  const router = useRouter();
  
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    }
  }, []);
  
  // Page content
}
```

### Client-Side Caching

**LocalStorage Usage**
```javascript
// Dismissed rating prompts
const dismissedPrompts = JSON.parse(
  localStorage.getItem('dismissedRatingPrompts') || '[]'
);

dismissedPrompts.push(eventId);
localStorage.setItem(
  'dismissedRatingPrompts',
  JSON.stringify(dismissedPrompts)
);

// Viewed event update notifications
const viewedNotifications = JSON.parse(
  localStorage.getItem('viewedEventUpdateNotifications') || '[]'
);
```

**SessionStorage Usage**
```javascript
// Rated events in current session
const ratedEvents = JSON.parse(
  sessionStorage.getItem('ratedEvents') || '[]'
);
```

### Form State Management

```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  startDateTime: '',
  endDateTime: '',
  // ... other fields
});

// Handle input change
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

// Handle file upload
const [images, setImages] = useState([]);

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  setImages([...images, ...files].slice(0, 5)); // Max 5
};
```

## Security Implementation

### JWT Authentication

**Token Generation**
```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Token Verification**
```javascript
function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id; // Returns user ID
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### Password Security

**Hashing**
```javascript
const bcrypt = require('bcryptjs');

// Hash password on registration
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password on login
const isMatch = await bcrypt.compare(password, user.password);
```

### Input Validation

**Email Validation**
```javascript
const validator = require('validator');

if (!validator.isEmail(email)) {
  return { success: false, msg: 'Invalid email' };
}
```

**Sanitization**
```javascript
// Remove non-alphanumeric from username
const sanitized = username.replace(/[^a-z0-9_]/gi, '').toLowerCase();

// Limit string length
const limited = description.substring(0, 1000);
```

### Admin Authorization

```javascript
// lib/utils/adminAuth.js
import jwt from 'jsonwebtoken';
import userModel from '../models/usermodel';
import { connectDB } from '../config/db';

export async function verifyAdmin(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    throw new Error('No token provided');
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  await connectDB();
  const user = await userModel.findById(decoded.id);
  
  if (!user || !user.isAdmin) {
    throw new Error('Admin access required');
  }
  
  return user;
}
```

### CORS and Headers

```javascript
// API route headers
return NextResponse.json(data, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
});
```

## Testing

### Manual Testing Checklist

**Authentication**
- [ ] User registration with valid email
- [ ] Login with correct credentials
- [ ] Login failure with wrong password
- [ ] JWT token persistence
- [ ] Logout clears token
- [ ] Password reset flow

**Event Management**
- [ ] Create event without RSVP
- [ ] Create event with RSVP and capacity
- [ ] Upload 1-5 images
- [ ] Edit event details
- [ ] Edit during live status
- [ ] Delete own event
- [ ] Cannot delete other's event

**RSVP System**
- [ ] RSVP to event
- [ ] Cancel RSVP before deadline
- [ ] Cannot RSVP after deadline
- [ ] Cannot RSVP when full
- [ ] Capacity decreases on cancel

**Rating System**
- [ ] Rate live event
- [ ] Update live rating
- [ ] Cannot rate reserved event without RSVP
- [ ] Submit post-event review
- [ ] Upload review images
- [ ] Edit existing review
- [ ] Cannot rate same event twice

**Co-hosting**
- [ ] Search users by username
- [ ] Send co-host invitation
- [ ] Receive invitation notification
- [ ] Accept invitation
- [ ] Co-host can edit event
- [ ] Co-host cannot delete event

**Admin Features**
- [ ] Access admin panel
- [ ] View all events
- [ ] Delete any event
- [ ] View feedback dashboard
- [ ] Update feedback status

### Testing Tools

```bash
# Test API endpoints with curl
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"test@rice.edu","password":"test123"}'

# Test with authentication
curl -X GET http://localhost:3000/api/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment

### Environment Variables

Production .env.local:
```env
# Database
MONGODB_URI=your-mongodb-connection-string-here

# Authentication
JWT_SECRET=<32-char-random-string>

# App URL
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Image Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
RESEND_API_KEY=re_your-api-key

# Cron (optional)
CRON_SECRET=<32-char-random-string>
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Project Settings → Environment Variables
```

### MongoDB Atlas Setup

1. Create cluster at mongodb.com/cloud/atlas
2. Database Access → Add user
3. Network Access → Add IP (0.0.0.0/0 for all)
4. Connect → Get connection string
5. Replace <password> with actual password
6. Add to MONGODB_URI in .env.local

### Post-Deployment Steps

1. Test all features in production
2. Create admin user via MongoDB Compass
3. Verify email sending works
4. Check image uploads to Cloudinary
5. Test mobile responsiveness
6. Monitor error logs

### Monitoring

```javascript
// Add error logging to API routes
try {
  // API logic
} catch (error) {
  console.error('Error in /api/blog:', error);
  return NextResponse.json(
    { success: false, msg: error.message },
    { status: 500 }
  );
}
```

---

## Additional Resources

- Next.js Documentation: https://nextjs.org/docs
- MongoDB Documentation: https://docs.mongodb.com
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion
- JWT.io: https://jwt.io

## Getting Help

For questions or issues:
- Check existing documentation in /docs
- Review CHANGELOG.md for recent changes
- Submit feedback through the app
- Contact project maintainers

---

Last Updated: January 12, 2026
Version: 0.5.8
