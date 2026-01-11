import { connectDB } from "@/lib/config/db";
import FeedbackModel from "@/lib/models/feedbackmodel";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import UserModel from "@/lib/models/usermodel";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST - Submit feedback
export async function POST(request) {
    try {
        await connectDB();
        
        const { feedback, email } = await request.json();

        if (!feedback || !feedback.trim()) {
            return NextResponse.json({
                success: false,
                msg: 'Feedback is required'
            }, { status: 400 });
        }

        // Try to get user info from token (optional)
        let userId = null;
        let userName = 'Anonymous';
        
        try {
            const token = request.headers.get('authorization')?.split(' ')[1];
            if (token) {
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
                
                const user = await UserModel.findById(userId);
                if (user) {
                    userName = user.name || user.email.split('@')[0];
                }
            }
        } catch (error) {
            // Token is optional, continue without user info
        }

        const newFeedback = new FeedbackModel({
            feedback: feedback.trim(),
            email: email && email.trim() ? email.trim() : 'Anonymous',
            userId,
            userName
        });

        await newFeedback.save();

        return NextResponse.json({
            success: true,
            msg: 'Thank you for your feedback!'
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        return NextResponse.json({
            success: false,
            msg: 'Failed to submit feedback'
        }, { status: 500 });
    }
}

// GET - Fetch all feedback (Admin only)
export async function GET(request) {
    try {
        await connectDB();

        // Verify admin token
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({
                success: false,
                msg: 'Authentication required'
            }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user || !user.isAdmin) {
            return NextResponse.json({
                success: false,
                msg: 'Admin access required'
            }, { status: 403 });
        }

        // Fetch all feedback, sorted by newest first
        const feedbacks = await FeedbackModel.find({})
            .sort({ createdAt: -1 });

        // Get counts
        const totalCount = feedbacks.length;
        const newCount = feedbacks.filter(f => f.status === 'new').length;
        const readCount = feedbacks.filter(f => f.status === 'read').length;
        const resolvedCount = feedbacks.filter(f => f.status === 'resolved').length;

        return NextResponse.json({
            success: true,
            feedbacks,
            stats: {
                total: totalCount,
                new: newCount,
                read: readCount,
                resolved: resolvedCount
            }
        });

    } catch (error) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({
            success: false,
            msg: 'Failed to fetch feedback'
        }, { status: 500 });
    }
}

// PATCH - Update feedback status (Admin only)
export async function PATCH(request) {
    try {
        await connectDB();

        // Verify admin token
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({
                success: false,
                msg: 'Authentication required'
            }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user || !user.isAdmin) {
            return NextResponse.json({
                success: false,
                msg: 'Admin access required'
            }, { status: 403 });
        }

        const { feedbackId, status } = await request.json();

        if (!['new', 'read', 'resolved'].includes(status)) {
            return NextResponse.json({
                success: false,
                msg: 'Invalid status'
            }, { status: 400 });
        }

        const feedback = await FeedbackModel.findByIdAndUpdate(
            feedbackId,
            { status },
            { new: true }
        );

        if (!feedback) {
            return NextResponse.json({
                success: false,
                msg: 'Feedback not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            msg: 'Status updated',
            feedback
        });

    } catch (error) {
        console.error('Error updating feedback:', error);
        return NextResponse.json({
            success: false,
            msg: 'Failed to update feedback'
        }, { status: 500 });
    }
}

// DELETE - Delete feedback (Admin only)
export async function DELETE(request) {
    try {
        await connectDB();

        // Verify admin token
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({
                success: false,
                msg: 'Authentication required'
            }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user || !user.isAdmin) {
            return NextResponse.json({
                success: false,
                msg: 'Admin access required'
            }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const feedbackId = searchParams.get('id');

        if (!feedbackId) {
            return NextResponse.json({
                success: false,
                msg: 'Feedback ID required'
            }, { status: 400 });
        }

        const feedback = await FeedbackModel.findByIdAndDelete(feedbackId);

        if (!feedback) {
            return NextResponse.json({
                success: false,
                msg: 'Feedback not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            msg: 'Feedback deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting feedback:', error);
        return NextResponse.json({
            success: false,
            msg: 'Failed to delete feedback'
        }, { status: 500 });
    }
}
