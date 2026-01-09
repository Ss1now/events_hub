import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{type:String,required:false,default:''},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    residentialCollege:{type:String,required:false},
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
})

const userModel = mongoose.models.user || mongoose.model("user",userSchema);

export default userModel;