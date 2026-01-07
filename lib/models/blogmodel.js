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
    eventDate:{
        month:{
            type:String,
            required:true
        },
        day:{
            type:Number,
            required:true
        }
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
    time:{
        type:String,
        required:true
    },
    host:{
        type:String,
        required:true
    },
    
})

const Blogmodel = mongoose.Model.blog || mongoose.model('blog', Schema);

export default Blogmodel;