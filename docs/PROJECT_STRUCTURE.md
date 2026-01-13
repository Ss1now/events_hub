# Project Structure Overview

This document describes the organization and purpose of files in Rice Events.

## Root Directory

```
events_hub/
├── app/                    # Next.js application code
├── components/             # Reusable React components
├── lib/                    # Backend utilities and database
├── auth/                   # Authentication logic
├── context/                # React Context providers
├── assets/                 # Static assets (images, icons)
├── public/                 # Public files served directly
├── docs/                   # Documentation
├── .github/                # GitHub Actions workflows
├── node_modules/           # Dependencies (auto-generated)
├── .next/                  # Build output (auto-generated)
└── Configuration files
```

## Application Code (app/)

### API Routes (app/api/)

Backend endpoints for client-server communication.

**Authentication**
- `auth/route.js` - User login and registration

**Events**
- `blog/route.js` - Event CRUD operations (create, read, update, delete)

**Ratings**
- `live-rating/route.js` - Real-time event ratings during live events
- `rating/route.js` - Post-event reviews with photos

**User Management**
- `user/route.js` - User profile and events
- `user/notifications/route.js` - Notification management

**Co-hosting**
- `cohost/route.js` - Co-host invitations and management

**Password Recovery**
- `reset-password/route.js` - Password reset flow with email

**Feedback**
- `feedback/route.js` - User feedback submission and admin management

### Pages (app/)

Client-side pages and layouts.

**Public Pages**
- `page.js` - Home page (event list)
- `login/page.jsx` - User login
- `register/page.jsx` - User registration
- `forgot-password/page.jsx` - Request password reset
- `reset-password/page.jsx` - Reset password with token
- `blogs/[id]/page.jsx` - Event detail page (dynamic route)

**User Dashboard**
- `me/page.jsx` - User profile and events dashboard
- `me/postevent/page.jsx` - Create new event
- `me/editevent/[id]/page.jsx` - Edit existing event

**Admin Panel**
- `admin/layout.jsx` - Admin layout with sidebar
- `admin/page.jsx` - Admin dashboard (redirects to bloglist)
- `admin/bloglist/page.jsx` - Event management table
- `admin/feedback/page.jsx` - Feedback management dashboard

**Global Files**
- `layout.js` - Root layout (wraps entire app)
- `globals.css` - Global CSS styles

## Components (components/)

Reusable React components organized by function.

### Event Components
- `bloglist.jsx` - Event list with search and filters
- `blogitem.jsx` - Individual event card
- `EventCreatedModal.jsx` - Success modal after creating event
- `EventUpdateNotification.jsx` - Notification popup for event changes

### Rating Components
- `StarRating.jsx` - Reusable star rating display
- `LiveRatingButton.jsx` - Live event rating interface
- `RatingPrompt.jsx` - Auto-prompt for post-event ratings
- `RatingPopup.jsx` - Full rating submission modal
- `ReviewForm.jsx` - Review creation and editing form
- `ReviewList.jsx` - Display list of reviews

### User Interface
- `header.jsx` - Top navigation bar
- `footer.jsx` - Page footer with feedback link
- `SuccessModal.jsx` - Generic success confirmation modal
- `FeedbackModal.jsx` - User feedback submission modal
- `ShareModal.jsx` - Social sharing modal

### Co-hosting
- `CohostInviteModal.jsx` - Search and invite co-hosts
- `CohostInvitationNotification.jsx` - Co-host invitation popup

### Admin Components (components/admincomponents/)
- `sidebar.jsx` - Admin navigation sidebar
- `blogtableitem.jsx` - Event table row in admin panel

## Backend (lib/)

Server-side code and database logic.

### Configuration (lib/config/)
- `db.js` - MongoDB connection handler
- `cloudinary.js` - Cloudinary image upload configuration

### Database Models (lib/models/)
- `blogmodel.js` - Event schema (events are stored in 'blog' collection)
- `usermodel.js` - User schema with authentication and relationships
- `feedbackmodel.js` - User feedback schema

### Utilities (lib/utils/)
- `adminAuth.js` - Admin authorization verification
- `cloudinary.js` - Image upload and delete helpers

## Authentication (auth/)

- `users.js` - User registration and login logic

## Context (context/)

React Context providers for global state.

- `AuthContext.js` - Authentication state (legacy, minimal usage)

## Assets (assets/)

Static files used in the application.

- `assets.js` - Asset exports and imports
- `logo.png` - Application logo
- `profile.png` - Default user profile image
- `upload.png` - Upload icon
- Various other icons and images

## Public Files (public/)

Files served directly without processing.

- `images/blogs/` - Uploaded event images
- Other static assets accessible via URL

## Documentation (docs/)

All project documentation organized by category.

### Setup Guides (docs/setup/)
- `ADMIN_SETUP.md` - Creating admin users
- `EMAIL_SETUP.md` - Email notification configuration
- `GITHUB_ACTIONS_SETUP.md` - Automated email scheduling
- Old documentation files (*.old.md)

### Feature Documentation (docs/features/)
- Feature-specific guides (to be created)

### Technical Documentation (docs/technical/)
- Technical implementation details
- Old analysis files (*.old.md)

## Configuration Files

### Next.js
- `next.config.mjs` - Next.js configuration (React Compiler enabled)
- `jsconfig.json` - JavaScript path aliases and configuration

### Styling
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration

### Linting
- `eslint.config.mjs` - ESLint rules

### Environment
- `.env.local` - Environment variables (DO NOT COMMIT)
- `.env.example` - Environment variable template (safe to commit)

### Package Management
- `package.json` - Dependencies and scripts
- `package-lock.json` - Dependency lock file (auto-generated)

### Version Control
- `.gitignore` - Files to exclude from git
- `.git/` - Git repository data

### GitHub Actions
- `.github/workflows/` - CI/CD workflows for automated tasks

## Build Output (Auto-Generated)

Do not manually edit these directories:

- `.next/` - Next.js build output
- `node_modules/` - Installed npm packages

## File Naming Conventions

- **API Routes:** `route.js` (Next.js convention)
- **Pages:** `page.jsx`
- **Layouts:** `layout.jsx`
- **Components:** `ComponentName.jsx` (PascalCase)
- **Utilities:** `utilityName.js` (camelCase)
- **Models:** `modelname.js` (lowercase)
- **Documentation:** `FILENAME.md` (UPPERCASE)

## Import Paths

The project uses path aliases configured in `jsconfig.json`:

```javascript
// Import from lib
import { connectDB } from '@/lib/config/db';

// Import from components
import Header from '@/components/header';

// Import from assets
import { logo } from '@/assets/assets';
```

## Adding New Files

When adding new files to the project:

1. **Components:** Place in `/components` folder
2. **API Routes:** Create in `/app/api/{feature}/route.js`
3. **Pages:** Add to `/app/{route}/page.jsx`
4. **Models:** Add to `/lib/models/{name}.js`
5. **Utilities:** Place in `/lib/utils/`
6. **Documentation:** Add to `/docs/{category}/`

## Key Directories Explained

### Why is it called 'blog'?

The event model is stored in a collection called 'blog' and the files are named `blogmodel.js`, `bloglist.jsx`, etc. This is legacy naming from early development. Events are referred to as "blogs" in the backend code but displayed as "events" in the user interface.

### Why separate /app and /components?

- `/app` - Next.js convention for pages and API routes
- `/components` - Reusable components used across multiple pages

### Why /lib instead of /utils?

The `/lib` folder contains both utilities and core backend logic like database models. It's a common convention in Next.js projects to separate backend code from frontend code.

## References

For more information about specific files or directories, see:

- DEVELOPER_GUIDE.md - Complete technical documentation
- docs/README.md - Documentation index
- package.json - List of all dependencies and scripts
