import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Team, CheckinLog } from '@/lib/db/models';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Force dynamic since we read headers/search params
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.toLowerCase();
        const checkedInGate = searchParams.get('gate');
        const checkedInHall = searchParams.get('hall');

        let query: any = {};

        if (search) {
            query.$or = [
                { teamId: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { college: { $regex: search, $options: 'i' } },
            ];
        }

        if (checkedInGate === 'true') query.gateCheckIn = true;
        if (checkedInGate === 'false') query.gateCheckIn = { $ne: true };

        if (checkedInHall === 'true') query.hallCheckIn = true;
        if (checkedInHall === 'false') query.hallCheckIn = { $ne: true };

        // Sort by Team ID
        const teams = await Team.find(query).sort({ teamId: 1 }).lean();

        // Parse members if it's stored as string JSON, though in new model it is string.
        // If we want to return parsed JSON, we can mapping it here, but frontend expects string or object? 
        // Previous wrapper suggests members is string or object. The model defines it as String. 
        // We will keep it as is from DB.

        return NextResponse.json(teams);
    } catch (error) {
        console.error("GET Teams Error:", error);
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { teamId, name, college, place, track, members } = body;

        const updatedTeam = await Team.findOneAndUpdate(
            { teamId },
            {
                name,
                college,
                place,
                track,
                members: typeof members === 'string' ? members : JSON.stringify(members),
            },
            { new: true } // Return updated doc
        );

        if (!updatedTeam) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json(updatedTeam);
    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { teamId, name, college, place, track, members } = body;

        if (!teamId || !name || !college) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if exists
        const existingTeam = await Team.findOne({ teamId });
        if (existingTeam) {
            return NextResponse.json({ error: 'Team ID already exists' }, { status: 409 });
        }

        const token = `${teamId}-${Math.random().toString(36).substring(7)}`;
        const qrDir = path.join(process.cwd(), 'public', 'qrcodes');
        const qrData = `https://dataxscape2k26.com/checkin?teamId=${teamId}&token=${token}`;
        const fileName = `${teamId}.png`;
        const filePath = path.join(qrDir, fileName);

        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        await QRCode.toFile(filePath, qrData, {
            color: { dark: '#000000', light: '#ffffff' },
            width: 300
        });

        const newTeam = await Team.create({
            teamId,
            name,
            college,
            place: place || '',
            track: track || '',
            members: members ? (typeof members === 'string' ? members : JSON.stringify(members)) : '[]',
            token: token,
            qrCodeUrl: `/qrcodes/${fileName}`,
            gateCheckIn: false,
            hallCheckIn: false,
        });

        return NextResponse.json(newTeam);
    } catch (error) {
        console.error("Create Create:", error);
        return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDatabase();

        await Team.deleteMany({});
        await CheckinLog.deleteMany({});

        return NextResponse.json({ success: true, message: 'All teams and logs deleted' });
    } catch (error) {
        console.error("Delete All Error:", error);
        return NextResponse.json({ error: 'Failed to delete all teams' }, { status: 500 });
    }
}
