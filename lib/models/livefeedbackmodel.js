import mongoose from "mongoose";

const LiveFeedbackSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    // Anonymous identifier for privacy
    anonId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    // Vibe rating (1-100)
    vibe: {
        type: Number,
        required: false,
        min: 1,
        max: 100
    },
    // Crowd level enum
    crowd: {
        type: String,
        enum: ['DEAD', 'CHILL', 'PACKED', 'TOO_PACKED'],
        required: false
    },
    // Line wait time in minutes
    lineMinutes: {
        type: Number,
        required: false,
        min: 0
    },
    // Whether user is inside (for line reporting)
    isInside: {
        type: Boolean,
        default: false
    },
    // Optional comment
    comment: {
        type: String,
        required: false,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Index for efficient queries
LiveFeedbackSchema.index({ eventId: 1, timestamp: -1 });
LiveFeedbackSchema.index({ eventId: 1, userId: 1 });

const LiveFeedbackModel = mongoose.models.livefeedback || mongoose.model('livefeedback', LiveFeedbackSchema);

export default LiveFeedbackModel;
