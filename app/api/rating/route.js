import { connectDB } from "@/lib/config/db";
import { NextResponse } from "next/server";
import Blogmodel from "@/lib/models/blogmodel";
import userModel from "@/lib/models/usermodel";
import jwt from 'jsonwebtoken';
import {writeFile, mkdir} from 'fs/promises';

// POST - Submit a rating/review
export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Authentication required' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        await connectDB();

        const user = await userModel.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        const formData = await request.formData();
        const eventId = formData.get('eventId');
        const rating = parseInt(formData.get('rating'));
        const comment = formData.get('comment') || '';
        const images = formData.getAll('images');

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ success: false, msg: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        const event = await Blogmodel.findById(eventId);
        if (!event) {
            return NextResponse.json({ success: false, msg: 'Event not found' }, { status: 404 });
        }

        // Check if event has ended
        if (event.status !== 'past') {
            return NextResponse.json({ success: false, msg: 'Can only rate past events' }, { status: 400 });
        }

        // Check if user is the event host - hosts cannot rate their own events
        if (event.authorId.toString() === userId) {
            return NextResponse.json({ success: false, msg: 'Event hosts cannot rate their own events' }, { status: 400 });
        }

        // Check rating eligibility based on RSVP requirement
        if (event.needReservation) {
            // For events that need RSVP, only RSVP'd users can rate
            const isReserved = event.reservedUsers && event.reservedUsers.some(id => id.toString() === userId);
            if (!isReserved) {
                return NextResponse.json({ 
                    success: false, 
                    msg: 'Only users who reserved this event can rate it' 
                }, { status: 403 });
            }
        }
        // For events without RSVP requirement, anyone can rate (no additional check needed)

        // Check if user already rated this event
        const existingRating = event.ratings.find(r => r.userId.toString() === userId);
        if (existingRating) {
            return NextResponse.json({ success: false, msg: 'You have already rated this event' }, { status: 400 });
        }

        // Process images
        const imageUrls = [];
        if (images && images.length > 0) {
            const timestamp = Date.now();
            const dir = './public/images/reviews';
            await mkdir(dir, { recursive: true });

            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                if (image && image.size > 0) {
                    const imageByteData = await image.arrayBuffer();
                    const buffer = Buffer.from(imageByteData);
                    const filePath = `${dir}/${timestamp}_${i}_${image.name}`;
                    await writeFile(filePath, buffer);
                    imageUrls.push(`/images/reviews/${timestamp}_${i}_${image.name}`);
                }
            }
        }

        // Add rating to event
        event.ratings.push({
            userId,
            userName: user.name || user.email.split('@')[0],
            rating,
            comment,
            images: imageUrls,
            date: new Date()
        });

        // Update average rating and total ratings
        event.totalRatings = event.ratings.length;
        const sum = event.ratings.reduce((acc, r) => acc + r.rating, 0);
        event.averageRating = sum / event.totalRatings;

        await event.save();

        // Add to user's rated events
        if (!user.ratedEvents.includes(eventId)) {
            user.ratedEvents.push(eventId);
            await user.save();
        }

        return NextResponse.json({ 
            success: true, 
            msg: 'Rating submitted successfully',
            averageRating: event.averageRating,
            totalRatings: event.totalRatings
        });
    } catch (error) {
        console.error('Error submitting rating:', error);
        return NextResponse.json({ success: false, msg: 'Error submitting rating' }, { status: 500 });
    }
}

// GET - Get ratings for an event
export async function GET(request) {
    try {
        const eventId = request.nextUrl.searchParams.get('eventId');
        
        if (!eventId) {
            return NextResponse.json({ success: false, msg: 'Event ID required' }, { status: 400 });
        }

        await connectDB();

        const event = await Blogmodel.findById(eventId);
        if (!event) {
            return NextResponse.json({ success: false, msg: 'Event not found' }, { status: 404 });
        }

        // Sort ratings by date (newest first)
        const sortedRatings = event.ratings.sort((a, b) => new Date(b.date) - new Date(a.date));

        return NextResponse.json({ 
            success: true, 
            ratings: sortedRatings,
            averageRating: event.averageRating,
            totalRatings: event.totalRatings
        });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        return NextResponse.json({ success: false, msg: 'Error fetching ratings' }, { status: 500 });
    }
}

