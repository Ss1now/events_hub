import { connectDB } from "@/lib/config/db"
const { NextResponse } = require("next/server")
import {writeFile, mkdir} from 'fs/promises';
import Blogmodel from "@/lib/models/blogmodel";
import userModel from "@/lib/models/usermodel";
import path from 'path';
const fs = require('fs');
import jwt from 'jsonwebtoken';
import { verifyAdmin } from "@/lib/utils/adminAuth";
import mongoose from 'mongoose';

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

// API Endpoint to get all blogs
export async function GET(request){

    const blogId = request.nextUrl.searchParams.get("id")
    if (blogId){
        const blog = await Blogmodel.findById(blogId);
        
        // Calculate current status based on time
        const now = new Date();
        const startTime = new Date(blog.startDateTime);
        const endTime = new Date(blog.endDateTime);
        
        let currentStatus;
        if (now < startTime) {
            currentStatus = 'future';
        } else if (now >= startTime && now <= endTime) {
            currentStatus = 'live';
        } else {
            currentStatus = 'past';
        }
        
        // Update the blog status if it has changed
        if (blog.status !== currentStatus) {
            blog.status = currentStatus;
            await blog.save();
        }
        
        return NextResponse.json(blog);
    }else{
        const blogs = await Blogmodel.find({});
        
        // Update status for all blogs based on current time
        const now = new Date();
        const updatedBlogs = blogs.map(blog => {
            const startTime = new Date(blog.startDateTime);
            const endTime = new Date(blog.endDateTime);
            
            let currentStatus;
            if (now < startTime) {
                currentStatus = 'future';
            } else if (now >= startTime && now <= endTime) {
                currentStatus = 'live';
            } else {
                currentStatus = 'past';
            }
            
            // Update in database if status changed
            if (blog.status !== currentStatus) {
                blog.status = currentStatus;
                blog.save();
            }
            
            return blog;
        });
        
        return NextResponse.json({blogs: updatedBlogs});
    }
}


// API Endpoint for uploading post
export async function POST(request){

    try {
        // Extract and verify JWT token
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Authentication required' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const formData = await request.formData();
        const timestamp = Date.now();
        const images = formData.getAll('images');
        const imageUrls = [];
        
        // Process multiple images
        if (images && images.length > 0) {
            const dir = './public/images/blogs';
            await mkdir(dir, { recursive: true });
            
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                if (image && image.size > 0) {
                    const imageByteData = await image.arrayBuffer();
                    const buffer = Buffer.from(imageByteData);
                    const filePath = `${dir}/${timestamp}_${i}_${image.name}`;
                    await writeFile(filePath, buffer);
                    imageUrls.push(`/images/blogs/${timestamp}_${i}_${image.name}`);
                }
            }
        }
       
        // Calculate status based on start and end times
        const now = new Date();
        const startTime = new Date(formData.get('startDateTime'));
        const endTime = new Date(formData.get('endDateTime'));
        
        let currentStatus;
        if (now < startTime) {
            currentStatus = 'future';
        } else if (now >= startTime && now <= endTime) {
            currentStatus = 'live';
        } else {
            currentStatus = 'past';
        }
       
        const blogData = {
            title: `${formData.get('title')}`,
            description: `${formData.get('description')}`,
            images: imageUrls,
            date: new Date(),
            startDateTime: startTime,
            endDateTime: endTime,
            status: currentStatus,
            eventType: `${formData.get('eventType')}`,
            theme: `${formData.get('theme')}`,
            dressCode: `${formData.get('dressCode')}`,
            location: `${formData.get('location')}`,
            needReservation: formData.get('needReservation') === 'true',
            reserved: parseInt(formData.get('reserved')) || 0,
            capacity: parseInt(formData.get('capacity')) || 0,
            reservationDeadline: formData.get('reservationDeadline') ? new Date(formData.get('reservationDeadline')) : null,
            interestedUsers: [],
            reservedUsers: [],
            host: `${formData.get('host')}`,
            authorId: userId
        }

        await Blogmodel.create(blogData);
        console.log("Post Created");

        return NextResponse.json({success:true, msg:"Post Created Successfully"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false, msg:"Error creating post"}, { status: 500 });
    }
}

// API Endpoint for updating/editing post
export async function PUT(request) {
    try {
        // Extract and verify JWT token
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Authentication required' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const formData = await request.formData();
        const eventId = formData.get('eventId');
        
        if (!eventId) {
            return NextResponse.json({ success: false, msg: 'Event ID required' }, { status: 400 });
        }

        await connectDB();

        const event = await Blogmodel.findById(eventId);
        
        if (!event) {
            return NextResponse.json({ success: false, msg: 'Event not found' }, { status: 404 });
        }

        // Check if the user is the author of the event
        if (event.authorId.toString() !== userId) {
            return NextResponse.json({ success: false, msg: 'Unauthorized to edit this event' }, { status: 403 });
        }

        // Check if event can be edited (future or live events only, not past)
        const now = new Date();
        const startTime = new Date(event.startDateTime);
        const endTime = new Date(event.endDateTime);
        
        if (now > endTime) {
            return NextResponse.json({ success: false, msg: 'Cannot edit events that have already ended' }, { status: 400 });
        }

        // Check if this is a live event being edited
        const isLiveEdit = now >= startTime && now <= endTime;

        const timestamp = Date.now();
        const newImages = formData.getAll('images');
        
        let imageUrls = event.images || []; // Keep existing images by default
        
        // Only process new images if uploaded
        if (newImages && newImages.length > 0 && newImages[0].size > 0) {
            const dir = './public/images/blogs';
            await mkdir(dir, { recursive: true });
            
            const uploadedUrls = [];
            for (let i = 0; i < newImages.length; i++) {
                const image = newImages[i];
                if (image && image.size > 0) {
                    const imageByteData = await image.arrayBuffer();
                    const buffer = Buffer.from(imageByteData);
                    const filePath = `${dir}/${timestamp}_${i}_${image.name}`;
                    await writeFile(filePath, buffer);
                    uploadedUrls.push(`/images/blogs/${timestamp}_${i}_${image.name}`);
                }
            }
            
            // Delete old images if new ones uploaded
            if (event.images && event.images.length > 0) {
                event.images.forEach(oldImg => {
                    try {
                        fs.unlink(`./public${oldImg}`, () => {});
                    } catch (err) {
                        console.log('Error deleting old image:', err);
                    }
                });
            }
            
            imageUrls = uploadedUrls;
        }

        // Update event fields
        const newStartDateTime = new Date(formData.get('startDateTime'));
        const newEndDateTime = new Date(formData.get('endDateTime'));
        
        // Recalculate status based on new times
        let currentStatus;
        if (now < newStartDateTime) {
            currentStatus = 'future';
        } else if (now >= newStartDateTime && now <= newEndDateTime) {
            currentStatus = 'live';
        } else {
            currentStatus = 'past';
        }

        event.title = formData.get('title');
        event.description = formData.get('description');
        event.images = imageUrls;
        event.startDateTime = newStartDateTime;
        event.endDateTime = newEndDateTime;
        event.status = currentStatus;
        event.eventType = formData.get('eventType');
        event.theme = formData.get('theme');
        event.dressCode = formData.get('dressCode');
        event.location = formData.get('location');
        event.needReservation = formData.get('needReservation') === 'true';
        event.reserved = parseInt(formData.get('reserved')) || 0;
        event.capacity = parseInt(formData.get('capacity')) || 0;
        event.reservationDeadline = formData.get('reservationDeadline') ? new Date(formData.get('reservationDeadline')) : null;
        event.host = formData.get('host');
        event.lastUpdated = new Date();

        // If this is a live event edit, create notification for interested/reserved users
        if (isLiveEdit) {
            const updateMessage = `Event details have been updated for "${event.title}"`;
            const notificationId = new mongoose.Types.ObjectId();
            
            event.updateNotifications.push({
                _id: notificationId,
                message: updateMessage,
                timestamp: new Date(),
                notifiedUsers: []
            });

            // Get all users who are interested or reserved
            const affectedUsers = [...new Set([
                ...event.interestedUsers.map(id => id.toString()),
                ...event.reservedUsers.map(id => id.toString())
            ])];

            // Add notification to each affected user
            await userModel.updateMany(
                { _id: { $in: affectedUsers } },
                {
                    $push: {
                        pendingNotifications: {
                            eventId: event._id,
                            notificationId: notificationId,
                            timestamp: new Date()
                        }
                    }
                }
            );
        }

        await event.save();
        console.log("Event Updated");

        return NextResponse.json({success: true, msg: "Event Updated Successfully", isLiveEdit});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success: false, msg: "Error updating event"}, { status: 500 });
    }
}


//API Endpoint for deleting post

export async function DELETE(request){
    try {
        // Extract and verify JWT token
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Authentication required' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        await connectDB();
        
        // Get user to check if admin
        const user = await userModel.findById(userId);
        const isAdmin = user?.isAdmin || false;

        const id = await request.nextUrl.searchParams.get('id');
        const blog = await Blogmodel.findById(id);
        
        if (!blog) {
            return NextResponse.json({ success: false, msg: 'Blog not found' }, { status: 404 });
        }

        // Check if the user is the author of the blog OR an admin
        const isAuthor = blog.authorId.toString() === userId;
        
        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ success: false, msg: 'Unauthorized to delete this post' }, { status: 403 });
        }

        // Delete image files if they exist
        if (blog.images && blog.images.length > 0) {
            blog.images.forEach(image => {
                try {
                    fs.unlink(`./public${image}`, () => {});
                } catch (err) {
                    console.log('Error deleting image file:', err);
                }
            });
        }
        
        await Blogmodel.findByIdAndDelete(id);
        return NextResponse.json({ success: true, msg: "Post Deleted" });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ success: false, msg: 'Error deleting post' }, { status: 500 });
    }
}

// API Endpoint for guest actions (mark interested, reserve, cancel)
export async function PATCH(request){
    try {
        await connectDB(); // Ensure database connection
        
        // Extract and verify JWT token
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Authentication required' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const body = await request.json();
        const { action, eventId } = body;

        const event = await Blogmodel.findById(eventId);
        
        if (!event) {
            return NextResponse.json({ success: false, msg: 'Event not found' }, { status: 404 });
        }

        switch(action) {
            case 'interested':
                // Initialize interestedUsers if it doesn't exist
                if (!event.interestedUsers) {
                    event.interestedUsers = [];
                }
                
                // Toggle interested status
                const isInterested = event.interestedUsers.some(id => id.toString() === userId.toString());
                
                if (isInterested) {
                    // Remove from interested
                    event.interestedUsers = event.interestedUsers.filter(id => id.toString() !== userId.toString());
                    await userModel.findByIdAndUpdate(userId, {
                        $pull: { interestedEvents: eventId }
                    });
                    console.log(`User ${userId} removed from interested for event ${eventId}`);
                } else {
                    // Add to interested
                    event.interestedUsers.push(userId);
                    await userModel.findByIdAndUpdate(userId, {
                        $addToSet: { interestedEvents: eventId }
                    });
                    console.log(`User ${userId} added to interested for event ${eventId}`);
                }
                
                const savedEvent = await event.save();
                console.log(`Event saved. Interested users count: ${savedEvent.interestedUsers.length}`);
                
                return NextResponse.json({ 
                    success: true, 
                    msg: isInterested ? 'Removed from interested' : 'Marked as interested',
                    interestedCount: savedEvent.interestedUsers.length,
                    isInterested: !isInterested
                });

            case 'reserve':
                // Initialize reservedUsers if it doesn't exist
                if (!event.reservedUsers) {
                    event.reservedUsers = [];
                }
                
                // Check if event needs reservation
                if (!event.needReservation) {
                    return NextResponse.json({ success: false, msg: 'This event does not require reservation' }, { status: 400 });
                }

                // Check reservation deadline
                if (event.reservationDeadline && new Date() > new Date(event.reservationDeadline)) {
                    return NextResponse.json({ success: false, msg: 'Reservation deadline has passed' }, { status: 400 });
                }

                // Check if already reserved
                if (event.reservedUsers.some(id => id.toString() === userId.toString())) {
                    return NextResponse.json({ success: false, msg: 'You have already reserved this event' }, { status: 400 });
                }

                // Check capacity
                if (event.reservedUsers.length >= event.capacity) {
                    return NextResponse.json({ success: false, msg: 'Event has reached capacity' }, { status: 400 });
                }

                // Add to reserved
                event.reservedUsers.push(userId);
                event.reserved = event.reservedUsers.length;
                await userModel.findByIdAndUpdate(userId, {
                    $addToSet: { reservedEvents: eventId }
                });
                
                await event.save();
                return NextResponse.json({ 
                    success: true, 
                    msg: 'Successfully reserved',
                    reserved: event.reserved,
                    capacity: event.capacity
                });

            case 'cancel-reservation':
                // Initialize reservedUsers if it doesn't exist
                if (!event.reservedUsers) {
                    event.reservedUsers = [];
                }
                
                // Check if user has reserved
                if (!event.reservedUsers.some(id => id.toString() === userId.toString())) {
                    return NextResponse.json({ success: false, msg: 'You have not reserved this event' }, { status: 400 });
                }

                // Remove from reserved
                event.reservedUsers = event.reservedUsers.filter(id => id.toString() !== userId.toString());
                event.reserved = event.reservedUsers.length;
                await userModel.findByIdAndUpdate(userId, {
                    $pull: { reservedEvents: eventId }
                });
                
                await event.save();
                return NextResponse.json({ 
                    success: true, 
                    msg: 'Reservation cancelled',
                    reserved: event.reserved,
                    capacity: event.capacity
                });

            default:
                return NextResponse.json({ success: false, msg: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing guest action:', error);
        return NextResponse.json({ success: false, msg: 'Error processing request' }, { status: 500 });
    }
}