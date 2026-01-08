import { NextResponse } from 'next/server';
import { loginUser, registerUser } from '@/auth/users';

export async function POST(request) {
    try {
        const { action, name, email, password } = await request.json();

        if (action === 'register') {
            const result = await registerUser(name, email, password);
            return NextResponse.json(result);
        } else if (action === 'login') {
            const result = await loginUser(email, password);
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ success: false, msg: 'Invalid action' });
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, msg: 'Server error' });
    }
}
