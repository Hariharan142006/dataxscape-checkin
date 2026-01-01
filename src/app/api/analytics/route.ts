import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Team } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Check-ins per hour (Line Chart)
        const timeline = await Team.aggregate([
            { $match: { gateCheckIn: true, gateCheckInTime: { $exists: true } } },
            {
                $group: {
                    _id: {
                        hour: { $hour: "$gateCheckInTime" },
                        // date: { $dateToString: { format: "%Y-%m-%d", date: "$gateCheckInTime" } } // If spanning days
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.hour": 1 } }
        ]);

        // Format timeline for frontend
        const hours = timeline.map(t => ({
            hour: `${t._id.hour}:00`,
            fullHour: t._id.hour,
            count: t.count
        }));

        // Fill in missing hours if needed (optional, implemented for smoother charts)
        // Assuming event is from 8 AM to 8 PM (08:00 to 20:00)
        const filledHours = [];
        for (let i = 8; i <= 20; i++) {
            const found = hours.find(h => h.fullHour === i);
            filledHours.push({
                time: `${i}:00`,
                checkins: found ? found.count : 0
            });
        }

        // 2. College Distribution (Pie Chart) - Checked In vs Total
        const collegeStats = await Team.aggregate([
            {
                $group: {
                    _id: "$college",
                    total: { $sum: 1 },
                    checkedIn: {
                        $sum: { $cond: [{ $eq: ["$gateCheckIn", true] }, 1, 0] }
                    }
                }
            },
            { $sort: { total: -1 } },
            { $limit: 10 } // Top 10 colleges
        ]);

        const collegeData = collegeStats.map(c => ({
            name: c._id,
            total: c.total,
            checkedIn: c.checkedIn
        }));

        // 3. Track Distribution
        const trackStats = await Team.aggregate([
            {
                $group: {
                    _id: "$track",
                    count: { $sum: 1 }
                }
            }
        ]);

        const trackData = trackStats.map(t => ({
            name: t._id || "Unknown",
            count: t.count
        }));


        return NextResponse.json({
            timeline: filledHours,
            colleges: collegeData,
            tracks: trackData
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
