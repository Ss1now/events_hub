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
export const revalidate = 0; // Never cache

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

// API Endpoint to get all blogs
export async function GET(request){

    const blogId = request.nextUrl.searchParams.get("id")
    if (blogId){
        // Use lean() to get a plain JavaScript object and avoid Mongoose document issues
        const blog = await Blogmodel.findById(blogId).populate('authorId', 'instagram name username').lean();
        
        if (!blog) {
            return NextResponse.json({ success: false, msg: 'Blog not found' }, { status: 404 });
        }
        
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
        
        // Return with aggressive cache control headers to prevent stale data
        return NextResponse.json(blog, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store'
            }
        });
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
        
        return NextResponse.json({blogs: updatedBlogs}, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store'
            }
        });
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

// API Endpoint for updating/editing post - REWRITTEN
export async function PUT(request) {
    console.log('\n=== EVENT UPDATE REQUEST STARTED ===');
    
    try {
        // 1. Authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Authentication required' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        console.log('[AUTH] User ID:', userId);

        // 2. Parse form data
        const formData = await request.formData();
        const eventId = formData.get('eventId');
        
        if (!eventId) {
            return NextResponse.json({ success: false, msg: 'Event ID required' }, { status: 400 });
        }
        console.log('[EVENTID] Event ID to update:', eventId);

        // 3. Connect to database and fetch event
        await connectDB();
        const existingEvent = await Blogmodel.findById(eventId);
        
        if (!existingEvent) {
            return NextResponse.json({ success: false, msg: 'Event not found' }, { status: 404 });
        }
        console.log('[EXISTING] Found event:', existingEvent.title);

        // 4. Authorization check
        const isAuthor = existingEvent.authorId.toString() === userId;
        const isCohost = existingEvent.cohosts && existingEvent.cohosts.some(c => c.userId.toString() === userId);
        
        if (!isAuthor && !isCohost) {
            return NextResponse.json({ success: false, msg: 'Unauthorized to edit this event' }, { status: 403 });
        }
        console.log('[AUTH] User authorized:', isAuthor ? 'Author' : 'Cohost');

        // 5. Check if event has ended
        const currentTime = new Date();
        const existingEndTime = new Date(existingEvent.endDateTime);
        
        if (currentTime > existingEndTime) {
            return NextResponse.json({ success: false, msg: 'Cannot edit events that have already ended' }, { status: 400 });
        }

        // 6. Handle image uploads
        let finalImageUrls = existingEvent.images || [];
        let imageWasUpdated = false;
        
        const uploadedImages = formData.getAll('images');
        if (uploadedImages && uploadedImages.length > 0 && uploadedImages[0].size > 0) {
            console.log('[IMAGES] Processing', uploadedImages.length, 'new images');
            const validImages = uploadedImages.filter(img => img && img.size > 0);
            
            if (validImages.length > 0) {
                try {
                    const newImageUrls = await uploadMultipleToCloudinary(validImages, 'events');
                    console.log('[IMAGES] Uploaded to Cloudinary:', newImageUrls.length, 'images');
                    
                    // Delete old images
                    if (existingEvent.images && existingEvent.images.length > 0) {
                        await deleteMultipleFromCloudinary(existingEvent.images);
                        console.log('[IMAGES] Deleted old images');
                    }
                    
                    finalImageUrls = newImageUrls;
                    imageWasUpdated = true;
                } catch (uploadError) {
                    console.error('[IMAGES] Upload failed:', uploadError);
                    return NextResponse.json({
                        success: false,
                        msg: 'Image upload failed'
                    }, { status: 500 });
                }
            }
        }

        // 7. Parse and validate datetime values
        const startDateTimeString = formData.get('startDateTime');
        const endDateTimeString = formData.get('endDateTime');
        
        console.log('[DATETIME] Received startDateTime string:', startDateTimeString);
        console.log('[DATETIME] Received endDateTime string:', endDateTimeString);
        
        const parsedStartDateTime = new Date(startDateTimeString);
        const parsedEndDateTime = new Date(endDateTimeString);
        
        if (isNaN(parsedStartDateTime.getTime()) || isNaN(parsedEndDateTime.getTime())) {
            return NextResponse.json({ success: false, msg: 'Invalid date/time values' }, { status: 400 });
        }
        
        console.log('[DATETIME] Parsed startDateTime object:', parsedStartDateTime.toISOString());
        console.log('[DATETIME] Parsed endDateTime object:', parsedEndDateTime.toISOString());
        console.log('[DATETIME] Existing startDateTime in DB:', existingEvent.startDateTime.toISOString());
        console.log('[DATETIME] Existing endDateTime in DB:', existingEvent.endDateTime.toISOString());
        console.log('[DATETIME] Are they different? Start:', existingEvent.startDateTime.getTime() !== parsedStartDateTime.getTime(), 'End:', existingEvent.endDateTime.getTime() !== parsedEndDateTime.getTime());

        // 8. Extract all form values
        const newTitle = formData.get('title');
        const newDescription = formData.get('description');
        const newEventType = formData.get('eventType');
        const newLocation = formData.get('location');
        const newHost = formData.get('host');
        const newTheme = formData.get('theme') || '';
        const newDressCode = formData.get('dressCode') || '';
        const newInstagram = formData.get('instagram') || '';
        const newNeedReservation = formData.get('needReservation') === 'true';
        const newCapacity = parseInt(formData.get('capacity')) || 0;
        const reservationDeadlineString = formData.get('reservationDeadline');
        const newReservationDeadline = reservationDeadlineString ? new Date(reservationDeadlineString) : null;

        // 9. Calculate new status
        let newStatus;
        if (currentTime < parsedStartDateTime) {
            newStatus = 'future';
        } else if (currentTime >= parsedStartDateTime && currentTime <= parsedEndDateTime) {
            newStatus = 'live';
        } else {
            newStatus = 'past';
        }
        console.log('[STATUS] Calculated status:', newStatus);

        // 10. Track changes for notifications
        const changesList = [];
        
        if (existingEvent.title !== newTitle) {
            changesList.push(`Title changed from "${existingEvent.title}" to "${newTitle}"`);
        }
        if (existingEvent.description !== newDescription) {
            changesList.push('Description updated');
        }
        if (existingEvent.startDateTime.getTime() !== parsedStartDateTime.getTime()) {
            changesList.push(`Start time changed to ${parsedStartDateTime.toLocaleString()}`);
        }
        if (existingEvent.endDateTime.getTime() !== parsedEndDateTime.getTime()) {
            changesList.push(`End time changed to ${parsedEndDateTime.toLocaleString()}`);
        }
        if (existingEvent.eventType !== newEventType) {
            changesList.push(`Event type changed to "${newEventType}"`);
        }
        if (existingEvent.location !== newLocation) {
            changesList.push(`Location changed to "${newLocation}"`);
        }
        if (existingEvent.needReservation !== newNeedReservation) {
            changesList.push(`RSVP ${newNeedReservation ? 'required' : 'not required'}`);
        }
        if (existingEvent.capacity !== newCapacity) {
            changesList.push(`Capacity changed to ${newCapacity}`);
        }
        if (existingEvent.host !== newHost) {
            changesList.push(`Host changed to "${newHost}"`);
        }
        if (imageWasUpdated) {
            changesList.push('Event images updated');
        }
        
        console.log('[CHANGES] Detected', changesList.length, 'changes:', changesList);

        // 11. Build complete update object
        const completeUpdateObject = {
            title: newTitle,
            description: newDescription,
            images: finalImageUrls,
            startDateTime: parsedStartDateTime,
            endDateTime: parsedEndDateTime,
            status: newStatus,
            eventType: newEventType,
            location: newLocation,
            host: newHost,
            theme: newTheme,
            dressCode: newDressCode,
            instagram: newInstagram,
            needReservation: newNeedReservation,
            capacity: newCapacity,
            reservationDeadline: newReservationDeadline,
            lastUpdated: new Date()
        };
        
        console.log('[UPDATE] Prepared update object with startDateTime:', completeUpdateObject.startDateTime.toISOString());
        console.log('[UPDATE] Prepared update object with endDateTime:', completeUpdateObject.endDateTime.toISOString());
        console.log('[UPDATE] Full update object keys:', Object.keys(completeUpdateObject));
        console.log('[UPDATE] endDateTime type:', typeof completeUpdateObject.endDateTime, completeUpdateObject.endDateTime instanceof Date);

        // 12. Perform database update using findByIdAndUpdate for better reliability
        const verifiedUpdatedEvent = await Blogmodel.findByIdAndUpdate(
            eventId,
            completeUpdateObject,
            { 
                new: true,  // Return the updated document
                runValidators: true  // Run schema validators
            }
        );
        
        if (!verifiedUpdatedEvent) {
            console.log('[DATABASE] Error: Event not found during update');
            return NextResponse.json({ 
                success: false, 
                msg: 'Failed to update event' 
            }, { status: 500 });
        }
        
        console.log('[DATABASE] Update successful');
        console.log('[VERIFY] After update - startDateTime in DB:', verifiedUpdatedEvent.startDateTime.toISOString());
        console.log('[VERIFY] After update - endDateTime in DB:', verifiedUpdatedEvent.endDateTime.toISOString());
        console.log('[VERIFY] After update - title in DB:', verifiedUpdatedEvent.title);

        // 13. Send notifications to interested/reserved users
        if (newStatus === 'future' || newStatus === 'live') {
            const interestedUserIds = existingEvent.interestedUsers.map(id => id.toString());
            const reservedUserIds = existingEvent.reservedUsers.map(id => id.toString());
            const allAffectedUserIds = [...new Set([...interestedUserIds, ...reservedUserIds])];
            
            console.log('[NOTIFICATIONS] Total affected users:', allAffectedUserIds.length);

            if (allAffectedUserIds.length > 0) {
                const changeSummary = changesList.length > 0 
                    ? changesList.join('; ') 
                    : 'Event details have been updated';
                
                console.log('[NOTIFICATIONS] Sending with summary:', changeSummary);
                
                // In-app notifications
                await userModel.updateMany(
                    { _id: { $in: allAffectedUserIds } },
                    {
                        $push: {
                            eventUpdateNotifications: {
                                eventId: eventId,
                                eventTitle: newTitle,
                                changes: changeSummary,
                                timestamp: new Date(),
                                read: false
                            }
                        }
                    }
                );
                console.log('[NOTIFICATIONS] In-app notifications sent to', allAffectedUserIds.length, 'users');
                
                // Email notifications (async, non-blocking)
                sendUpdateEmails(eventId, changeSummary)
                    .then(result => console.log('[EMAIL] Sent successfully:', result))
                    .catch(error => console.error('[EMAIL] Error:', error));
            }
        }

        // 14. Revalidate Next.js cache - be more aggressive
        try {
            revalidatePath('/', 'layout');
            revalidatePath('/me', 'page');
            revalidatePath(`/blogs/${eventId}`, 'page');
            console.log('[CACHE] Revalidated paths');
        } catch (e) {
            console.log('[CACHE] Revalidation error (non-critical):', e.message);
        }

        console.log('=== EVENT UPDATE COMPLETED SUCCESSFULLY ===\n');
        return NextResponse.json({ 
            success: true, 
            msg: 'Event Updated Successfully' 
        });

    } catch (error) {
        console.error('=== EVENT UPDATE ERROR ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return NextResponse.json({ 
            success: false, 
            msg: 'Error updating event: ' + error.message 
        }, { status: 500 });
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