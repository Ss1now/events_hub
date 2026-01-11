import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/config/db';
import userModel from '@/lib/models/usermodel';
import jwt from 'jsonwebtoken';

// GET - Fetch all users who subscribed to patch notes (Admin only)
export async function GET(request) {
    try {
        await connectDB();
        
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await userModel.findById(decoded.id).select('isAdmin');

        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ success: false, msg: 'Admin access required' }, { status: 403 });
        }

        // Find all users who subscribed to patch notes
        const subscribers = await userModel
            .find({ 'emailSubscriptions.patchNotes': true })
            .select('name email username createdAt')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            subscribers,
            count: subscribers.length
        });

    } catch (error) {
        console.error('Error fetching patch notes subscribers:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Server error' 
        }, { status: 500 });
    }
}
