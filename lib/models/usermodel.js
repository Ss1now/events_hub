import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{type:String,required:false,default:''},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    username:{type:String,required:false,unique:true,sparse:true},
    residentialCollege:{type:String,required:false},
    isAdmin:{type:Boolean,required:false,default:false},
    interestedEvents:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blog'
        }],
        default:[]
    },
    reservedEvents:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blog'
        }],
        default:[]
    },
    ratedEvents:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blog'
        }],
        default:[]
    },
    pendingNotifications:{
        type:[{
            eventId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'blog'
            },
            notificationId: mongoose.Schema.Types.ObjectId,
            timestamp: Date
        }],
        default:[]
    },
    eventUpdateNotifications:{
        type:[{
            eventId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'blog'
            },
            eventTitle: String,
            changes: String,
            timestamp: {
                type: Date,
                default: Date.now
            },
            read: {
                type: Boolean,
                default: false
            }
        }],
        default:[]
    },
    cohostInvitations:{
        type:[{
            eventId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'blog'
            },
            invitedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            },
            invitedByName: String,
            eventTitle: String,
            timestamp: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'declined'],
                default: 'pending'
            }
        }],
        default:[]
    },
    resetPasswordToken:{type:String,required:false},
    resetPasswordExpires:{type:Date,required:false},
    emailSubscriptions:{
        recommendations: {type:Boolean,default:false},
        updates: {type:Boolean,default:false},
        patchNotes: {type:Boolean,default:false},
        frequency: {
            type:String,
            enum:['daily','weekly'],
            default:'weekly'
        }
    },
})

const userModel = mongoose.models.user || mongoose.model("user",userSchema);

export default userModel;