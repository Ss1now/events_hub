import { NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import LiveFeedbackModel from "@/lib/models/livefeedbackmodel";
import BlogModel from "@/lib/models/blogmodel";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { computeTimeline, computeLineEstimate } from "@/lib/utils/liveMetrics";

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

// Generate anonymous ID from userId and event ID
function generateAnonId(userId, eventId) {
    const salt = process.env.ANON_SALT || 'default_salt_change_this';
    const hash = crypto.createHash('sha256');
    hash.update(`${userId}-${eventId}-${salt}`);
    return hash.digest('hex').substring(0, 16);
}

// POST - Submit live feedback
export async function POST(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return NextResponse.json({ 
                success: false, 
                msg: 'Authentication required' 
            }, { status: 401 });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        const formData = await request.formData();
        const eventId = formData.get('eventId');
        const vibe = formData.get('vibe') ? parseInt(formData.get('vibe')) : null;
        const crowd = formData.get('crowd') || null;
        const lineMinutes = formData.get('lineMinutes') ? parseInt(formData.get('lineMinutes')) : null;
        const isInside = formData.get('isInside') === 'true';
        const comment = formData.get('comment') || '';
        
        // Validate event exists and is live
        const event = await BlogModel.findById(eventId);
        if (!event) {
            return NextResponse.json({ 
                success: false, 
                msg: 'Event not found' 
            }, { status: 404 });
        }
        
        if (event.status !== 'live') {
            return NextResponse.json({ 
                success: false, 
                msg: 'Event is not currently live' 
            }, { status: 400 });
        }
        
        // Check if event is pub or public
        if (event.publicEventType === 'none') {
            return NextResponse.json({ 
                success: false, 
                msg: 'This event does not support live feedback' 
            }, { status: 400 });
        }
        
        // Generate anonymous ID
        const anonId = generateAnonId(userId, eventId);
        
        // Create feedback entry
        const feedback = new LiveFeedbackModel({
            eventId,
            userId,
            anonId,
            vibe,
            crowd,
            lineMinutes,
            isInside,
            comment
        });
        
        await feedback.save();
        
        return NextResponse.json({
            success: true,
            msg: 'Feedback submitted successfully',
            feedback: {
                anonId: feedback.anonId,
                timestamp: feedback.timestamp,
                vibe: feedback.vibe,
                crowd: feedback.crowd,
                comment: feedback.comment
            }
        });
        
    } catch (error) {
        console.error('Error submitting live feedback:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Failed to submit feedback',
            error: error.message 
        }, { status: 500 });
    }
}

// GET - Retrieve live metrics and feedback
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const action = searchParams.get('action');
        
        console.log(`[GET /api/live-feedback] eventId: ${eventId}, action: ${action}`);
        
        if (!eventId) {
            return NextResponse.json({ 
                success: false, 
                msg: 'Event ID required' 
            }, { status: 400 });
        }
        
        // Get event
        const event = await BlogModel.findById(eventId);
        if (!event) {
            return NextResponse.json({ 
                success: false, 
                msg: 'Event not found' 
            }, { status: 404 });
        }
        
        if (action === 'metrics') {
            // Get computed metrics
            const now = new Date();
            const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
            
            const feedback = await LiveFeedbackModel.find({
                eventId,
                timestamp: { $gte: thirtyMinAgo }
            }).sort({ timestamp: -1 });
            
            // Compute timeline
            const timeline = computeTimeline(
                feedback,
                event.capacityProfile,
                event.endDateTime
            );
            
            // Compute line estimate
            const lineEstimate = computeLineEstimate(
                feedback,
                event.publicEventType
            );
            
            return NextResponse.json({
                success: true,
                metrics: {
                    timeline,
                    lineEstimate,
                    eventType: event.publicEventType
                }
            });
            
        } else if (action === 'comments') {
            // Get recent comments (last 2 hours for live, all for past)
            const timeFilter = event.status === 'live' 
                ? { timestamp: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } }
                : {};
            
            const comments = await LiveFeedbackModel.find({
                eventId,
                comment: { $exists: true, $ne: '' },
                ...timeFilter
            })
            .populate('userId', 'name username')
            .sort({ timestamp: -1 })
            .limit(50)
            .select('anonId comment timestamp vibe userId');
            
            return NextResponse.json({
                success: true,
                comments: comments.map(c => ({
                    anonId: c.anonId,
                    comment: c.comment,
                    timestamp: c.timestamp,
                    vibe: c.vibe,
                    username: c.userId?.username || c.userId?.name || null
                }))
            });
            
        } else {
            // Get all recent feedback
            const feedback = await LiveFeedbackModel.find({
                eventId,
                timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
            })
            .sort({ timestamp: -1 })
            .select('anonId vibe crowd lineMinutes comment timestamp');
            
            return NextResponse.json({
                success: true,
                feedback
            });
        }
        
    } catch (error) {
        console.error('Error retrieving live feedback:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Failed to retrieve feedback',
            error: error.message 
        }, { status: 500 });
    }
}

// DELETE - Remove own feedback (within 10 minutes)
export async function DELETE(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return NextResponse.json({ 
                success: false, 
                msg: 'Authentication required' 
            }, { status: 401 });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        const { searchParams } = new URL(request.url);
        const feedbackId = searchParams.get('feedbackId');
        
        const feedback = await LiveFeedbackModel.findById(feedbackId);
        
        if (!feedback) {
            return NextResponse.json({ 
                success: false, 
                msg: 'Feedback not found' 
            }, { status: 404 });
        }
        
        // Check ownership
        if (feedback.userId.toString() !== userId) {
            return NextResponse.json({ 
                success: false, 
                msg: 'Unauthorized' 
            }, { status: 403 });
        }
        
        // Check if within 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (new Date(feedback.timestamp) < tenMinutesAgo) {
            return NextResponse.json({ 
                success: false, 
                msg: 'Can only delete feedback within 10 minutes' 
            }, { status: 400 });
        }
        
        await LiveFeedbackModel.findByIdAndDelete(feedbackId);
        
        return NextResponse.json({
            success: true,
            msg: 'Feedback deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting feedback:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'Failed to delete feedback',
            error: error.message 
        }, { status: 500 });
    }
}
