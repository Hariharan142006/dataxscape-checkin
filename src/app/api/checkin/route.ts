import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Team, CheckinLog } from '@/lib/db/models';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { teamId, token, type, handledBy } = await request.json(); // type = "GATE" or "HALL"

        if (!['GATE', 'HALL'].includes(type)) {
            return NextResponse.json({ error: 'Invalid check-in type' }, { status: 400 });
        }

        const team = await Team.findOne({ teamId });

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        if (token && team.token !== token) {
            return NextResponse.json({ error: 'Invalid QR Token' }, { status: 403 });
        }

        const now = new Date(); // Use Date object for Mongoose

        // Logic for GATE
        if (type === 'GATE') {
            if (team.gateCheckIn) {
                return NextResponse.json({
                    error: `Already checked in at Gate at ${new Date(team.gateCheckInTime).toLocaleTimeString()}`,
                    alreadyCheckedIn: true,
                    team
                }, { status: 409 });
            }

            team.gateCheckIn = true;
            team.gateCheckInTime = now;
            await team.save();

            // Log
            await CheckinLog.create({
                teamId,
                checkpoint: 'GATE',
                handledBy: handledBy || 'Unknown',
                timestamp: now
            });

            return NextResponse.json({ success: true, team });
        }

        // Logic for HALL
        if (type === 'HALL') {
            if (!team.gateCheckIn) {
                return NextResponse.json({
                    error: 'Gate entry not completed. Please go to main gate first.',
                    gateMissing: true,
                    team
                }, { status: 400 });
            }

            if (team.hallCheckIn) {
                return NextResponse.json({
                    error: `Already checked in at Hall at ${new Date(team.hallCheckInTime).toLocaleTimeString()}`,
                    alreadyCheckedIn: true,
                    team
                }, { status: 409 });
            }

            team.hallCheckIn = true;
            team.hallCheckInTime = now;
            await team.save();

            // Log
            await CheckinLog.create({
                teamId,
                checkpoint: 'HALL',
                handledBy: handledBy || 'Unknown',
                timestamp: now
            });

            return NextResponse.json({ success: true, team });
        }

    } catch (error) {
        console.error("Check-in Error:", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
