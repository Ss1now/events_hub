import { NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import BlogModel from "@/lib/models/blogmodel";

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

// GET - Retrieve current/upcoming pub and public events for pregame linking
export async function GET(request) {
    try {
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        
        // Find pub/public events that are upcoming or live
        const events = await BlogModel.find({
            publicEventType: { $in: ['pub', 'public'] },
            status: { $in: ['future', 'live'] },
            startDateTime: { $lte: twoDaysFromNow } // Only show events within next 2 days
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
