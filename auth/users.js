import userModel from '@/lib/models/usermodel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { connectDB } from '@/lib/config/db';

//login user

const loginUser = async (email, password) => {
    try {
        await connectDB();
        const user = await userModel.findOne({email});
        if (!user) {
            return {success:false, msg:"User does not exist"};
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if (!isMatch) {
            return {success:false, msg:"Invalid credentials"};
        }

        const token = createToken(user._id);
        return {success:true,token}

    } catch (error) {
        console.log(error);
        return {success:false,msg:"Error occurred during login"};
    }
}

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
}

//register user
const registerUser = async (name = '', email, password, residentialCollege = '', emailConsent = false) => {
    try {
        await connectDB();
        //checking if user already exists
        const exists = await userModel.findOne({email});
        if (exists) {
            return {success:false, msg:"User already exists"};
        }
        // validating email format  & strong password
        if (!validator.isEmail(email)) {
            return {success:false, msg:"Invalid email format"};
        }

        // Generate username from email
        const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        let username = baseUsername;
        let counter = 1;
        
        // Ensure username is unique
        while (await userModel.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        // hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        // creating user
        const newUser = new userModel({
            name: name || '',
            email:email,
            password:hashedPassword,
            username:username,
            residentialCollege:residentialCollege,
            emailSubscriptions: {
                updates: emailConsent,
                patchNotes: emailConsent
            }
        });

        const user = await newUser.save()
        const token = createToken(user._id)
        return {success:true,token}


    } catch (error) {
        console.log(error);
        return {success:false,msg:"Error occurred during registration"};
    }
}

export {loginUser,registerUser};
