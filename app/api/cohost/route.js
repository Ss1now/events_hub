import { connectDB } from "@/lib/config/db";
import BlogModel from "@/lib/models/blogmodel";
import UserModel from "@/lib/models/usermodel";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

// GET - Search users by username or email
export async function GET(request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, msg: "Not authenticated" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('search');
        const eventId = searchParams.get('eventId');

        if (!query || query.length < 2) {
            return NextResponse.json({ success: false, msg: "Search query too short" }, { status: 400 });
        }

        console.log('Searching for users with query:', query);

        // Search users by username or email (case insensitive)
        const users = await UserModel.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: decoded.id } // Exclude current user
        })
        .select('_id name email username')
        .limit(10);

        console.log('Found users:', users.length, users);

        // If eventId provided, filter out users already cohosts
        if (eventId) {
            const event = await BlogModel.findById(eventId);
            if (event) {
                const cohostIds = event.cohosts.map(c => c.userId.toString());
                const filteredUsers = users.filter(user => 
                    !cohostIds.includes(user._id.toString()) && 
                    user._id.toString() !== event.authorId.toString()
                );
                return NextResponse.json({ success: true, users: filteredUsers });
            }
        }

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json({ success: false, msg: "Error searching users" }, { status: 500 });
    }
}

// POST - Invite cohost
export async function POST(request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, msg: "Not authenticated" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { eventId, userId } = await request.json();

        // Verify user is the event author or existing cohost
        const event = await BlogModel.findById(eventId);
        if (!event) {
            return NextResponse.json({ success: false, msg: "Event not found" }, { status: 404 });
        }

        const isAuthor = event.authorId.toString() === decoded.id;
        const isCohost = event.cohosts.some(c => c.userId.toString() === decoded.id);

        if (!isAuthor && !isCohost) {
            return NextResponse.json({ success: false, msg: "Not authorized" }, { status: 403 });
        }

        // Check if already a cohost
        if (event.cohosts.some(c => c.userId.toString() === userId)) {
            return NextResponse.json({ success: false, msg: "User is already a cohost" }, { status: 400 });
        }

        // Get invited user details
        const invitedUser = await UserModel.findById(userId);
        if (!invitedUser) {
            return NextResponse.json({ success: false, msg: "User not found" }, { status: 404 });
        }

        // Get inviter details
        const inviter = await UserModel.findById(decoded.id);

        // Check if invitation already exists
        const existingInvite = invitedUser.cohostInvitations.find(
            inv => inv.eventId.toString() === eventId && inv.status === 'pending'
        );

        if (existingInvite) {
            return NextResponse.json({ success: false, msg: "Invitation already sent" }, { status: 400 });
        }

        // Add invitation to user's cohostInvitations
        invitedUser.cohostInvitations.push({
            eventId,
            invitedBy: decoded.id,
            invitedByName: inviter.name,
            eventTitle: event.title,
            status: 'pending'
        });

        await invitedUser.save();

        return NextResponse.json({ 
            success: true, 
            msg: `Invitation sent to ${invitedUser.username || invitedUser.email}` 
        });
    } catch (error) {
        console.error('Error inviting cohost:', error);
        return NextResponse.json({ success: false, msg: "Error inviting cohost" }, { status: 500 });
    }
}

// PATCH - Accept/Decline cohost invitation
export async function PATCH(request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, msg: "Not authenticated" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { eventId, action } = await request.json(); // action: 'accept' or 'decline'

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ success: false, msg: "User not found" }, { status: 404 });
        }

        // Find the invitation
        const invitationIndex = user.cohostInvitations.findIndex(
            inv => inv.eventId.toString() === eventId && inv.status === 'pending'
        );

        if (invitationIndex === -1) {
            return NextResponse.json({ success: false, msg: "Invitation not found" }, { status: 404 });
        }

        if (action === 'accept') {
            // Add user to event's cohosts
            const event = await BlogModel.findById(eventId);
            if (!event) {
                return NextResponse.json({ success: false, msg: "Event not found" }, { status: 404 });
            }

            event.cohosts.push({
                userId: decoded.id,
                name: user.name,
                username: user.username || user.email
            });

            await event.save();

            // Update invitation status
            user.cohostInvitations[invitationIndex].status = 'accepted';
            await user.save();

            return NextResponse.json({ 
                success: true, 
                msg: "You are now a cohost of this event!",
                event 
            });
        } else if (action === 'decline') {
            // Update invitation status
            user.cohostInvitations[invitationIndex].status = 'declined';
            await user.save();

            return NextResponse.json({ 
                success: true, 
                msg: "Invitation declined" 
            });
        } else {
            return NextResponse.json({ success: false, msg: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing invitation:', error);
        return NextResponse.json({ success: false, msg: "Error processing invitation" }, { status: 500 });
    }
}

// DELETE - Remove cohost
export async function DELETE(request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, msg: "Not authenticated" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const cohostId = searchParams.get('cohostId');

        const event = await BlogModel.findById(eventId);
        if (!event) {
            return NextResponse.json({ success: false, msg: "Event not found" }, { status: 404 });
        }

        // Only event author can remove cohosts
        if (event.authorId.toString() !== decoded.id) {
            return NextResponse.json({ success: false, msg: "Only the event creator can remove cohosts" }, { status: 403 });
        }

        // Remove cohost
        event.cohosts = event.cohosts.filter(c => c.userId.toString() !== cohostId);
        await event.save();

        return NextResponse.json({ 
            success: true, 
            msg: "Cohost removed successfully" 
        });
    } catch (error) {
        console.error('Error removing cohost:', error);
        return NextResponse.json({ success: false, msg: "Error removing cohost" }, { status: 500 });
    }
}
