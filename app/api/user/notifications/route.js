import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/config/db';
import userModel from '@/lib/models/usermodel';
import Blogmodel from '@/lib/models/blogmodel';

// GET - Fetch pending notifications for user
export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        await connectDB();
        
        const user = await userModel.findById(decoded.id);
        
        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        // Get all pending notifications with event details
        const notifications = [];
        
        for (const pending of user.pendingNotifications || []) {
            const event = await Blogmodel.findById(pending.eventId);
            if (event) {
                const notification = event.updateNotifications.find(
                    n => n._id.toString() === pending.notificationId.toString()
                );
                
                if (notification) {
                    notifications.push({
                        _id: pending._id,
                        eventId: event._id,
                        eventTitle: event.title,
                        notificationId: notification._id,
                        message: notification.message,
                        timestamp: notification.timestamp,
                    });
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            notifications
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, msg: 'Error fetching notifications' }, { status: 500 });
    }
}
