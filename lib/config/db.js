import mongoose from "mongoose";

export const connectDB = async () => {
    const mongodbUri = process.env.MONGODB_URI || 'mongodb+srv://test01:VLTRON3QeQwa7Iwg@cluster0.oju86lo.mongodb.net/rice-events';
    
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