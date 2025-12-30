"use client";

import { useEffect, useState, use } from "react"; // Added 'use' for unwrapping params
import TicketCard from "@/components/TicketCard";
import { MotionWrapper } from "@/components/MotionWrapper";

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); // Unwrap params properly for Next.js 15+

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await fetch(`/api/teams/${id}`);
                if (!res.ok) throw new Error("Team not found");
                const data = await res.json();
                setTeam(data);
            } catch (err) {
                console.error(err);
                setError("Ticket not found or invalid link.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTeam();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
                <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
                <p className="text-gray-400">{error}</p>
                <a href="/" className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    Go Home
                </a>
            </div>
        );
    }

    return (
        <MotionWrapper className="min-h-screen flex flex-col items-center justify-center bg-background-dark p-4 sm:p-8">
            <div className="w-full max-w-md mx-auto">
                <TicketCard
                    team={team}
                    eventDetails={{
                        name: "DataXscape 2k26",
                        date: "21st January, 2026",
                        time: "09:00 AM",
                        location: "Panimalar Engineering College"
                    }}
                />
            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-500 text-xs">
                    © 2025 Tech Vanta. All rights reserved.
                </p>
            </div>
        </MotionWrapper>
    );
}
