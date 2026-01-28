import { NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import BlogModel from "@/lib/models/blogmodel";
import jwt from "jsonwebtoken";
import { getUserFromToken } from "@/lib/utils/adminAuth";

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

// POST - Assign pub/public tag to an event (no email notifications)
export async function POST(request) {
    try {
        // Verify admin authentication
        const user = await getUserFromToken(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({
                success: false,
                msg: "Admin privileges required"
            }, { status: 403 });
        }

        const { eventId, publicEventType, capacityProfile } = await request.json();

        if (!eventId) {
            return NextResponse.json({
                success: false,
                msg: "Event ID is required"
            }, { status: 400 });
        }

        if (!['none', 'pub', 'public'].includes(publicEventType)) {
            return NextResponse.json({
                success: false,
                msg: "Invalid publicEventType. Must be 'none', 'pub', or 'public'"
            }, { status: 400 });
        }

        // Validate capacity profile if pub/public
        if (publicEventType !== 'none') {
            if (!capacityProfile || 
                capacityProfile.deadMax === undefined || 
                capacityProfile.chillMax === undefined || 
                capacityProfile.packedMax === undefined || 
                capacityProfile.peakMax === undefined) {
                return NextResponse.json({
                    success: false,
                    msg: "Capacity profile is required for pub/public events"
                }, { status: 400 });
            }
        }

        // Update event with tag assignment
        const updateData = {
            publicEventType,
            capacityProfile: publicEventType !== 'none' ? capacityProfile : null
        };

        const event = await BlogModel.findByIdAndUpdate(
            eventId,
            updateData,
            { new: true }
        );

        if (!event) {
            return NextResponse.json({
                success: false,
                msg: "Event not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            msg: `Event tag assigned successfully (${publicEventType})`,
            event
        });

    } catch (error) {
        console.error('Error assigning tag:', error);
        return NextResponse.json({
            success: false,
            msg: "Internal server error"
        }, { status: 500 });
    }
}
