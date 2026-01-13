# Admin Setup Guide

This guide explains how to grant admin privileges to user accounts.

## Prerequisites

- MongoDB access (Compass, Shell, or Atlas dashboard)
- Existing user account in the system

## Method 1: MongoDB Compass (Recommended)

MongoDB Compass is a graphical interface for MongoDB that makes it easy to modify user records.

### Steps

1. **Open MongoDB Compass**
   - Download from mongodb.com/products/compass if needed
   - Connect using your MONGODB_URI from .env.local

2. **Navigate to Users Collection**
   - Select `rice-events` database
   - Click `users` collection

3. **Find Your User**
   - Use the filter: `{ email: "your@email.com" }`
   - Click the document to view details

4. **Edit Document**
   - Click the pencil icon to edit
   - Add field: `isAdmin: true`
   - Click "Update"

5. **Verify**
   - Refresh the document
   - Confirm `isAdmin: true` appears

## Method 2: MongoDB Shell

Use the MongoDB shell for command-line access.

### Steps

```javascript
// Connect to MongoDB
use rice-events

// Update user to admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)

// Verify the change
db.users.findOne(
  { email: "your@email.com" },
  { email: 1, isAdmin: 1, name: 1 }
)
```

## Method 3: Temporary API Script

Create a one-time API endpoint to set admin status. Delete after use.

### Steps

1. **Create File**
   - Path: `app/api/make-admin/route.js`

2. **Add Code**

```javascript
import { connectDB } from "@/lib/config/db";
import userModel from "@/lib/models/usermodel";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, secret } = await request.json();
    
    // Security: require secret key
    if (secret !== "YOUR_SECRET_KEY_HERE") {
      return NextResponse.json({ 
        success: false, 
        msg: "Unauthorized" 
      });
    }

    await connectDB();
    
    const user = await userModel.findOneAndUpdate(
      { email },
      { $set: { isAdmin: true } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        msg: "User not found" 
      });
    }

    return NextResponse.json({ 
      success: true, 
      msg: `${user.email} is now an admin` 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      msg: error.message 
    });
  }
}
```

3. **Use the Endpoint**

```bash
curl -X POST http://localhost:3000/api/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","secret":"YOUR_SECRET_KEY_HERE"}'
```

4. **Delete the File**
   - Remove `app/api/make-admin/route.js` after use
   - This prevents security vulnerabilities

## Verifying Admin Access

After granting admin privileges:

1. **Log In**
   - Use the account you just made admin
   - Navigate to `/admin`

2. **Check Access**
   - You should see the admin dashboard
   - Event management table should be visible
   - Admin sidebar should appear

3. **Test Permissions**
   - Try deleting any event (admins can delete all events)
   - Access feedback dashboard
   - View all users' events

## Admin Features

Once you have admin access:

- **Event Management** (`/admin/bloglist`)
  - View all events
  - Search and filter events
  - Bulk select and delete
  - Delete any event regardless of owner

- **Feedback Dashboard** (`/admin/feedback`)
  - View all user feedback
  - Filter by status (New, Read, Resolved)
  - Update feedback status
  - Delete feedback submissions

## Security Notes

- **Protect Admin Credentials**
  - Use strong passwords for admin accounts
  - Don't share admin login information
  - Regularly review who has admin access

- **Audit Admin Actions**
  - Admin deletions are permanent
  - Monitor admin activity if multiple admins exist

- **Remove Temporary Scripts**
  - Always delete make-admin API route after use
  - Never commit admin setup scripts to git

## Removing Admin Access

To revoke admin privileges:

```javascript
// MongoDB Shell
db.users.updateOne(
  { email: "user@email.com" },
  { $set: { isAdmin: false } }
)
```

Or use MongoDB Compass:
1. Find the user
2. Edit document
3. Change `isAdmin: false`
4. Save

## Troubleshooting

**Problem: Cannot access admin panel after setting isAdmin**
- Solution: Clear browser cookies and log in again
- Verify the database update was successful
- Check that JWT_SECRET matches between .env.local and deployment

**Problem: MongoDB connection fails**
- Solution: Verify MONGODB_URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has read/write permissions

**Problem: User not found**
- Solution: Verify the email address is correct
- Check the user has registered an account
- Look for typos in the email

## Support

For additional help:
- Check DEVELOPER_GUIDE.md for technical details
- Review SECURITY.md for security best practices
- Submit feedback through the application
