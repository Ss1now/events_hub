import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/config/db';
import userModel from '@/lib/models/usermodel';
import Blogmodel from '@/lib/models/blogmodel';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        await connectDB();
        
        // Fetch user data
        const user = await userModel.findById(decoded.id).select('-password');
        
        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        // Fetch user's events
        const events = await Blogmodel.find({ authorId: decoded.id }).sort({ date: -1 });

        // Update status for all events based on current time
        const now = new Date();
        const updatedEvents = await Promise.all(events.map(async (event) => {
            const startTime = new Date(event.startDateTime);
            const endTime = new Date(event.endDateTime);
            
            let currentStatus;
            if (now < startTime) {
                currentStatus = 'future';
            } else if (now >= startTime && now <= endTime) {
                currentStatus = 'live';
            } else {
                currentStatus = 'past';
            }
            
            // Update in database if status changed
            if (event.status !== currentStatus) {
                event.status = currentStatus;
                await event.save();
            }
            
            return event;
        }));

        return NextResponse.json({ 
            success: true, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                residentialCollege: user.residentialCollege
            },
            events: updatedEvents 
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, msg: 'Invalid token or server error' }, { status: 401 });
    }
}

export async function PUT(request) {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const body = await request.json();
        const { residentialCollege, name } = body;
        
        await connectDB();
        
        // Build update object based on what fields are provided
        const updateFields = {};
        if (residentialCollege !== undefined) {
            updateFields.residentialCollege = residentialCollege;
        }
        if (name !== undefined) {
            // Allow empty name (user can clear it)
            updateFields.name = name;
        }
        
        console.log('Updating user:', decoded.id, 'with fields:', updateFields);
        
        // Update user
        const user = await userModel.findByIdAndUpdate(
            decoded.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');
        
        console.log('User after update:', user);
        
        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            msg: 'User information updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                residentialCollege: user.residentialCollege
            }
        });
    } catch (error) {
        console.log('Error in PUT /api/user:', error);
        return NextResponse.json({ success: false, msg: error.message || 'Invalid token or server error' }, { status: 401 });
    }
}
