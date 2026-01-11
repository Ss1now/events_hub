import mongoose from 'mongoose';

const emailQueueSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    emailType: {
        type: String,
        enum: ['recommendation', 'reminder', 'update'],
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog',
        required: false // Only for reminders and updates
    },
    eventData: {
        type: Object,
        required: false // Stores event details for recommendations
    },
    scheduledFor: {
        type: Date,
        required: true,
        index: true
    },
    sent: {
        type: Boolean,
        default: false,
        index: true
    },
    sentAt: {
        type: Date,
        required: false
    },
    error: {
        type: String,
        required: false
    },
    metadata: {
        type: Object,
        required: false // Additional data like changes for updates
    }
}, {
    timestamps: true
});

// Index for efficient querying
emailQueueSchema.index({ sent: 1, scheduledFor: 1 });
emailQueueSchema.index({ userId: 1, emailType: 1 });

const emailQueueModel = mongoose.models.emailQueue || mongoose.model("emailQueue", emailQueueSchema);

export default emailQueueModel;
