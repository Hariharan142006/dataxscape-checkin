import mongoose from 'mongoose';
import { User } from '../src/lib/db/models';
import bcrypt from 'bcryptjs';
import { loadEnvConfig } from '@next/env';
import path from 'path';

// Load env vars from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI not found');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = [
            { username: 'admin', password: 'password123', role: 'admin' },
            { username: 'volunteer', password: 'volunteer123', role: 'volunteer' }
        ];

        for (const u of users) {
            const existingUser = await User.findOne({ username: u.username });
            if (existingUser) {
                console.log(`User ${u.username} already exists`);
                // Optional: Update password checking/resetting if needed, but for now skip
            } else {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                await User.create({
                    username: u.username,
                    password: hashedPassword,
                    role: u.role
                });
                console.log(`User ${u.username} created successfully`);
            }
        }

    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
