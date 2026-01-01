import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Team, CheckinLog } from '@/lib/db/models';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { teamId, token, type, handledBy, presentMembers } = await request.json(); // type = "GATE"

        if (type !== 'GATE') {
            return NextResponse.json({ error: 'Invalid check-in type. Only GATE is supported.' }, { status: 400 });
        }

        const team = await Team.findOne({ teamId });

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        if (token && team.token) {
            // Basic token matching if provided
            if (team.token !== token) {
                return NextResponse.json({ error: 'Invalid QR Token' }, { status: 403 });
            }
        }

        const now = new Date();

        if (team.gateCheckIn) {
            return NextResponse.json({
                error: `Already checked in at Gate at ${new Date(team.gateCheckInTime).toLocaleTimeString()}`,
                alreadyCheckedIn: true,
                team
            }, { status: 409 });
        }

        team.gateCheckIn = true;
        team.gateCheckInTime = now;
        team.presentMembers = presentMembers || []; // Save the list of members present
        await team.save();

        // Log
        await CheckinLog.create({
            teamId,
            checkpoint: 'GATE',
            handledBy: handledBy || 'Unknown',
            timestamp: now
        });

        return NextResponse.json({ success: true, team });

    } catch (error) {
        console.error("Check-in Error:", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
