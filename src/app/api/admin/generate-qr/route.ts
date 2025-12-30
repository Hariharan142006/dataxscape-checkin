import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Team } from '@/lib/db/models';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Force dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        // Ensure public/qrcodes exists
        const qrDir = path.join(process.cwd(), 'public', 'qrcodes');
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        const teams = await Team.find({});
        let count = 0;

        for (const team of teams) {
            if (!team.token || !team.teamId) continue;

            const qrData = `https://dataxscape2k26.com/checkin?teamId=${team.teamId}&token=${team.token}`;
            const fileName = `${team.teamId}.png`;
            const filePath = path.join(qrDir, fileName);

            await QRCode.toFile(filePath, qrData, {
                color: {
                    dark: '#000000',  // Black dots
                    light: '#ffffff' // White background
                },
                width: 300
            });

            // Update DB with URL
            team.qrCodeUrl = `/qrcodes/${fileName}`;
            await team.save();

            count++;
        }

        return NextResponse.json({ success: true, generated: count });
    } catch (error) {
        console.error("QR Gen Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
