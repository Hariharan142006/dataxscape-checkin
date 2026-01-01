"use client"

import { useState, useEffect } from "react"
import { MotionWrapper } from "@/components/MotionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/core"
import { Search, Download, CheckCircle, XCircle, Users, FileText, FileSpreadsheet, Clock, AlertTriangle } from "lucide-react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Team = {
    _id: string
    teamId: string
    name: string
    college: string
    members?: string | any // Handle string or array
    gateCheckIn: boolean
    gateCheckInTime: string
    presentMembers: string[]
}

// Checkbox Component
function Checkbox({ checked, onChange, label }: { checked: boolean, onChange: (checked: boolean) => void, label: string }) {
    return (
        <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-black/20 cursor-pointer hover:bg-white/5 transition-colors">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-amber-500 border-amber-500' : 'border-white/30'}`}>
                {checked && <div className="h-2 w-2 bg-black rounded-sm" />}
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

export default function AttendancePage() {
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [activeTab, setActiveTab] = useState<'CHECKED_IN' | 'NOT_CHECKED_IN'>('CHECKED_IN')

    // Modal State
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [tempPresentMembers, setTempPresentMembers] = useState<string[]>([])

    const fetchTeams = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/teams?search=${search}`, { cache: 'no-store' })
            const data = await res.json()
            setTeams(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(fetchTeams, 300)
        return () => clearTimeout(timer)
    }, [search])

    // Helper to get member list
    const getMembers = (team: Team): string[] => {
        if (!team?.members) return [];
        if (Array.isArray(team.members)) return team.members;
        try {
            const parsed = JSON.parse(team.members);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return team.members.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
    }

    // Filter Logic
    const filteredTeams = teams.filter(t =>
        activeTab === 'CHECKED_IN' ? t.gateCheckIn : !t.gateCheckIn
    )

    // Export Logic
    const exportCSV = () => {
        const headers = ['Team ID', 'Name', 'College', 'Status', 'Check-in Time', 'Present Members', 'Absent Members']
        const csvContent = [
            headers.join(','),
            ...filteredTeams.map(t => {
                const allMembers = getMembers(t);
                const present = t.presentMembers || [];
                const absent = allMembers.filter(m => !present.includes(m));

                return [
                    t.teamId,
                    `"${t.name}"`,
                    `"${t.college}"`,
                    t.gateCheckIn ? 'Checked In' : 'Not Arrived',
                    t.gateCheckIn ? new Date(t.gateCheckInTime).toLocaleString() : '-',
                    `"${present.join(', ')}"`,
                    `"${absent.join(', ')}"`
                ].join(',')
            })
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `attendance_${activeTab.toLowerCase()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(18)
        doc.text(`${activeTab === 'CHECKED_IN' ? 'Attendance List' : 'Absentees List'} - HackPortal`, 14, 22)
        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

        const tableData = filteredTeams.map(t => {
            const allMembers = getMembers(t);
            const present = t.presentMembers || [];

            return [
                t.teamId,
                t.name,
                t.college,
                t.gateCheckIn ? new Date(t.gateCheckInTime).toLocaleTimeString() : '-',
                activeTab === 'CHECKED_IN' ? present.join(', ') : allMembers.join(', ')
            ]
        })

        autoTable(doc, {
            head: [['Team ID', 'Name', 'College', 'Time', activeTab === 'CHECKED_IN' ? 'Present Members' : 'Members']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [245, 158, 11] } // Amber color
        })

        doc.save(`attendance_${activeTab.toLowerCase()}.pdf`)
    }

    const handleEditClick = (team: Team) => {
        setSelectedTeam(team)
        setTempPresentMembers(team.presentMembers || [])
    }

    const handleSaveAttendance = async () => {
        if (!selectedTeam) return;

        try {
            // We use the checkin endpoint for updates too, or a specific update endpoint. 
            // Currently checkin POST handles "already checked in" error. 
            // We might need to update the team directly via PUT /api/teams if we are just editing attendance details.
            // Let's check api/teams/route.ts -> supports PUT for members/name etc, but maybe not attendance.
            // For now, let's assume we update the team document directly.

            // To properly update, we should probably add PATCH support to individual team route or use PUT.
            // Let's try PUT to /api/teams with the updated data.

            const allMembers = getMembers(selectedTeam);

            // If user unchecks all, does it mean un-checkin? Probably just no members present.
            // If we want to undo checkin we need a specific flag.

            // For now, let's just update the presentMembers array.

            // NOTE: The current /api/teams PUT updates standard fields. We might need to modify it to update presentMembers too.
            // Or we can just include it in the PUT body if the backend accepts strictly typed fields?
            // Let's modify the Team schema to be strict? No, mongoose is flexible unless strict: true. 
            // But our route destructures specific fields.

            // Strategy: We will fetch the update team route.
            // Currently updating attendance might require a new route or modifying existing.
            // Let's modify the PUT in /api/teams to accept presentMembers.

            const res = await fetch('/api/teams', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: selectedTeam.teamId,
                    // We need to send other fields to keep them or backend uses findOneAndUpdate with specific fields?
                    // The backend PUT implementation:
                    // const { teamId, name, college, place, track, members } = body;
                    // It only updates these. We need to ADD presentMembers to the backend PUT route first! (Wait, I should have planned this!)
                    // Actually, I should update the backend first.

                    // Quick Fix: I will update the backend route in the next step. For now I write this code assuming support.
                    presentMembers: tempPresentMembers,
                    gateCheckIn: selectedTeam.gateCheckIn // In case we add toggle logic later
                })
            })

            if (res.ok) {
                fetchTeams();
                setSelectedTeam(null);
            } else {
                alert("Failed to update");
            }

        } catch (e) {
            console.error(e)
            alert("Error updating record");
        }
    }

    const handleToggleCheckIn = async () => {
        // Feature to manually toggle check-in status (Undo Check-in or Manual Check-in)
        if (!selectedTeam) return;

        const newStatus = !selectedTeam.gateCheckIn;
        const now = new Date();

        const res = await fetch('/api/teams', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teamId: selectedTeam.teamId,
                gateCheckIn: newStatus,
                gateCheckInTime: newStatus ? now : null,
                presentMembers: newStatus ? tempPresentMembers : [] // If checking out, clear present? Or keep history. Let's keep logic simple.
            })
        })

        if (res.ok) {
            fetchTeams();
            setSelectedTeam(null);
        }
    }

    return (
        <MotionWrapper className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white selection:bg-primary selection:text-black">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-[#393328] bg-background-dark/95 backdrop-blur px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-white/10 flex items-center justify-center border border-white/5">
                        <span className="material-symbols-outlined text-white/50">assignment_turned_in</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide uppercase">Attendance Dashboard</h1>
                        <p className="text-xs text-gray-400">Manage Check-ins & Absentees</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="text-sm" onClick={() => window.location.href = '/admin/dashboard'}>
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1400px] mx-auto p-8 flex flex-col gap-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl bg-surface-dark border border-[#393328] flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold">Total Teams</p>
                            <h3 className="text-2xl font-bold text-white">{teams.length}</h3>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl bg-surface-dark border border-[#393328] flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold">Checked In</p>
                            <h3 className="text-2xl font-bold text-white">{teams.filter(t => t.gateCheckIn).length}</h3>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl bg-surface-dark border border-[#393328] flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold">Not Arrived</p>
                            <h3 className="text-2xl font-bold text-white">{teams.filter(t => !t.gateCheckIn).length}</h3>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-dark p-4 rounded-xl border border-[#393328]">
                    {/* Tabs */}
                    <div className="flex bg-black/20 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('CHECKED_IN')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'CHECKED_IN' ? 'bg-green-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Checked In
                        </button>
                        <button
                            onClick={() => setActiveTab('NOT_CHECKED_IN')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'NOT_CHECKED_IN' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Not Checked In
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search Teams..."
                            className="w-full bg-black/20 border border-[#393328] rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Exports */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
                            <FileSpreadsheet size={16} /> CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportPDF} className="gap-2">
                            <FileText size={16} /> PDF
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-[#393328] bg-surface-dark/50 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-500 uppercase bg-black/20 border-b border-[#393328]">
                            <tr>
                                <th className="px-6 py-4">Team</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Check-in Time</th>
                                <th className="px-6 py-4">{activeTab === 'CHECKED_IN' ? 'Attendance' : 'Members'}</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#393328]">
                            {filteredTeams.map((team) => (
                                <tr key={team._id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleEditClick(team)}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{team.name}</div>
                                        <div className="text-xs">{team.teamId} • {team.college}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {team.gateCheckIn ?
                                            <span className="inline-flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold border border-green-500/20">Checked In</span> :
                                            <span className="inline-flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold border border-red-500/20">Pending</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        {team.gateCheckIn && team.gateCheckInTime ?
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Clock size={14} />
                                                {new Date(team.gateCheckInTime).toLocaleTimeString()}
                                            </div> : '-'
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        {activeTab === 'CHECKED_IN' ? (
                                            <div className="flex flex-wrap gap-1">
                                                {(team.presentMembers || []).map((m, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-xs border border-white/5">{m}</span>
                                                ))}
                                                {(!team.presentMembers?.length) && <span className="text-xs text-gray-600 italic">No members marked</span>}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-500">{getMembers(team).length} members registered</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditClick(team) }}>Edit</Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTeams.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500 italic">No teams found in this category</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </main>

            {/* Edit Modal */}
            <AnimatePresence>
                {selectedTeam && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTeam(null)}></div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg bg-[#181611] border border-[#393328] rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-5 border-b border-[#393328] flex justify-between items-center bg-[#221c10]">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{selectedTeam.teamId}</h3>
                                    <p className="text-xs text-gray-400">{selectedTeam.name}</p>
                                </div>
                                <button onClick={() => setSelectedTeam(null)} className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center">
                                    <XCircle size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Status Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-dark border border-[#393328]">
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">Check-in Status</p>
                                        <p className="text-xs text-gray-500">{selectedTeam.gateCheckIn ? `Checked in at ${new Date(selectedTeam.gateCheckInTime).toLocaleTimeString()}` : "Not checked in yet"}</p>
                                    </div>
                                    <Button
                                        onClick={handleToggleCheckIn}
                                        variant={selectedTeam.gateCheckIn ? "destructive" : "default"}
                                        className={selectedTeam.gateCheckIn ? "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30" : "bg-green-500 text-black hover:bg-green-400"}
                                    >
                                        {selectedTeam.gateCheckIn ? "Undo Check-in" : "Mark Present"}
                                    </Button>
                                </div>

                                {/* Member Attendance */}
                                {selectedTeam.gateCheckIn && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance Sheet</p>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                            {getMembers(selectedTeam).map((member, idx) => (
                                                <Checkbox
                                                    key={idx}
                                                    label={member}
                                                    checked={tempPresentMembers.includes(member)}
                                                    onChange={(checked) => {
                                                        if (checked) setTempPresentMembers([...tempPresentMembers, member])
                                                        else setTempPresentMembers(tempPresentMembers.filter(m => m !== member))
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 border-t border-[#393328] bg-[#221c10] flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setSelectedTeam(null)}>Cancel</Button>
                                <Button onClick={handleSaveAttendance}>Save Changes</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </MotionWrapper>
    )
}
