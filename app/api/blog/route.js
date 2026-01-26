import { connectDB } from "@/lib/config/db"
const { NextResponse } = require("next/server")
import Blogmodel from "@/lib/models/blogmodel";
import userModel from "@/lib/models/usermodel";
import jwt from 'jsonwebtoken';
import { verifyAdmin } from "@/lib/utils/adminAuth";
import mongoose from 'mongoose';
import { uploadMultipleToCloudinary, deleteMultipleFromCloudinary } from "@/lib/utils/cloudinary";
import { sendUpdateEmails } from "@/lib/email/sendUpdateEmails";
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

// API Endpoint to get all blogs
export async function GET(request){

    const blogId = request.nextUrl.searchParams.get("id")
    if (blogId){
        const blog = await Blogmodel.findById(blogId).populate('authorId', 'instagram name username');
        
        console.log('[Get Blog] Retrieved blog:', blogId);
        console.log('[Get Blog] startDateTime:', blog.startDateTime);
        console.log('[Get Blog] endDateTime:', blog.endDateTime);
        
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
            // Only update the status field, don't re-save entire document
            await Blogmodel.findByIdAndUpdate(blogId, { status: currentStatus });
            blog.status = currentStatus; // Update local object for response
        }
        
        return NextResponse.json(blog);
    }else{
        const blogs = await Blogmodel.find({}).populate('authorId', 'isOrganization name');
        
        // Update status for all blogs based on current time
        const now = new Date();
        const blogsToUpdate = [];
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
            
            // Update in database if status changed (batch update, don't use save())
            if (blog.status !== currentStatus) {
                blogsToUpdate.push({
                    updateOne: {
                        filter: { _id: blog._id },
                        update: { status: currentStatus }
                    }
                });
                blog.status = currentStatus; // Update local object for response
            }
            
            return blog;
        });
        
        // Batch update all changed statuses
        if (blogsToUpdate.length > 0) {
            await Blogmodel.bulkWrite(blogsToUpdate);
        }
        
        return NextResponse.json({blogs: updatedBlogs});
    }
}


// API Endpoint for uploading post
export async function POST(request){

    console.log('POST /api/blog - Request received');
    
    try {
        // Extract and verify JWT token
        const authHeader = request.headers.get('authorization');
        
        console.log('Auth header present:', !!authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Authentication required' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        console.log('User authenticated:', userId);

        await connectDB();
        
        // Check if user is an organization
        const user = await userModel.findById(userId);
        const isOrganization = user && user.isOrganization;
        
        console.log('User found, isOrganization:', isOrganization);

        const formData = await request.formData();
        console.log('FormData parsed successfully');
        
        const timestamp = Date.now();
        const images = formData.getAll('images');
        console.log('Images count:', images.length);
        const imageUrls = [];
        
        // Process multiple images - upload to Cloudinary
        if (images && images.length > 0) {
            const validImages = images.filter(img => img && img.size > 0);
            if (validImages.length > 0) {
                try {
                    console.log(`Uploading ${validImages.length} images to Cloudinary...`);
                    const uploadedUrls = await uploadMultipleToCloudinary(validImages, 'events');
                    imageUrls.push(...uploadedUrls);
                    console.log('Images uploaded successfully:', uploadedUrls);
                } catch (uploadError) {
                    console.error('Cloudinary upload failed:', uploadError);
                    return NextResponse.json({
                        success: false, 
                        msg: `Image upload failed: ${uploadError.message || 'Unknown error'}`
                    }, { status: 500 });
                }
            }
        }
       
        // Calculate status based on start and end times
        // Frontend sends ISO strings with timezone (e.g., "2026-01-12T14:28:00.000Z")
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
       
        const hostName = `${formData.get('host')}`;
        const eventCategoryValue = isOrganization ? (formData.get('eventCategory') || 'user') : 'user';
        
        // For residential college events, use host name as organizer
        const organizerValue = eventCategoryValue === 'residential_college' 
            ? hostName 
            : (formData.get('organizer') || null);
        
        const blogData = {
            title: `${formData.get('title')}`,
            description: `${formData.get('description')}`,
            images: imageUrls,
            date: new Date(),
            startDateTime: startTime,
            endDateTime: endTime,
            status: currentStatus,
            eventType: `${formData.get('eventType')}`,
            location: `${formData.get('location')}`,
            needReservation: formData.get('needReservation') === 'true',
            capacity: parseInt(formData.get('capacity')) || 0,
            reservationDeadline: formData.get('reservationDeadline') ? new Date(formData.get('reservationDeadline')) : null,
            interestedUsers: [],
            reservedUsers: [],
            host: hostName,
            authorId: userId,
            cohosts: [],
            eventCategory: eventCategoryValue,
            organizer: organizerValue,
            isRecurring: formData.get('isRecurring') === 'true',
            recurrencePattern: formData.get('recurrencePattern') || 'none',
            weeklyTheme: formData.get('weeklyTheme') || '',
            eventPageType: formData.get('eventPageType') || 'party',
            isCollegeOnly: formData.get('isCollegeOnly') === 'true',
            targetCollege: formData.get('isCollegeOnly') === 'true' ? (formData.get('targetCollege') || null) : null
        }

        console.log('Creating blog with data:', JSON.stringify(blogData, null, 2));
        const createdBlog = await Blogmodel.create(blogData);
        console.log("Post Created Successfully:", createdBlog._id);

        return NextResponse.json({success:true, msg:"Post Created Successfully", blog: createdBlog});
    } catch (error) {
        console.error('Event creation error:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({
            success:false, 
            msg: `Error creating post: ${error.message || 'Unknown error'}`
        }, { status: 500 });
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

        // Check if the user is the author or a cohost of the event
        const isAuthor = event.authorId.toString() === userId;
        const isCohost = event.cohosts && event.cohosts.some(c => c.userId.toString() === userId);
        
        if (!isAuthor && !isCohost) {
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
        let imagesChanged = false;
        
        // Only process new images if uploaded
        if (newImages && newImages.length > 0 && newImages[0].size > 0) {
            const validImages = newImages.filter(img => img && img.size > 0);
            const uploadedUrls = await uploadMultipleToCloudinary(validImages, 'events');
            
            // Delete old images from Cloudinary if new ones uploaded
            if (event.images && event.images.length > 0) {
                await deleteMultipleFromCloudinary(event.images);
            }
            
            imageUrls = uploadedUrls;
            imagesChanged = true;
        }

        // Update event fields
        // Frontend sends ISO strings with timezone (e.g., "2026-01-12T14:28:00.000Z")
        const startDateTimeValue = formData.get('startDateTime');
        const endDateTimeValue = formData.get('endDateTime');
        const newStartDateTime = new Date(startDateTimeValue);
        const newEndDateTime = new Date(endDateTimeValue);

        if (!startDateTimeValue || !endDateTimeValue || Number.isNaN(newStartDateTime.getTime()) || Number.isNaN(newEndDateTime.getTime())) {
            return NextResponse.json({ success: false, msg: 'Invalid start or end time' }, { status: 400 });
        }
        
        console.log('[Event Update] Received startDateTime:', formData.get('startDateTime'));
        console.log('[Event Update] Received endDateTime:', formData.get('endDateTime'));
        console.log('[Event Update] Parsed newStartDateTime:', newStartDateTime);
        console.log('[Event Update] Parsed newEndDateTime:', newEndDateTime);
        console.log('[Event Update] Current event.startDateTime:', event.startDateTime);
        console.log('[Event Update] Current event.endDateTime:', event.endDateTime);
        
        // Track changes for notification
        const changes = [];
        
        if (event.title !== formData.get('title')) {
            changes.push(`Title changed from "${event.title}" to "${formData.get('title')}"`);
        }
        
        if (event.description !== formData.get('description')) {
            changes.push('Description updated');
        }
        
        if (event.startDateTime.getTime() !== newStartDateTime.getTime()) {
            changes.push(`Start time changed from ${event.startDateTime.toLocaleString()} to ${newStartDateTime.toLocaleString()}`);
        }
        
        if (event.endDateTime.getTime() !== newEndDateTime.getTime()) {
            changes.push(`End time changed from ${event.endDateTime.toLocaleString()} to ${newEndDateTime.toLocaleString()}`);
        }
        
        if (event.eventType !== formData.get('eventType')) {
            changes.push(`Event type changed from "${event.eventType}" to "${formData.get('eventType')}"`);
        }
        
        if (event.location !== formData.get('location')) {
            changes.push(`Location changed from "${event.location}" to "${formData.get('location')}"`);
        }
        
        const newNeedReservation = formData.get('needReservation') === 'true';
        if (event.needReservation !== newNeedReservation) {
            changes.push(`RSVP requirement ${newNeedReservation ? 'added' : 'removed'}`);
        }
        
        const newCapacity = parseInt(formData.get('capacity')) || 0;
        if (event.capacity !== newCapacity) {
            changes.push(`Capacity changed from ${event.capacity} to ${newCapacity}`);
        }
        
        if (event.host !== formData.get('host')) {
            changes.push(`Host changed from "${event.host}" to "${formData.get('host')}"`);
        }
        
        const newInstagram = formData.get('instagram') || '';
        if (event.instagram !== newInstagram) {
            changes.push('Contact information updated');
        }
        
        // Check if images changed
        if (imagesChanged) {
            changes.push('Event images updated');
        }
        
        console.log('[Event Update] Detected changes:', changes);
        
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
        event.markModified('startDateTime');
        event.markModified('endDateTime');
        event.status = currentStatus;
        event.eventType = formData.get('eventType');
        event.theme = formData.get('theme') || '';
        event.dressCode = formData.get('dressCode') || '';
        event.location = formData.get('location');
        event.needReservation = newNeedReservation;
        event.capacity = newCapacity;
        event.reservationDeadline = formData.get('reservationDeadline') ? new Date(formData.get('reservationDeadline')) : null;
        event.host = formData.get('host');
        event.instagram = newInstagram;
        event.lastUpdated = new Date();

        console.log('[Event Update] About to save event with startDateTime:', event.startDateTime);
        console.log('[Event Update] About to save event with endDateTime:', event.endDateTime);

        console.log('[Event Update] Total changes detected:', changes.length);
        console.log('[Event Update] Current status:', currentStatus);
        console.log('[Event Update] Interested users count:', event.interestedUsers.length);
        console.log('[Event Update] Reserved users count:', event.reservedUsers.length);

        // Notify interested/reserved users about event update
        // Send notifications if there are changes OR as a safety measure always notify on update
        const shouldNotify = (currentStatus === 'future' || currentStatus === 'live');
        
        if (shouldNotify) {
            // Get all users who are interested or reserved
            const affectedUsers = [...new Set([
                ...event.interestedUsers.map(id => id.toString()),
                ...event.reservedUsers.map(id => id.toString())
            ])];

            console.log('[Event Update] Affected users count:', affectedUsers.length);

            if (affectedUsers.length > 0) {
                // Create a summary of changes - use generic message if no specific changes detected
                const changesSummary = changes.length > 0 ? changes.join('; ') : 'Event details updated';
                
                console.log('[Event Update] Sending notifications with changes:', changesSummary);
                
                // Add in-app notification to each affected user
                await userModel.updateMany(
                    { _id: { $in: affectedUsers } },
                    {
                        $push: {
                            eventUpdateNotifications: {
                                eventId: event._id,
                                eventTitle: event.title,
                                changes: changesSummary,
                                timestamp: new Date(),
                                read: false
                            }
                        }
                    }
                );
                
                console.log(`Notified ${affectedUsers.length} users about event update: ${changesSummary}`);
                
                // Send email notifications to subscribed users (async, don't block response)
                console.log('[Email Trigger] About to call sendUpdateEmails');
                console.log('[Email Trigger] Event ID:', event._id.toString());
                console.log('[Email Trigger] Changes:', changesSummary);
                
                sendUpdateEmails(event._id.toString(), changesSummary)
                    .then(result => {
                        console.log('[Email Trigger] Email sending result:', result);
                    })
                    .catch(err => {
                        console.error('[Email Trigger] Error sending update emails:', err);
                    });
            }
        }

        console.log('[Event Update] RIGHT BEFORE SAVE:');
        console.log('[Event Update] event.startDateTime:', event.startDateTime);
        console.log('[Event Update] event.endDateTime:', event.endDateTime);
        console.log('[Event Update] event.instagram:', event.instagram);
        console.log('[Event Update] event.theme:', event.theme);
        console.log('[Event Update] event.dressCode:', event.dressCode);
        
        await event.save();
        
        console.log("Event Updated - Saved to DB");
        console.log('[Event Update] AFTER SAVE:');
        console.log('[Event Update] After save - startDateTime:', event.startDateTime);
        console.log('[Event Update] After save - endDateTime:', event.endDateTime);
        console.log('[Event Update] After save - instagram:', event.instagram);

        // Revalidate paths to ensure fresh data
        revalidatePath('/me');
        revalidatePath(`/blogs/${eventId}`);
        revalidatePath('/');

        return NextResponse.json({success:true, msg:"Event Updated Successfully"});
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

        // Delete image files from Cloudinary if they exist
        if (blog.images && blog.images.length > 0) {
            await deleteMultipleFromCloudinary(blog.images);
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
            case 'update-category':
                // Check if user is admin
                const adminUser = await userModel.findById(userId);
                if (!adminUser?.isAdmin) {
                    return NextResponse.json({ success: false, msg: 'Admin privileges required' }, { status: 403 });
                }
                
                const { eventCategory } = body;
                
                // Validate category
                if (!['user', 'residential_college', 'university'].includes(eventCategory)) {
                    return NextResponse.json({ success: false, msg: 'Invalid event category' }, { status: 400 });
                }
                
                await blogModel.findByIdAndUpdate(eventId, {
                    eventCategory: eventCategory
                });
                
                return NextResponse.json({ 
                    success: true, 
                    msg: eventCategory === 'user' ? 'Official status removed' : 'Event marked as official',
                    eventCategory: eventCategory
                });
            
            case 'transfer-ownership':
                // Check if user is admin
                const transferAdminUser = await userModel.findById(userId);
                if (!transferAdminUser?.isAdmin) {
                    return NextResponse.json({ success: false, msg: 'Admin privileges required' }, { status: 403 });
                }
                
                const { newOwnerId } = body;
                
                // Validate new owner exists
                const newOwner = await userModel.findById(newOwnerId);
                if (!newOwner) {
                    return NextResponse.json({ success: false, msg: 'Target user not found' }, { status: 404 });
                }
                
                // Update event ownership
                await blogModel.findByIdAndUpdate(eventId, {
                    authorId: newOwnerId,
                    host: newOwner.name || newOwner.username
                });
                
                return NextResponse.json({ 
                    success: true, 
                    msg: `Event transferred to ${newOwner.name || newOwner.username}`,
                    newHost: newOwner.name || newOwner.username
                });
            
            case 'interested':
                // Initialize interestedUsers if it doesn't exist
                if (!event.interestedUsers) {
                    event.interestedUsers = [];
                }
                
                // Toggle interested status
                const isInterested = event.interestedUsers.some(id => id.toString() === userId.toString());
                
                let updatedEvent;
                if (isInterested) {
                    // Remove from interested
                    updatedEvent = await blogModel.findByIdAndUpdate(
                        eventId,
                        { $pull: { interestedUsers: userId } },
                        { new: true }
                    );
                    await userModel.findByIdAndUpdate(userId, {
                        $pull: { interestedEvents: eventId }
                    });
                    console.log(`User ${userId} removed from interested for event ${eventId}`);
                } else {
                    // Add to interested
                    updatedEvent = await blogModel.findByIdAndUpdate(
                        eventId,
                        { $addToSet: { interestedUsers: userId } },
                        { new: true }
                    );
                    await userModel.findByIdAndUpdate(userId, {
                        $addToSet: { interestedEvents: eventId }
                    });
                    console.log(`User ${userId} added to interested for event ${eventId}`);
                }
                
                console.log(`Event updated. Interested users count: ${updatedEvent.interestedUsers.length}`);
                
                return NextResponse.json({ 
                    success: true, 
                    msg: isInterested ? 'Removed from interested' : 'Marked as interested',
                    interestedCount: updatedEvent.interestedUsers.length,
                    isInterested: !isInterested
                });

            case 'reserve':
                // Initialize reservedUsers if it doesn't exist
                if (!event.reservedUsers) {
                    event.reservedUsers = [];
                }
                
                // Check if event needs RSVP
                if (!event.needReservation) {
                    return NextResponse.json({ success: false, msg: 'This event does not require RSVP' }, { status: 400 });
                }

                // Check RSVP deadline
                if (event.reservationDeadline && new Date() > new Date(event.reservationDeadline)) {
                    return NextResponse.json({ success: false, msg: 'RSVP deadline has passed' }, { status: 400 });
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
                await blogModel.findByIdAndUpdate(
                    eventId,
                    { $addToSet: { reservedUsers: userId } }
                );
                await userModel.findByIdAndUpdate(userId, {
                    $addToSet: { reservedEvents: eventId }
                });
                
                const reservedEvent = await blogModel.findById(eventId);
                return NextResponse.json({ 
                    success: true, 
                    msg: 'Successfully reserved',
                    reserved: reservedEvent.reservedUsers.length,
                    capacity: reservedEvent.capacity
                });

            case 'cancel-rsvp':
                // Initialize reservedUsers if it doesn't exist
                if (!event.reservedUsers) {
                    event.reservedUsers = [];
                }
                
                // Check if user has reserved
                if (!event.reservedUsers.some(id => id.toString() === userId.toString())) {
                    return NextResponse.json({ success: false, msg: 'You have not reserved this event' }, { status: 400 });
                }

                // Remove from reserved
                await blogModel.findByIdAndUpdate(
                    eventId,
                    { $pull: { reservedUsers: userId } }
                );
                await userModel.findByIdAndUpdate(userId, {
                    $pull: { reservedEvents: eventId }
                });
                
                const cancelledEvent = await blogModel.findById(eventId);
                return NextResponse.json({ 
                    success: true, 
                    msg: 'RSVP cancelled',
                    reserved: cancelledEvent.reservedUsers.length,
                    capacity: cancelledEvent.capacity
                });

            default:
                return NextResponse.json({ success: false, msg: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing guest action:', error);
        return NextResponse.json({ success: false, msg: 'Error processing request' }, { status: 500 });
    }
}