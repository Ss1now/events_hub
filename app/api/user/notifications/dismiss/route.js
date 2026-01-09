import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/config/db';
import userModel from '@/lib/models/usermodel';
import Blogmodel from '@/lib/models/blogmodel';

// POST - Dismiss a notification
export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const body = await request.json();
        const { eventId, notificationId } = body;
        
        await connectDB();
        
        const user = await userModel.findById(decoded.id);
        
        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        // Remove the notification from user's pending list
        user.pendingNotifications = user.pendingNotifications.filter(
            n => !(n.eventId.toString() === eventId && n.notificationId.toString() === notificationId)
        );
        
        await user.save();

        // Mark user as notified in the event's notification
        const event = await Blogmodel.findById(eventId);
        if (event) {
            const notification = event.updateNotifications.find(
                n => n._id.toString() === notificationId
            );
            
            if (notification && !notification.notifiedUsers.includes(decoded.id)) {
                notification.notifiedUsers.push(decoded.id);
                await event.save();
            }
        }

        return NextResponse.json({ 
            success: true, 
            msg: 'Notification dismissed'
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, msg: 'Error dismissing notification' }, { status: 500 });
    }
}
