# 🎉 Rice Party - Events Hub

A modern, full-stack event management platform built with Next.js 16, MongoDB, and React. Users can create, discover, and manage campus events with real-time ratings, reservations, and notifications.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.1.2-green)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [User Workflows](#-user-workflows)
- [Admin Features](#-admin-features)
- [Component Architecture](#-component-architecture)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)

---

## ✨ Features

### 🎫 Event Management
- **Create Events** - Rich event creation with multiple images (up to 5), detailed info, and custom fields
- **Dynamic Status** - Automatic status calculation (Future → Live → Past) based on real-time
- **Reservations** - Event capacity management with reservation deadlines
- **Interest Tracking** - Users can mark interest in events without formal reservations
- **Live Editing** - Hosts can edit ongoing events with automatic user notifications
- **Search & Filter** - Smart search by title, location, theme, type, host with status filtering

### ⭐ Dual Rating System
- **Live Ratings** - Real-time ratings during ongoing events to help users decide attendance
  - Amber/gold themed display on event cards
  - Access control based on reservation requirements
  - Instant average calculation
  - Update ratings anytime during event

- **Post-Event Reviews** - Comprehensive reviews after events end
  - 1-5 star ratings with visual feedback
  - Text comments (up to 1000 characters)
  - Photo uploads (up to 5 images per review)
  - Automatic prompts for attendees
  - Triple-layer duplicate prevention

### 🔔 Smart Notifications
- **Event Updates** - Users receive notifications when events they're interested in/reserved get edited
- **Notification Queue** - MongoDB-based queueing system
- **Duplicate Prevention** - Double-layer protection (database + localStorage)
- **Action Options** - View event details or dismiss notifications

### 👤 User Features
- **Authentication** - JWT-based secure login/registration
- **User Profile** - Personal dashboard showing interested/reserved events
- **My Events** - View and manage your created events
- **Event History** - Track past, current, and future event participation
- **Rating History** - Keep track of events you've rated

### 🛡️ Admin Panel
- **Role-Based Access** - Admin-only protected routes
- **Dashboard** - Real-time statistics (Total, Live, Upcoming, Past events)
- **Event Management** - Search, filter, bulk select/delete events
- **User Management** - View and manage all users
- **Moderation** - Delete any event regardless of ownership

### 🎨 UI/UX
- **Responsive Design** - Mobile-first approach with Tailwind CSS 4
- **Frosted Glass Modals** - Modern backdrop-blur effects
- **Smooth Animations** - Professional transitions and hover effects
- **Google Calendar Integration** - One-click calendar export
- **Image Galleries** - Grid layouts for multiple event photos
- **Status Badges** - Color-coded visual indicators

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Axios 1.13.2** - HTTP client for API requests
- **React Toastify 11.0.5** - Toast notifications

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose 9.1.2** - MongoDB ODM
- **JWT (jsonwebtoken 9.0.3)** - Authentication tokens
- **bcryptjs 3.0.3** - Password hashing
- **Validator 13.15.26** - Input validation

### Development Tools
- **ESLint 9** - Code linting
- **PostCSS** - CSS processing
- **Babel React Compiler** - React optimization

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ss1now/events_hub.git
cd events_hub
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Create your user account** via the registration page
2. **Set up an admin user** - Follow [ADMIN_SETUP.md](./ADMIN_SETUP.md) instructions
3. **Create your first event** from `/me/postevent`

---

## 📁 Project Structure

```
events_hub/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   └── route.js         # POST /api/auth - Login/Register
│   │   ├── blog/                 # Event CRUD
│   │   │   └── route.js         # GET, POST, PUT, PATCH, DELETE /api/blog
│   │   ├── live-rating/          # Live event ratings
│   │   │   └── route.js         # GET, POST /api/live-rating
│   │   ├── rating/               # Post-event reviews
│   │   │   └── route.js         # GET, POST /api/rating
│   │   └── user/                 # User management
│   │       ├── route.js         # GET /api/user
│   │       └── notifications/    # Notification system
│   │           ├── route.js     # GET /api/user/notifications
│   │           └── dismiss/
│   │               └── route.js # POST /api/user/notifications/dismiss
│   ├── admin/                    # Admin panel pages
│   │   ├── layout.jsx           # Admin layout with sidebar
│   │   ├── page.jsx             # Admin dashboard (redirects to bloglist)
│   │   └── bloglist/
│   │       └── page.jsx         # Event management table
│   ├── blogs/                    # Event detail pages
│   │   └── [id]/
│   │       └── page.jsx         # Dynamic event detail page
│   ├── login/
│   │   └── page.jsx             # Login page
│   ├── register/
│   │   └── page.jsx             # Registration page
│   ├── me/                       # User profile section
│   │   ├── page.jsx             # User dashboard
│   │   ├── postevent/
│   │   │   └── page.jsx         # Create new event
│   │   └── editevent/
│   │       └── [id]/
│   │           └── page.jsx     # Edit existing event
│   ├── layout.js                 # Root layout with providers
│   ├── page.js                   # Home page (redirects to events)
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── admincomponents/          # Admin-specific components
│   │   ├── sidebar.jsx          # Admin sidebar navigation
│   │   └── blogtableitem.jsx   # Event table row component
│   ├── blogitem.jsx             # Event card component
│   ├── bloglist.jsx             # Event list with filters
│   ├── header.jsx               # Main navigation header
│   ├── footer.jsx               # Page footer
│   ├── SuccessModal.jsx         # Success confirmation modal
│   ├── StarRating.jsx           # Reusable star rating component
│   ├── LiveRatingButton.jsx     # Live rating display & modal
│   ├── RatingPrompt.jsx         # Auto-prompt for post-event rating
│   ├── RatingPopup.jsx          # Post-event rating modal
│   ├── ReviewForm.jsx           # Review submission form
│   ├── ReviewList.jsx           # Display list of reviews
│   └── EventUpdateNotification.jsx # Global notification popup
│
├── lib/                          # Backend utilities
│   ├── config/
│   │   └── db.js                # MongoDB connection handler
│   ├── models/                   # Mongoose schemas
│   │   ├── blogmodel.js         # Event/Blog schema
│   │   └── usermodel.js         # User schema
│   └── utils/
│       └── adminAuth.js         # Admin verification utility
│
├── context/                      # React Context providers
│   └── AuthContext.js           # Authentication state management
│
├── assets/                       # Static assets
│   ├── assets.js                # Asset exports
│   ├── logo.png                 # App logo
│   ├── profile.png              # Default profile image
│   ├── upload.png               # Upload icon
│   └── ...
│
├── public/                       # Public files
│   └── images/
│       └── blogs/               # Uploaded event images
│
├── .env.local                    # Environment variables (create this)
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies & scripts
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # Tailwind CSS config
├── jsconfig.json                 # JavaScript configuration
├── CHANGELOG.md                  # Version history
├── ADMIN_SETUP.md                # Admin setup guide
└── README.md                     # This file
```

---

## 🗄️ Database Schema

### Event Model (`blogmodel.js`)

```javascript
{
  // Basic Info
  title: String (required),
  description: String (required),
  images: [String] (0-5 images),
  date: Date (creation date),
  
  // Event Timing
  startDateTime: Date (required),
  endDateTime: Date (required),
  status: String (enum: 'future', 'live', 'past'),
  
  // Event Details
  eventType: String (required),
  theme: String (required),
  dressCode: String (required),
  location: String (required),
  
  // Reservation System
  needReservation: Boolean,
  reserved: Number (count),
  capacity: Number,
  reservationDeadline: Date,
  
  // User Relationships
  interestedUsers: [ObjectId] (refs to users),
  reservedUsers: [ObjectId] (refs to users),
  
  // Host Info
  host: String (required),
  authorId: ObjectId (ref to user),
  
  // Update Tracking
  lastUpdated: Date,
  updateNotifications: [{
    message: String,
    timestamp: Date,
    notifiedUsers: [ObjectId]
  }],
  
  // Live Ratings
  liveRatings: [{
    userId: ObjectId,
    rating: Number (1-5),
    timestamp: Date
  }],
  averageLiveRating: Number (0-5),
  totalLiveRatings: Number,
  
  // Post-Event Ratings
  ratings: [{
    userId: ObjectId,
    userName: String,
    rating: Number (1-5),
    comment: String,
    images: [String] (0-5 images),
    date: Date
  }],
  averageRating: Number (0-5),
  totalRatings: Number
}
```

### User Model (`usermodel.js`)

```javascript
{
  // Basic Info
  name: String,
  email: String (required, unique),
  password: String (required, hashed),
  residentialCollege: String,
  
  // Authorization
  isAdmin: Boolean (default: false),
  
  // Event Relationships
  interestedEvents: [ObjectId] (refs to events),
  reservedEvents: [ObjectId] (refs to events),
  ratedEvents: [ObjectId] (refs to events),
  
  // Notifications
  pendingNotifications: [{
    eventId: ObjectId,
    notificationId: ObjectId,
    timestamp: Date
  }]
}
```

---

## 🔌 API Documentation

### Authentication

#### `POST /api/auth`
**Register/Login endpoint**

**Request Body:**
```json
{
  "action": "register" | "login",
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" (register only),
  "residentialCollege": "Baker" (register only, optional)
}
```

**Response:**
```json
{
  "success": true,
  "msg": "User created" | "Login successful",
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "user@example.com",
    "isAdmin": false
  }
}
```

### Events

#### `GET /api/blog`
**Fetch events** - Returns single event by ID or all events with calculated status

#### `POST /api/blog`
**Create new event** - Requires auth, accepts FormData with event fields and up to 5 images

#### `PUT /api/blog`
**Edit event** - Can edit future/live events, creates notifications for live event edits

#### `PATCH /api/blog`
**Interested/Reserve actions** - Toggle interest or reserve spot at event

#### `DELETE /api/blog?id=<event-id>`
**Delete event** - Users can delete own events, admins can delete any

### Ratings

#### `POST /api/live-rating`
**Submit live rating** - Rate ongoing events (1-5 stars), respects reservation requirements

#### `GET /api/live-rating?eventId=<id>`
**Get live rating status** - Check if user rated and view event's live rating stats

#### `POST /api/rating`
**Submit post-event review** - Full review with rating, comment, and up to 5 images

#### `GET /api/rating?eventId=<id>`
**Get event reviews** - Fetch all reviews for an event with average rating

### User & Notifications

#### `GET /api/user`
**Get user profile** - Returns user data with interested/reserved events populated

#### `GET /api/user/notifications`
**Get pending notifications** - Fetch unread event update notifications

#### `POST /api/user/notifications/dismiss`
**Dismiss notification** - Mark notification as read and remove from queue

---

## 🔄 User Workflows

### Creating an Event
1. Navigate to `/me/postevent` (requires login)
2. Fill form with event details
3. Upload 0-5 images (optional)
4. Set reservation requirements if needed
5. Submit → Event created and visible to all users

### Rating System

**Live Ratings:**
- Only available during live events
- Anyone can rate unreserved events
- Only reserved users can rate reserved events
- Can update rating anytime during event

**Post-Event Reviews:**
- Automatic prompt appears for attended events
- Triple duplicate prevention (database + session + dismissal localStorage)
- Full review with stars, comment, and photos

### Notification Flow
1. Host edits a live event
2. System identifies interested/reserved users
3. Notifications created in database queue
4. Users see popup on next page load
5. Can view event or dismiss
6. Double-layer prevention (database removal + localStorage tracking)

---

## 🛡️ Admin Features

### Setup
See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for detailed admin setup instructions.

**Quick Setup:**
```javascript
// In MongoDB
db.user.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

### Admin Panel (`/admin/bloglist`)
- **Statistics Dashboard** - Real-time event counts by status
- **Search & Filter** - Find events by any field, filter by status
- **Bulk Operations** - Select multiple events, bulk delete
- **Full Control** - Delete any event regardless of ownership
- **Responsive Design** - Works on all devices

---

## 🧩 Component Architecture

### Key Components

**BlogItem** - Reusable event card with conditional buttons based on status  
**LiveRatingButton** - Amber/gold themed live rating display and modal  
**RatingPrompt** - Auto-prompts users to rate attended past events  
**EventUpdateNotification** - Global notification popup mounted in root layout  
**StarRating** - Reusable 1-5 star rating with customizable sizes  
**SuccessModal** - Confirmation modal with frosted glass effect  

---

## 🔧 Development Guide

### Environment Variables
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Common Tasks

**Clear localStorage:**
```javascript
localStorage.clear(); // In browser console
```

**Test as admin:**
```javascript
// Update in MongoDB
db.user.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```

**Recommended Database Indexes:**
```javascript
db.blog.createIndex({ status: 1, startDateTime: -1 })
db.blog.createIndex({ authorId: 1 })
db.user.createIndex({ email: 1 }, { unique: true })
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy and enjoy!

### MongoDB Atlas
1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Add database user
3. Whitelist IPs (0.0.0.0/0 for all)
4. Copy connection string to `MONGODB_URI`

### Post-Deployment Checklist
- [ ] Test user registration/login
- [ ] Create and edit test event
- [ ] Test reservations and ratings
- [ ] Set up admin user
- [ ] Verify all features work on mobile

---

## 📝 Additional Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Complete version history
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Admin user setup guide
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [MongoDB Docs](https://docs.mongodb.com/) - Database documentation

---

## 👥 Contact

**Project Maintainer:** Ss1now  
**Repository:** [github.com/Ss1now/events_hub](https://github.com/Ss1now/events_hub)

---

**Built with ❤️ for Rice University**
