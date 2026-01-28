import { NextResponse } from "next/server";
import Blogmodel from "@/lib/models/blogmodel";
import { connectDB } from "@/lib/config/db";
import jwt from "jsonwebtoken";
import User from "@/lib/models/usermodel";

// POST - Add a comment to What's the Move Now
export async function POST(request) {
    try {
        await connectDB();

        const { eventId, comment, isAnonymous } = await request.json();

        if (!eventId || !comment || comment.trim() === '') {
            return NextResponse.json(
                { success: false, msg: "Event ID and comment are required" },
                { status: 400 }
            );
        }

        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        console.log('[Move Now] Auth header:', authHeader ? 'present' : 'missing');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[Move Now] Invalid auth header format');
            return NextResponse.json(
                { success: false, msg: "Unauthorized - No token provided" },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        let userId, username;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('[Move Now] Token verified, user:', decoded.id);
            userId = decoded.id;
            
            // Fetch user from database to get actual username
            const user = await User.findById(userId).select('username email');
            if (!user) {
                return NextResponse.json(
                    { success: false, msg: "User not found" },
                    { status: 404 }
                );
            }
            username = user.username || user.email?.split('@')[0] || 'User';
        } catch (error) {
            console.log('[Move Now] Token verification failed:', error.message);
            return NextResponse.json(
                { success: false, msg: "Unauthorized - Invalid token" },
                { status: 401 }
            );
        }

        // Find the event
        const event = await Blogmodel.findById(eventId);
        if (!event) {
            return NextResponse.json(
                { success: false, msg: "Event not found" },
                { status: 404 }
            );
        }

        // Verify event is pub/public
        if (event.publicEventType !== 'pub' && event.publicEventType !== 'public') {
            return NextResponse.json(
                { success: false, msg: "What's the Move Now is only available for pub/public events" },
                { status: 400 }
            );
        }

        // Check if event has ended
        if (event.status !== 'past') {
            return NextResponse.json(
                { success: false, msg: "Event must be ended to post in What's the Move Now" },
                { status: 400 }
            );
        }

        // Set moveNowExpiresAt if not already set (first comment after event ends)
        if (!event.moveNowExpiresAt) {
            const expiresAt = new Date(event.endDateTime);
            expiresAt.setHours(expiresAt.getHours() + 5); // 5 hours after event ends
            event.moveNowExpiresAt = expiresAt;
        }

        // Check if What's the Move Now has expired
        const now = new Date();
        if (now > new Date(event.moveNowExpiresAt)) {
            return NextResponse.json(
                { success: false, msg: "What's the Move Now has expired (5 hours after event ended)" },
                { status: 400 }
            );
        }

        // Create comment object
        const newComment = {
            user: isAnonymous ? null : userId,
            username: isAnonymous ? 'Anonymous' : username,
            comment: comment.trim(),
            isAnonymous: isAnonymous || false,
            timestamp: new Date()
        };

        // Add comment to array
        event.moveNowComments.push(newComment);
        await event.save();

        return NextResponse.json({
            success: true,
            msg: "Comment added successfully",
            comment: newComment,
            expiresAt: event.moveNowExpiresAt
        });

    } catch (error) {
        console.error('Error adding What\'s the Move Now comment:', error);
        return NextResponse.json(
            { success: false, msg: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET - Fetch What's the Move Now comments for an event
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json(
                { success: false, msg: "Event ID is required" },
                { status: 400 }
            );
        }

        const event = await Blogmodel.findById(eventId)
            .select('moveNowComments moveNowExpiresAt publicEventType status endDateTime');

        if (!event) {
            return NextResponse.json(
                { success: false, msg: "Event not found" },
                { status: 404 }
            );
        }

        // Check if What's the Move Now is available for this event
        if (event.publicEventType !== 'pub' && event.publicEventType !== 'public') {
            return NextResponse.json({
                success: true,
                available: false,
                msg: "What's the Move Now is only available for pub/public events",
                comments: []
            });
        }

        if (event.status !== 'past') {
            return NextResponse.json({
                success: true,
                available: false,
                msg: "Event has not ended yet",
                comments: []
            });
        }

        // Set moveNowExpiresAt if not already set
        let expiresAt = event.moveNowExpiresAt;
        if (!expiresAt) {
            expiresAt = new Date(event.endDateTime);
            expiresAt.setHours(expiresAt.getHours() + 5);
        }

        const now = new Date();
        const hasExpired = now > new Date(expiresAt);
        const timeRemaining = hasExpired ? 0 : Math.max(0, new Date(expiresAt) - now);

        return NextResponse.json({
            success: true,
            available: !hasExpired,
            comments: event.moveNowComments || [],
            expiresAt: expiresAt,
            timeRemaining: timeRemaining,
            hasExpired: hasExpired
        });

    } catch (error) {
        console.error('Error fetching What\'s the Move Now comments:', error);
        return NextResponse.json(
            { success: false, msg: "Internal server error" },
            { status: 500 }
        );
    }
}
