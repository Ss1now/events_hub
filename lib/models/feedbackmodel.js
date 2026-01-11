import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    feedback: {
        type: String,
        required: true,
        maxlength: 1000
    },
    email: {
        type: String,
        default: 'Anonymous'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    userName: {
        type: String,
        default: 'Anonymous'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['new', 'read', 'resolved'],
        default: 'new'
    }
});

const FeedbackModel = mongoose.models.feedback || mongoose.model('feedback', FeedbackSchema);

export default FeedbackModel;
