# Admin Setup Instructions

## Making a User an Admin

Since there's no admin yet in your system, you need to manually set a user as admin in MongoDB.

### Option 1: Using MongoDB Compass (GUI)
1. Open MongoDB Compass and connect to your database
2. Navigate to: `rice-events` database → `users` collection
3. Find your user account by email
4. Click "Edit Document"
5. Add a new field: `isAdmin: true`
6. Click "Update"

### Option 2: Using MongoDB Shell
```javascript
// Connect to your MongoDB
use rice-events

// Set a user as admin by email
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { isAdmin: true } }
)

// Verify the change
db.users.findOne({ email: "your-email@example.com" })
```

### Option 3: Create a Quick Script
You can create a temporary API route to set yourself as admin:

1. Create `/app/api/make-admin/route.js` (temporarily)
2. Add this code:
```javascript
import { connectDB } from "@/lib/config/db";
import userModel from "@/lib/models/usermodel";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { email, secret } = await request.json();
        
        // Use a secret key to prevent unauthorized access
        if (secret !== "your-secret-key-here") {
            return NextResponse.json({ success: false, msg: "Unauthorized" });
        }

        await connectDB();
        const user = await userModel.findOneAndUpdate(
            { email },
            { $set: { isAdmin: true } },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ success: false, msg: "User not found" });
        }

        return NextResponse.json({ success: true, msg: "User is now admin" });
    } catch (error) {
        return NextResponse.json({ success: false, msg: error.message });
    }
}
```

3. Call it once with POST request:
```javascript
fetch('/api/make-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        email: 'your-email@example.com',
        secret: 'your-secret-key-here'
    })
})
```

4. **DELETE the route file after using it!**

## Admin Features

Once you're an admin, you can:
- Access `/admin/bloglist` to view and delete ANY event
- Delete events posted by any user
- Regular users can only delete their own events

## Security Notes

- Admin status is permanent until manually changed in the database
- Only admins can access `/admin/bloglist` page
- The DELETE API checks if you're either the author OR an admin
- Keep your admin credentials secure!
