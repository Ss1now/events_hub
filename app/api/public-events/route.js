import { NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import BlogModel from "@/lib/models/blogmodel";

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

// GET - Retrieve pub and public events for pregame linking
export async function GET(request) {
    try {
        const now = new Date();
        
        // Find all upcoming pub/public events (no time limit)
        const events = await BlogModel.find({
            publicEventType: { $in: ['pub', 'public'] },
            startDateTime: { $gte: now } // Only events that haven't started yet
        })
        .select('title startDateTime endDateTime location publicEventType organizer')
        .sort({ startDateTime: 1 });
        
        return NextResponse.json({
            success: true,
            events: events.map(e => ({
                _id: e._id,
                title: e.title,
                startDateTime: e.startDateTime,
                endDateTime: e.endDateTime,
                location: e.location,
                publicEventType: e.publicEventType,
                organizer: e.organizer
            }))
        });
        
    } catch (error) {
        console.error('Error retrieving pub/public events:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Failed to retrieve events',
            error: error.message 
        }, { status: 500 });
    }
}
