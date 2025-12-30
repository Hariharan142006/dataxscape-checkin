import React, { useRef } from 'react';
import { Calendar, Clock, MapPin, Share2, Download } from "lucide-react";
import { toPng, toBlob } from 'html-to-image';

type TicketProps = {
    team: {
        teamId: string;
        name: string;
        college: string;
        members?: string;
        qrCodeUrl: string | null;
        token?: string;
    };
    eventDetails?: {
        name: string;
        date: string;
        time: string;
        location: string;
    };
};

const TicketCard: React.FC<TicketProps> = ({
    team,
    eventDetails = {
        name: "DataXscape 2k26",
        date: "27th December, 2025",
        time: "09:00 AM",
        location: "Panimalar Engineering College"
    }
}) => {
    const ticketRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        try {
            console.log("Starting download...");
            const dataUrl = await toPng(ticketRef.current, { cacheBust: true });
            const link = document.createElement("a");
            link.download = `Ticket-${team.teamId}.png`;
            link.href = dataUrl;
            link.click();
            console.log("Download triggered");
        } catch (error) {
            console.error("Error generating ticket image:", error);
            alert("Failed to download ticket. See console for details.");
        }
    };

    const handleShare = async () => {
        if (!ticketRef.current) return;
        try {
            console.log("Starting share...");
            const blob = await toBlob(ticketRef.current, { cacheBust: true });

            if (!blob) {
                alert("Failed to create image blob.");
                return;
            }
            const file = new File([blob], `Ticket-${team.teamId}.png`, { type: "image/png" });

            if (navigator.share) {
                await navigator.share({
                    title: `Event Ticket: ${team.name}`,
                    text: `Here is the entry ticket for ${team.name} (ID: ${team.teamId})`,
                    files: [file],
                });
            } else {
                console.warn("Web Share API not supported");
                alert("Sharing is not supported on this browser. Please download the ticket instead.");
            }
        } catch (error) {
            console.error("Error sharing ticket:", error);
            alert("Failed to share ticket.");
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 p-4">
            {/* Ticket Container */}
            <div
                ref={ticketRef}
                className="w-full max-w-[350px] rounded-3xl overflow-hidden shadow-2xl relative"
                style={{
                    fontFamily: "'Inter', sans-serif",
                    backgroundColor: '#ffffff', // Explicit hex
                }}
            >
                {/* Header Image Area */}
                <div
                    className="h-48 relative overflow-hidden"
                    style={{ backgroundColor: '#18181b' }} // bg-zinc-900
                >
                    <img
                        src="/plane_crash_header.png"
                        alt="Event Header"
                        className="w-full h-full object-cover"
                    />
                    <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} // explicit gradient
                    ></div>

                    {/* Logos Container */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between z-10">
                        {/* Left: PEC Logo */}
                        <div
                            className="h-12 w-auto rounded-lg flex items-center justify-center px-2"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }} // bg-white/90
                        >
                            <img src="/pec-logo-full.png" alt="PEC Logo" className="h-8 w-auto object-contain" />
                        </div>

                        {/* Center: DataXscape Logo */}
                        <img src="/LOGO1.png" alt="DataXscape" className="h-16 w-auto object-contain drop-shadow-md mt-2" />

                        {/* Right: Data Science Club Logo */}
                        <div
                            className="h-10 w-10 rounded-full flex items-center justify-center border border-white/20 overflow-hidden"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} // bg-white/10
                        >
                            <img src="/dsc-logo.jpg" alt="DSC Logo" className="h-full w-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="px-6 py-6 flex flex-col items-center text-center"
                    style={{ backgroundColor: '#ffffff', color: '#18181b' }} // bg-white text-zinc-900
                >

                    <h2
                        className="text-xl font-bold leading-tight mb-4"
                        style={{ color: '#1e3a8a' }} // text-blue-900
                    >
                        {eventDetails.name}
                    </h2>

                    <div className="space-y-2 mb-6 w-full">
                        <div
                            className="flex items-center justify-center gap-2 text-xs"
                            style={{ color: '#6b7280' }} // text-gray-500
                        >
                            <Calendar className="w-3 h-3" />
                            <span>{eventDetails.date}</span>
                        </div>
                        <div
                            className="flex items-center justify-center gap-2 text-xs"
                            style={{ color: '#6b7280' }}
                        >
                            <Clock className="w-3 h-3" />
                            <span>{eventDetails.time}</span>
                        </div>
                        <div
                            className="flex items-center justify-center gap-2 text-xs"
                            style={{ color: '#6b7280' }}
                        >
                            <MapPin className="w-3 h-3" />
                            <span>{eventDetails.location}</span>
                        </div>
                    </div>

                    <div className="mb-1 w-full border-t border-dashed border-gray-300"></div>
                    <div className="w-full border-t border-dashed border-gray-300 mb-6 opacity-0"></div> {/* Spacing hack/double border effect */}

                    <div className="mb-6">
                        <h3
                            className="text-lg font-black uppercase tracking-wide"
                            style={{ color: '#18181b' }} // text-zinc-900
                        >
                            {team.name}
                        </h3>
                        <p
                            className="text-xs mt-1 truncate max-w-[250px] mx-auto"
                            style={{ color: '#9ca3af' }} // text-gray-400
                        >
                            {team.college}
                        </p>
                    </div>

                    <div
                        className="p-2 rounded-xl mb-4"
                        style={{ backgroundColor: '#ffffff' }}
                    >
                        {team.qrCodeUrl ? (
                            <img src={team.qrCodeUrl} alt="QR Code" className="w-40 h-40 object-contain" />
                        ) : (
                            <div
                                className="w-40 h-40 flex items-center justify-center text-xs"
                                style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }} // bg-gray-100 text-gray-400
                            >
                                No QR Code
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <p
                            className="text-[10px] uppercase tracking-widest mb-1"
                            style={{ color: '#9ca3af' }} // text-gray-400
                        >
                            Manual Code
                        </p>
                        <p
                            className="font-mono text-lg font-bold tracking-widest"
                            style={{ color: '#27272a' }} // text-zinc-800
                        >
                            {team.teamId}
                        </p>
                    </div>

                    {/* Decorative Circles for Ticket Cutouts */}
                    <div
                        className="absolute top-[160px] left-[-10px] w-5 h-5 rounded-full"
                        style={{ backgroundColor: '#0a0a09' }}
                    ></div>
                    <div
                        className="absolute top-[160px] right-[-10px] w-5 h-5 rounded-full"
                        style={{ backgroundColor: '#0a0a09' }}
                    ></div>

                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={handleDownload}
                    className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors border border-zinc-700">
                        <Download className="w-5 h-5" />
                    </div>
                    <span className="text-xs">Download</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors border border-zinc-700">
                        <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs">Share</span>
                </button>
            </div>
        </div>
    );
};

export default TicketCard;
