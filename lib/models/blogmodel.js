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
    image:{
        type:String,
        required:false
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
    
})

const Blogmodel = mongoose.models.blog || mongoose.model('blog', Schema);

export default Blogmodel;