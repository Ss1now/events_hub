import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://test01:VLTRON3QeQwa7Iwg@cluster0.oju86lo.mongodb.net/rice-events')
    console.log("DB Connected");
}