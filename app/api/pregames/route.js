import { NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import BlogModel from "@/lib/models/blogmodel";

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

// GET - Retrieve pregames for a specific public/pub event
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        
        if (!eventId) {
            return NextResponse.json({ 
                success: false, 
                msg: 'Event ID required' 
            }, { status: 400 });
        }
        
        // Find all pregames linked to this event
        const pregames = await BlogModel.find({
            pregameFor: eventId,
            status: { $in: ['future', 'live'] } // Only show upcoming or live pregames
        })
        .populate('authorId', 'name username isOrganization')
        .sort({ startDateTime: 1 });
        
        return NextResponse.json({
            success: true,
            pregames: pregames.map(p => ({
                _id: p._id,
                title: p.title,
                description: p.description,
                images: p.images,
                startDateTime: p.startDateTime,
                endDateTime: p.endDateTime,
                location: p.location,
                host: p.host,
                eventType: p.eventType,
                status: p.status,
                interestedUsers: p.interestedUsers,
                authorId: p.authorId
            }))
        });
        
    } catch (error) {
        console.error('Error retrieving pregames:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Failed to retrieve pregames',
            error: error.message 
        }, { status: 500 });
    }
}
