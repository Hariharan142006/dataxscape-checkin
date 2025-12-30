import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/db/models';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await connectToDatabase();

        const username = 'admin';
        const password = 'password123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' });
        }

        await User.create({
            username,
            password: hashedPassword,
            role: 'admin'
        });

        return NextResponse.json({ message: 'Admin user created successfully', username, password });
    } catch (error) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: 'Failed to seed user' }, { status: 500 });
    }
}
