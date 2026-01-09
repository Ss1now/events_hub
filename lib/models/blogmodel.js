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
    theme:{
        type:String,
        required:true
    },
    dressCode:{
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
    reserved:{
        type:Number,
        required:false,
        default:0
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
        required: true
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
    }
    
})

const Blogmodel = mongoose.models.blog || mongoose.model('blog', Schema);

export default Blogmodel;