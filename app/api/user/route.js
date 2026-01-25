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
        
        console.log('Fetched user:', user);
        console.log('User username:', user?.username);
        
        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        // If user doesn't have a username, generate one from email
        if (!user.username) {
            const baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            let username = baseUsername;
            let counter = 1;
            
            // Check if username exists, if so add a number
            while (await userModel.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }
            
            user.username = username;
            await user.save();
            console.log('Generated username for user:', username);
        }

        // Fetch user's events
        const events = await Blogmodel.find({ authorId: decoded.id }).sort({ date: -1 });

        // Fetch events where user is a cohost
        const cohostedEvents = await Blogmodel.find({
            'cohosts.userId': decoded.id
        }).sort({ date: -1 });

        // Fetch user's interested events
        const interestedEvents = await Blogmodel.find({ 
            _id: { $in: user.interestedEvents || [] } 
        }).sort({ startDateTime: 1 });

        // Fetch user's reserved events
        const reservedEvents = await Blogmodel.find({ 
            _id: { $in: user.reservedEvents || [] } 
        }).sort({ startDateTime: 1 });

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
                username: user.username,
                instagram: user.instagram,
                residentialCollege: user.residentialCollege,
                isAdmin: user.isAdmin || false,
                ratedEvents: user.ratedEvents || [],
                cohostInvitations: user.cohostInvitations || [],
                eventUpdateNotifications: user.eventUpdateNotifications || []
            },
            events: updatedEvents,
            cohostedEvents,
            interestedEvents,
            reservedEvents
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
        const { residentialCollege, name, username, instagram } = body;
        
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
        if (instagram !== undefined) {
            // Validate Instagram username format if provided
            if (instagram && !/^[a-z0-9._]{1,30}$/.test(instagram)) {
                return NextResponse.json({ 
                    success: false, 
                    msg: 'Instagram username must be 1-30 characters and contain only lowercase letters, numbers, dots, and underscores' 
                }, { status: 400 });
            }
            updateFields.instagram = instagram;
        }
        if (username !== undefined) {
            // Validate username format (alphanumeric and underscore only, 3-20 chars)
            if (!/^[a-z0-9_]{3,20}$/.test(username)) {
                return NextResponse.json({ 
                    success: false, 
                    msg: 'Username must be 3-20 characters long and contain only lowercase letters, numbers, and underscores' 
                }, { status: 400 });
            }
            
            // Check if username is already taken by another user
            const existingUser = await userModel.findOne({ 
                username, 
                _id: { $ne: decoded.id } 
            });
            
            if (existingUser) {
                return NextResponse.json({ 
                    success: false, 
                    msg: 'Username already taken' 
                }, { status: 400 });
            }
            
            updateFields.username = username;
        }
        
        console.log('Updating user:', decoded.id, 'with fields:', updateFields);
        
        // Update user using $set operator
        const user = await userModel.findByIdAndUpdate(
            decoded.id,
            { $set: updateFields },
            { new: true, runValidators: false, strict: false }
        ).select('-password');
        
        console.log('User after update:', JSON.stringify(user, null, 2));
        console.log('Username specifically:', user?.username);
        
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
                username: user.username,
                instagram: user.instagram,
                residentialCollege: user.residentialCollege
            }
        });
    } catch (error) {
        console.log('Error in PUT /api/user:', error);
        return NextResponse.json({ success: false, msg: error.message || 'Invalid token or server error' }, { status: 401 });
    }
}
