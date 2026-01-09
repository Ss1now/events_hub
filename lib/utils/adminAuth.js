import jwt from 'jsonwebtoken';
import userModel from '@/lib/models/usermodel';
import { connectDB } from '@/lib/config/db';

export const verifyAdmin = async (request) => {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { isAdmin: false, error: 'No token provided' };
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        await connectDB();
        const user = await userModel.findById(decoded.id);
        
        if (!user) {
            return { isAdmin: false, error: 'User not found' };
        }

        if (!user.isAdmin) {
            return { isAdmin: false, error: 'Access denied. Admin privileges required.' };
        }

        return { isAdmin: true, userId: user._id };
    } catch (error) {
        return { isAdmin: false, error: 'Invalid token or authentication error' };
    }
};
