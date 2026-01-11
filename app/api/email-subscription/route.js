import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/config/db';
import userModel from '@/lib/models/usermodel';
import jwt from 'jsonwebtoken';

// GET - Fetch user's email subscription preferences
export async function GET(request) {
    try {
        await connectDB();
        
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('emailSubscriptions');

        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            subscriptions: user.emailSubscriptions || {
                recommendations: false,
                reminders: false,
                updates: false,
                patchNotes: false,
                frequency: 'weekly'
            }
        });

    } catch (error) {
        console.error('Error fetching email subscriptions:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Server error' 
        }, { status: 500 });
    }
}

// POST - Update user's email subscription preferences
export async function POST(request) {
    try {
        await connectDB();
        
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { recommendations, reminders, updates, patchNotes, frequency } = await request.json();

        const user = await userModel.findByIdAndUpdate(
            decoded.id,
            {
                $set: {
                    emailSubscriptions: {
                        recommendations: !!recommendations,
                        reminders: !!reminders,
                        updates: !!updates,
                        patchNotes: !!patchNotes,
                        frequency: frequency || 'weekly'
                    }
                }
            },
            { new: true, strict: false }
        );

        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            msg: 'Email preferences updated successfully',
            subscriptions: user.emailSubscriptions
        });

    } catch (error) {
        console.error('Error updating email subscriptions:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Server error' 
        }, { status: 500 });
    }
}
