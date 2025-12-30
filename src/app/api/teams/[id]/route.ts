import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Team } from '@/lib/db/models';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Missing team ID' }, { status: 400 });
        }

        const team = await Team.findOne({ teamId: id });

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json(team);
    } catch (error) {
        console.error("Fetch Error:", error);
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Missing team ID' }, { status: 400 });
        }

        // Delete from MongoDB using teamId (as string)
        await Team.findOneAndDelete({ teamId: id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }
}
