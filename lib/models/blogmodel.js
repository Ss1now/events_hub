import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    images:{
        type:[String],
        default:[]
    },
    date:{
        type:Date,
        required:true,
        default: Date.now
    },
    startDateTime:{
        type:Date,
        required:true
    },
    endDateTime:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        enum:['live', 'future', 'past'],
        required:true,
        default:'future'
    },
    eventType:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    needReservation:{
        type:Boolean,
        required:true,
        default:false
    },
    capacity:{
        type:Number,
        required:false
    },
    reservationDeadline:{
        type:Date,
        required:false
    },
    interestedUsers:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
        default:[]
    },
    reservedUsers:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
        default:[]
    },
    host:{
        type:String,
        required:true
    },
    authorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false // Allow null for anonymous event creators
    },
    eventCategory:{
        type:String,
        enum:['user', 'residential_college', 'university'],
        default:'user'
    },
    organizer:{
        type:String,
        required:false
    },
    eventPageType:{
        type:String,
        enum:['party', 'club_event'],
        default:'party'
    },
    cohosts:{
        type:[{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            },
            name: String,
            username: String
        }],
        default:[]
    },
    lastUpdated:{
        type: Date,
        default: Date.now
    },
    updateNotifications:[{
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        notifiedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }]
    }],
    ratings:[{
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        userName:{
            type: String,
            required: true
        },
        rating:{
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment:{
            type: String,
            default: ''
        },
        images:{
            type: [String],
            default: []
        },
        date:{
            type: Date,
            default: Date.now
        }
    }],
    averageRating:{
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings:{
        type: Number,
        default: 0
    },
    liveRatings:[{
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        rating:{
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        timestamp:{
            type: Date,
            default: Date.now
        }
    }],
    averageLiveRating:{
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalLiveRatings:{
        type: Number,
        default: 0
    },
    // Anonymous user data
    anonymousInterestedCount:{
        type: Number,
        default: 0
    },
    anonymousReservedCount:{
        type: Number,
        default: 0
    },
    anonymousLiveRatings:[{
        rating:{
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        timestamp:{
            type: Date,
            default: Date.now
        }
    }],
    isRecurring:{
        type: Boolean,
        default: false
    },
    recurrencePattern:{
        type: String,
        enum: ['weekly', 'monthly', 'none'],
        default: 'none'
    },
    weeklyTheme:{
        type: String,
        default: ''
    },
    themeAnnouncementDate:{
        type: Date,
        required: false
    },
    isCollegeOnly:{
        type: Boolean,
        default: false
    },
    targetCollege:{
        type: String,
        required: false
    },
    instagram:{
        type: String,
        required: false
    },
    // Pub/Public event tags
    publicEventType:{
        type: String,
        enum: ['none', 'pub', 'public'],
        default: 'none'
    },
    // Capacity profile for crowd normalization
    capacityProfile:{
        deadMax: {
            type: Number,
            required: false
        },
        chillMax: {
            type: Number,
            required: false
        },
        packedMax: {
            type: Number,
            required: false
        },
        peakMax: {
            type: Number,
            required: false
        }
    },
    // Pregame linking - reference to the public/pub event this pregame is for
    pregameFor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog',
        required: false
    },
    // Peak notification tracking for pub/public events
    peakNotificationSent:{
        type: Boolean,
        default: false
    },
    peakNotificationTime:{
        type: Date,
        required: false
    },
    // What's the Move Now comments (for pub/public events after they end)
    moveNowComments:{
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: false // Can be null for anonymous comments
            },
            username: {
                type: String,
                required: true // Either actual username or "Anonymous"
            },
            comment: {
                type: String,
                required: true
            },
            isAnonymous: {
                type: Boolean,
                default: false
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    moveNowExpiresAt:{
        type: Date,
        required: false // Set to endDateTime + 5 hours when event ends
    },
    // Event ended notification tracking
    endNotificationSent:{
        type: Boolean,
        default: false
    },
    endNotificationTime:{
        type: Date,
        required: false
    }
    
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

// Virtual field to calculate reserved count from reservedUsers array
Schema.virtual('reserved').get(function() {
    return this.reservedUsers ? this.reservedUsers.length : 0;
});

const Blogmodel = mongoose.models.blog || mongoose.model('blog', Schema);

export default Blogmodel;