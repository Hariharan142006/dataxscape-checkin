import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/db/models';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { username, password } = await request.json();

        // MongoDB: Query users collection
        const user = await User.findOne({ username });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const response = NextResponse.json({
            success: true,
            user: { id: user._id.toString(), username: user.username, role: user.role }
        });

        response.cookies.set('auth_token', JSON.stringify({ username: user.username, role: user.role }), {
            httpOnly: false,
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
