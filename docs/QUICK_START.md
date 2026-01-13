# Quick Start Guide

Get Rice Events running on your local machine in under 10 minutes.

## Prerequisites Checklist

- [ ] Node.js 18 or higher installed
- [ ] npm installed (comes with Node.js)
- [ ] Git installed
- [ ] Text editor (VS Code recommended)
- [ ] MongoDB Atlas account (free tier)

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/Ss1now/events_hub.git
cd events_hub

# Install dependencies
npm install
```

## Step 2: MongoDB Setup (3 minutes)

1. **Create MongoDB Cluster**
   - Go to mongodb.com/cloud/atlas
   - Sign in or create account
   - Create free cluster (M0)
   - Wait for cluster creation (~2 minutes)

2. **Create Database User**
   - Database Access → Add New Database User
   - Choose password authentication
   - Username: Choose your own (e.g., `myapp-user`)
   - Password: Generate strong password (use MongoDB's generator)
   - User Privileges: Read and Write to any database

3. **Allow Network Access**
   - Network Access → Add IP Address
   - Click "Allow Access from Anywhere"
   - Add: `0.0.0.0/0`

4. **Get Connection String**
   - Clusters → Connect
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password

## Step 3: Environment Setup (2 minutes)

```bash
# Copy template
cp .env.example .env.local

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Edit `.env.local`:

```env
# Add your MongoDB connection string (get from MongoDB Atlas)
MONGODB_URI=your-mongodb-connection-string-here

# Add the generated JWT secret
JWT_SECRET=your-generated-secret-here

# Add app URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Create Your Account (1 minute)

1. Click "Register"
2. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: (minimum 6 characters)
   - Residential College: (select any)
   - Check: "I consent to receive email notifications"
3. Click "Create Account"

## Step 6: Make Yourself Admin (Optional, 1 minute)

### Using MongoDB Compass (Easiest)

1. Download MongoDB Compass
2. Connect using your MONGODB_URI
3. Navigate to `rice-events` database → `users` collection
4. Find your user by email
5. Click edit
6. Add field: `isAdmin: true`
7. Save

### Using Command Line

```bash
# Connect to MongoDB
# Use your connection string from .env.local

# In mongo shell:
use rice-events
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```

## Verify Everything Works

Test these features:

1. **Create an Event**
   - Click "Create event"
   - Fill in event details
   - Upload an image
   - Click "Create Event"
   - Event should appear on homepage

2. **RSVP to Event**
   - Click on an event
   - Click "RSVP"
   - Should see confirmation

3. **Admin Panel** (if you set isAdmin)
   - Navigate to `/admin`
   - Should see admin dashboard
   - Event management table visible

## Troubleshooting

### "Cannot connect to MongoDB"
- Check MONGODB_URI in .env.local
- Verify password is correct (no special characters in URL)
- Ensure IP whitelist includes 0.0.0.0/0

### "JWT malformed" error
- Generate new JWT_SECRET
- Make sure it's in .env.local
- Restart dev server

### Port 3000 already in use
```bash
# Use different port
PORT=3001 npm run dev
```

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Clear cache and restart
```bash
# Delete build cache
rm -rf .next
npm run dev
```

## Next Steps

Now that you're running:

1. **Explore the Code**
   - Read docs/PROJECT_STRUCTURE.md
   - Review DEVELOPER_GUIDE.md

2. **Understand the Architecture**
   - Check app/api/ for backend code
   - Review components/ for UI
   - Study lib/models/ for database schema

3. **Make Changes**
   - Try modifying a component
   - Hot reload shows changes instantly
   - Check console for errors

4. **Read Documentation**
   - DEVELOPER_GUIDE.md has complete technical docs
   - CHANGELOG.md shows version history
   - SECURITY.md covers best practices

## Common Development Tasks

### Create a new page
```bash
# Create file: app/newpage/page.jsx
# Visit: http://localhost:3000/newpage
```

### Create a new API route
```bash
# Create file: app/api/newroute/route.js
# Access: http://localhost:3000/api/newroute
```

### Add a new component
```bash
# Create file: components/NewComponent.jsx
# Import in page: import NewComponent from '@/components/NewComponent';
```

### Clear localStorage
```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
```

### Test as different user
- Log out
- Clear cookies
- Register new account
- Or use incognito mode

## Development Workflow

1. Make code changes
2. Save file (hot reload happens automatically)
3. Check browser for updates
4. Check terminal for build errors
5. Test functionality
6. Commit when working

## Getting Help

- Check DEVELOPER_GUIDE.md for technical details
- Review docs/README.md for documentation index
- Look at existing code for examples
- Check CHANGELOG.md for recent changes

---

You're all set! Happy coding.
