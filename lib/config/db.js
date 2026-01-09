import mongoose from "mongoose";

export const connectDB = async () => {
    const mongodbUri = process.env.MONGODB_URI;
    
    if (!mongodbUri) {
        throw new Error('MONGODB_URI environment variable is not defined. Please check your .env.local file.');
    }
    
    if (mongoose.connection.readyState >= 1) {
        console.log("DB already connected");
        return;
    }
    
    try {
        await mongoose.connect(mongodbUri);
        console.log("DB Connected");
    } catch (error) {
        console.error("DB Connection Error:", error);
        throw error;
    }
}