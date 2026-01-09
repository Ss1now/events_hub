import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{type:String,required:false,default:''},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    residentialCollege:{type:String,required:false},
    
})

const userModel = mongoose.models.user || mongoose.model("user",userSchema);

export default userModel;