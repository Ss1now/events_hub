import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/config/db';
import userModel from '@/lib/models/usermodel';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token and check if admin
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        await connectDB();
        
        const adminUser = await userModel.findById(decoded.id);
        if (!adminUser?.isAdmin) {
            return NextResponse.json({ success: false, msg: 'Admin privileges required' }, { status: 403 });
        }

        const query = request.nextUrl.searchParams.get('query');
        
        if (!query || query.length < 2) {
            return NextResponse.json({ success: false, msg: 'Search query must be at least 2 characters' }, { status: 400 });
        }

        // Search users by username or email (case-insensitive)
        const users = await userModel.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        })
        .select('_id name email username residentialCollege isOrganization')
        .limit(20);

        return NextResponse.json({ 
            success: true, 
            users
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, msg: 'Search failed' }, { status: 500 });
    }
}
