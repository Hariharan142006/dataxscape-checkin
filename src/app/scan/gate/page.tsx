"use client"

import { useState, useEffect } from "react"
import { MotionWrapper, FadeIn } from "@/components/MotionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input, Badge } from "@/components/ui/core"
import QRScanner from "@/components/QRScanner"
import { CheckCircle, AlertTriangle, XCircle, QrCode, Search, Smartphone, Users, UserCheck } from "lucide-react"

// Simple Checkbox Component since it's missing in core
function Checkbox({ checked, onChange, label }: { checked: boolean, onChange: (checked: boolean) => void, label: string }) {
    return (
        <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-black/20 cursor-pointer hover:bg-white/5 transition-colors">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-amber-500 border-amber-500' : 'border-white/30'}`}>
                {checked && <UserCheck size={14} className="text-black" />}
            </div>
            <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className={`text-sm font-medium ${checked ? 'text-white' : 'text-gray-400'}`}>{label}</span>
        </label>
    )
}

export default function GateCheckinPage() {
    const [scanMode, setScanMode] = useState(true)
    const [manualId, setManualId] = useState("")

    // State for Verification Flow
    const [teamToVerify, setTeamToVerify] = useState<any>(null)
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])

    const [lastCheckin, setLastCheckin] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const playSuccessSound = () => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    };

    const playErrorSound = () => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // Low pitch

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    };

    // Parse team members (handles both JSON string and Array)
    const getMembers = (team: any): string[] => {
        if (!team?.members) return [];
        if (Array.isArray(team.members)) return team.members;
        try {
            const parsed = JSON.parse(team.members);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            // If simple string comma separated?
            return team.members.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
    }

    const handleLookup = async (identifier: string) => {
        setLoading(true)
        setError(null)
        setLastCheckin(null)
        setTeamToVerify(null)

        try {
            // Extract ID if it's a URL
            let queryId = identifier;
            if (identifier.includes('?')) {
                try {
                    const url = new URL(identifier);
                    queryId = url.searchParams.get('teamId') || identifier;
                } catch (e) { }
            }

            // Search for team
            const res = await fetch(`/api/teams?search=${encodeURIComponent(queryId)}`);
            const teams = await res.json();

            if (!res.ok) throw new Error("Failed to fetch teams");

            // Find exact match
            const team = teams.find((t: any) => t.teamId.toLowerCase() === queryId.toLowerCase());

            if (team) {
                if (team.gateCheckIn) {
                    setLastCheckin({ success: false, warning: true, team, msg: `Already checked in at ${new Date(team.gateCheckInTime).toLocaleTimeString()}` })
                } else {
                    const members = getMembers(team);
                    setTeamToVerify(team);
                    setSelectedMembers(members); // Default select all
                }
            } else {
                setError("Team not found");
            }

        } catch (e) {
            setError("Network error or invalid ID");
        } finally {
            setLoading(false)
        }
    }

    const confirmCheckin = async () => {
        if (!teamToVerify) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: teamToVerify.teamId,
                    type: 'GATE',
                    presentMembers: selectedMembers,
                    handledBy: 'volunteer'
                })
            })

            const data = await res.json()

            if (res.ok) {
                setLastCheckin({
                    success: true,
                    team: { ...teamToVerify, presentMembers: selectedMembers }, // Update local view
                    msg: `Checked in ${selectedMembers.length} members`
                });
                playSuccessSound();
                setTeamToVerify(null); // Clear verification state
                setManualId(""); // Clear input
            } else {
                setError(data.error || "Check-in failed");
            }
        } catch (e) {
            setError("Network error during check-in");
        } finally {
            setLoading(false);
        }
    }

    const toggleMember = (member: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedMembers(prev => [...prev, member]);
        } else {
            setSelectedMembers(prev => prev.filter(m => m !== member));
        }
    }

    return (
        <MotionWrapper className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white relative overflow-hidden">
            {/* Header */}
            <header className="relative z-10 w-full px-6 py-4 flex justify-between items-center border-b border-[#393328] bg-background-dark/95 backdrop-blur">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-white/10 flex items-center justify-center border border-white/5">
                        <span className="material-symbols-outlined text-white/50">school</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-wide uppercase">Gate Check-in</h1>
                        <p className="text-[10px] text-amber-500">Main Entrance</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-surface-dark border border-[#393328] rounded-full flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-gray-400 font-mono">LIVE</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 p-4 md:p-8 flex flex-col items-center justify-start gap-8 max-w-4xl mx-auto w-full">

                {/* Status Cards / Verification Modal */}
                <div className="w-full min-h-[160px]">
                    <AnimatePresence mode="wait">
                        {/* 1. Verification State */}
                        {teamToVerify && (
                            <motion.div
                                key="verify"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-6 mb-6"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-full bg-amber-500/20 text-amber-500">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">{teamToVerify.teamId}</h2>
                                                <p className="text-gray-300">{teamToVerify.name}</p>
                                                {teamToVerify.seatNumber && (
                                                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-500/20 border border-blue-500/50 text-blue-400 font-bold">
                                                        <span className="text-xs uppercase text-blue-300/70">Seat</span>
                                                        <span className="text-lg">{teamToVerify.seatNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Attendance</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                                                {getMembers(teamToVerify).map((member, idx) => (
                                                    <Checkbox
                                                        key={idx}
                                                        label={member}
                                                        checked={selectedMembers.includes(member)}
                                                        onChange={(checked) => toggleMember(member, checked)}
                                                    />
                                                ))}
                                                {getMembers(teamToVerify).length === 0 && (
                                                    <p className="text-sm text-gray-500 italic">No members listed</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-end gap-3 min-w-[200px]">
                                        <div className="text-center p-3 rounded bg-black/20">
                                            <div className="text-3xl font-bold text-white">{selectedMembers.length}</div>
                                            <div className="text-xs text-gray-400 uppercase">Present</div>
                                        </div>
                                        <Button
                                            onClick={confirmCheckin}
                                            disabled={loading}
                                            className="h-14 w-full text-lg font-bold"
                                        >
                                            {loading ? "Checking In..." : "Confirm Entry"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setTeamToVerify(null)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. Success/Warning State */}
                        {lastCheckin && !teamToVerify && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`rounded-xl border p-6 mb-6 ${lastCheckin.warning ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-green-500/10 border-green-500/50'}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${lastCheckin.warning ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                        {lastCheckin.warning ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{lastCheckin.team?.teamId}</h2>
                                        <p className="text-lg text-gray-200 font-medium">{lastCheckin.team?.name}</p>
                                        {lastCheckin.team?.seatNumber && (
                                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-500/20 border border-blue-500/50 text-blue-400 font-bold mb-2">
                                                <span className="text-xs uppercase text-blue-300/70">Seat</span>
                                                <span className="text-lg">{lastCheckin.team.seatNumber}</span>
                                            </div>
                                        )}

                                        <div className="mt-3 inline-flex px-3 py-1 rounded-md bg-black/40 border border-white/10 text-sm font-mono text-gray-300">
                                            {lastCheckin.msg}
                                        </div>

                                        {/* Present Members List */}
                                        {lastCheckin.team?.presentMembers && lastCheckin.team.presentMembers.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/10 w-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Members Present</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {lastCheckin.team.presentMembers.map((member: string, idx: number) => (
                                                        <Badge key={idx} variant="outline" className="bg-black/20 text-white border-white/10">
                                                            {member}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. Error State */}
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 mb-6"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-red-500/20 text-red-500">
                                        <XCircle size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-400">Error</h3>
                                        <p className="text-gray-300">{error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Main Scanning Interface - Hide if verifying to focus user */}
                {!teamToVerify && (
                    <FadeIn delay={0.2} className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Scanner Column */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-surface-dark border border-[#393328] rounded-2xl overflow-hidden shadow-2xl relative">
                                {/* Tabs */}
                                <div className="flex border-b border-[#393328]">
                                    <button
                                        onClick={() => setScanMode(true)}
                                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${scanMode ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'bg-surface-dark text-gray-500 hover:text-gray-300'}`}
                                    >
                                        <QrCode size={18} /> Scanner
                                    </button>
                                    <button
                                        onClick={() => setScanMode(false)}
                                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${!scanMode ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'bg-surface-dark text-gray-500 hover:text-gray-300'}`}
                                    >
                                        <Search size={18} /> Manual ID
                                    </button>
                                </div>

                                <div className="p-6 min-h-[400px] flex flex-col items-center justify-center bg-black/40">
                                    {scanMode ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="w-full h-full flex flex-col items-center justify-center gap-4"
                                        >
                                            <div className="relative w-full max-w-sm aspect-square bg-black rounded-xl overflow-hidden border-2 border-[#393328] shadow-inner">
                                                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                                    <div className="w-64 h-64 border-2 border-amber-500/50 rounded-lg relative">
                                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
                                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
                                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
                                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>
                                                        {/* Scanning Animation */}
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                                    </div>
                                                </div>
                                                <QRScanner onScan={(val) => {
                                                    if (!loading && !teamToVerify) handleLookup(val)
                                                }} />
                                            </div>
                                            <p className="text-sm text-gray-500">Scan QR to verify team</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full max-w-sm space-y-6"
                                        >
                                            <div className="text-center space-y-2">
                                                <Smartphone className="mx-auto h-12 w-12 text-gray-600" />
                                                <h3 className="text-lg font-medium text-white">Manual Entry</h3>
                                                <p className="text-sm text-gray-500">Enter Team ID to lookup</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-gray-400 uppercase">Team ID</label>
                                                    <Input
                                                        placeholder="DX-001"
                                                        value={manualId}
                                                        onChange={(e) => setManualId(e.target.value)}
                                                        className="bg-black/50 border-[#393328] text-center text-lg tracking-widest uppercase font-mono h-12"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleLookup(manualId)
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => handleLookup(manualId)}
                                                    disabled={loading || !manualId}
                                                    className="w-full h-12 text-lg"
                                                >
                                                    {loading ? "Looking up..." : "Find Team"}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-surface-dark border border-[#393328] rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Instructions</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-sm text-gray-400">
                                        <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                                        Scan Team QR or Enter ID.
                                    </li>
                                    <li className="flex gap-3 text-sm text-gray-400">
                                        <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                                        Review list of team members.
                                    </li>
                                    <li className="flex gap-3 text-sm text-gray-400">
                                        <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                                        Uncheck absent members.
                                    </li>
                                    <li className="flex gap-3 text-sm text-gray-400">
                                        <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">4</div>
                                        Click "Confirm Entry" to check in.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </FadeIn>
                )}
            </main>
        </MotionWrapper>
    )
}
