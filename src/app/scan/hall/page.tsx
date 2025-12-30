"use client"

import { useState } from "react"
import { MotionWrapper, FadeIn } from "@/components/MotionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui/core"
import QRScanner from "@/components/QRScanner"
import { CheckCircle, AlertTriangle, XCircle, Building, QrCode, Search, Ticket } from "lucide-react"

export default function HallCheckinPage() {
    const [scanMode, setScanMode] = useState(true)
    const [manualId, setManualId] = useState("")
    const [lastCheckin, setLastCheckin] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleCheckin = async (identifier: string, isToken: boolean) => {
        setLoading(true)
        setError(null)
        setLastCheckin(null)

        try {
            let teamId = identifier;
            let token = undefined;

            if (identifier.includes('?')) {
                try {
                    const url = new URL(identifier);
                    teamId = url.searchParams.get('teamId') || '';
                    token = url.searchParams.get('token') || undefined;
                } catch (e) { }
            } else if (isToken && identifier.includes('-')) {
                teamId = identifier;
            }

            const res = await fetch('/api/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId,
                    token,
                    type: 'HALL',
                    handledBy: 'volunteer'
                })
            })

            const data = await res.json()

            if (res.ok) {
                setLastCheckin({ success: true, team: data.team, msg: "Hall Entry Approved" })
            } else {
                if (data.gateMissing) {
                    setError(data.error)
                } else if (data.alreadyCheckedIn) {
                    setLastCheckin({ success: false, warning: true, team: data.team, msg: data.error })
                } else {
                    setError(data.error || "Check-in failed")
                }
            }
        } catch (e) {
            setError("Network error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <MotionWrapper className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white relative overflow-hidden">
            {/* Header */}
            <header className="relative z-10 w-full px-6 py-4 flex justify-between items-center border-b border-[#393328] bg-background-dark/95 backdrop-blur">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-white/10 flex items-center justify-center border border-white/5">
                        <span className="material-symbols-outlined text-white/50">meeting_room</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-wide uppercase">Hall Check-in</h1>
                        <p className="text-[10px] text-orange-400">Main Auditorium</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-surface-dark border border-[#393328] rounded-full flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                        <span className="text-xs text-gray-400 font-mono">ACTIVE</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 p-4 md:p-8 flex flex-col items-center justify-start gap-8 max-w-4xl mx-auto w-full">

                {/* Status Cards Area */}
                <div className="w-full min-h-[160px]">
                    <AnimatePresence mode="wait">
                        {lastCheckin && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`rounded-xl border p-6 mb-6 ${lastCheckin.warning ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-orange-500/10 border-orange-500/50'}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${lastCheckin.warning ? 'bg-yellow-500/20 text-yellow-500' : 'bg-orange-500/20 text-orange-500'}`}>
                                        {lastCheckin.warning ? <AlertTriangle size={32} /> : <Ticket size={32} />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{lastCheckin.team?.teamId}</h2>
                                        <p className="text-lg text-gray-200 font-medium">{lastCheckin.team?.name}</p>
                                        <p className="text-sm text-gray-400 mt-1">{lastCheckin.team?.college}</p>
                                        <div className="mt-3 inline-flex px-3 py-1 rounded-md bg-black/40 border border-white/10 text-sm font-mono text-gray-300">
                                            {lastCheckin.msg}
                                        </div>
                                        <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
                                            <CheckCircle size={12} /> Gate Verified
                                        </div>

                                        {/* Members List */}
                                        {lastCheckin.team?.members && (
                                            <div className="mt-4 pt-4 border-t border-white/10 w-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Team Members</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {lastCheckin.team.members.split(',').map((member: string, idx: number) => (
                                                        <Badge key={idx} variant="outline" className="bg-black/20 text-white border-white/10">
                                                            {member.trim()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
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
                                        <h3 className="text-lg font-bold text-red-400">Entry Denied</h3>
                                        <p className="text-gray-300">{error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Main Scanning Interface */}
                <FadeIn delay={0.2} className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scanner Column */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-surface-dark border border-[#393328] rounded-2xl overflow-hidden shadow-2xl relative">
                            {/* Tabs */}
                            <div className="flex border-b border-[#393328]">
                                <button
                                    onClick={() => setScanMode(true)}
                                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${scanMode ? 'bg-orange-500/10 text-orange-500 border-b-2 border-orange-500' : 'bg-surface-dark text-gray-500 hover:text-gray-300'}`}
                                >
                                    <QrCode size={18} /> Scanner
                                </button>
                                <button
                                    onClick={() => setScanMode(false)}
                                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${!scanMode ? 'bg-orange-500/10 text-orange-500 border-b-2 border-orange-500' : 'bg-surface-dark text-gray-500 hover:text-gray-300'}`}
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
                                                <div className="w-64 h-64 border-2 border-orange-500/50 rounded-lg relative">
                                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500"></div>
                                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500"></div>
                                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500"></div>
                                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500"></div>
                                                    {/* Scanning Animation */}
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                                </div>
                                            </div>
                                            <QRScanner onScan={(val) => {
                                                if (!loading) handleCheckin(val, true)
                                            }} />
                                        </div>
                                        <p className="text-sm text-gray-500">Align QR code within frame</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full max-w-sm space-y-6"
                                    >
                                        <div className="text-center space-y-2">
                                            <Building className="mx-auto h-12 w-12 text-gray-600" />
                                            <h3 className="text-lg font-medium text-white">Manual Hall Entry</h3>
                                            <p className="text-sm text-gray-500">Enter Team ID to allocate seat</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-400 uppercase">Team ID</label>
                                                <Input
                                                    placeholder="DX-001"
                                                    value={manualId}
                                                    onChange={(e) => setManualId(e.target.value)}
                                                    className="bg-black/50 border-[#393328] text-center text-lg tracking-widest uppercase font-mono h-12"
                                                />
                                            </div>
                                            <Button
                                                onClick={() => handleCheckin(manualId, false)}
                                                disabled={loading}
                                                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                                            >
                                                {loading ? "Verifying..." : "Admit to Hall"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Instructions / Recent Stats */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-surface-dark border border-[#393328] rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Hall Instructions</h3>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-sm text-gray-400">
                                    <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                                    Ensure Team has Gate Wristband.
                                </li>
                                <li className="flex gap-3 text-sm text-gray-400">
                                    <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                                    Scan QR code to record hall entry.
                                </li>
                                <li className="flex gap-3 text-sm text-gray-400">
                                    <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                                    Direct team to their assigned table number.
                                </li>
                            </ul>
                        </div>
                        <div className="bg-surface-dark border border-[#393328] rounded-xl p-6 flex-1 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
                                <Building className="text-orange-500 h-8 w-8" />
                            </div>
                            <h4 className="text-white font-bold">Auditorium Access</h4>
                            <p className="text-sm text-gray-500 mt-1">Authorized personnel only</p>
                        </div>
                    </div>
                </FadeIn>
            </main>
        </MotionWrapper>
    )
}
