import { NextResponse } from "next/server";
import Blogmodel from "@/lib/models/blogmodel";
import { connectDB } from "@/lib/config/db";
import jwt from 'jsonwebtoken';

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

export async function POST(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        let userId = null;
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (error) {
                console.log('[Live Rating] Invalid token, treating as anonymous');
            }
        }

        const formData = await request.formData();
        const eventId = formData.get('eventId');
        const rating = parseInt(formData.get('rating'));

        if (!eventId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ success: false, msg: "Invalid input" }, { status: 400 });
        }

        const event = await Blogmodel.findById(eventId);
        
        if (!event) {
            return NextResponse.json({ success: false, msg: "Event not found" }, { status: 404 });
        }

        // Check if event is live
        const now = new Date();
        const startTime = new Date(event.startDateTime);
        const endTime = new Date(event.endDateTime);

        if (now < startTime || now > endTime) {
            return NextResponse.json({ success: false, msg: "Live ratings are only available during the event" }, { status: 400 });
        }

        // Check RSVP requirement (only for logged-in users)
        if (userId && event.needReservation) {
            const hasReservation = event.reservedUsers.some(id => id.toString() === userId);
            if (!hasReservation) {
                return NextResponse.json({ success: false, msg: "Only users with RSVPs can rate this event" }, { status: 403 });
            }
        }

        // For anonymous users, just increment the anonymous rating
        if (!userId) {
            // Add anonymous rating
            if (!event.anonymousLiveRatings) {
                event.anonymousLiveRatings = [];
            }
            event.anonymousLiveRatings.push({
                rating,
                timestamp: new Date()
            });

            // Calculate new average including both logged-in and anonymous ratings
            const totalLoggedInRatings = event.liveRatings?.length || 0;
            const totalAnonymousRatings = event.anonymousLiveRatings?.length || 0;
            const totalRatings = totalLoggedInRatings + totalAnonymousRatings;

            const sumLoggedInRatings = (event.liveRatings || []).reduce((sum, r) => sum + r.rating, 0);
            const sumAnonymousRatings = (event.anonymousLiveRatings || []).reduce((sum, r) => sum + r.rating, 0);
            const sumRatings = sumLoggedInRatings + sumAnonymousRatings;

            event.averageLiveRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
            event.totalLiveRatings = totalRatings;

            await event.save();

            return NextResponse.json({
                success: true,
                msg: "Live rating submitted",
                averageLiveRating: event.averageLiveRating,
                totalLiveRatings: event.totalLiveRatings
            });
        }

        // For logged-in users, check if user already rated live
        const existingRatingIndex = event.liveRatings.findIndex(r => r.userId.toString() === userId);

        if (existingRatingIndex !== -1) {
            // Update existing rating
            event.liveRatings[existingRatingIndex].rating = rating;
            event.liveRatings[existingRatingIndex].timestamp = new Date();
        } else {
            // Add new rating
            event.liveRatings.push({
                userId,
                rating,
                timestamp: new Date()
            });
        }

        // Calculate new average including both logged-in and anonymous ratings
        const totalLoggedInRatings = event.liveRatings?.length || 0;
        const totalAnonymousRatings = event.anonymousLiveRatings?.length || 0;
        const totalRatings = totalLoggedInRatings + totalAnonymousRatings;

        const sumLoggedInRatings = (event.liveRatings || []).reduce((sum, r) => sum + r.rating, 0);
        const sumAnonymousRatings = (event.anonymousLiveRatings || []).reduce((sum, r) => sum + r.rating, 0);
        const sumRatings = sumLoggedInRatings + sumAnonymousRatings;

        event.averageLiveRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
        event.totalLiveRatings = totalRatings;

        await event.save();

        return NextResponse.json({
            success: true,
            msg: existingRatingIndex !== -1 ? "Live rating updated" : "Live rating submitted",
            averageLiveRating: event.averageLiveRating,
            totalLiveRatings: event.totalLiveRatings
        });

    } catch (error) {
        console.error('Error submitting live rating:', error);
        return NextResponse.json({ success: false, msg: "Error submitting live rating" }, { status: 500 });
    }
}

// GET endpoint to check if user has already rated an event live
export async function GET(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json({ success: false, msg: "Event ID required" }, { status: 400 });
        }

        const event = await Blogmodel.findById(eventId);
        
        if (!event) {
            return NextResponse.json({ success: false, msg: "Event not found" }, { status: 404 });
        }

        const userRating = event.liveRatings.find(r => r.userId.toString() === userId);

        return NextResponse.json({
            success: true,
            hasRated: !!userRating,
            userRating: userRating?.rating || 0,
            averageLiveRating: event.averageLiveRating,
            totalLiveRatings: event.totalLiveRatings
        });

    } catch (error) {
        console.error('Error fetching live rating:', error);
        return NextResponse.json({ success: false, msg: "Error fetching live rating" }, { status: 500 });
    }
}
