"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { MotionWrapper } from "@/components/MotionWrapper";
import { motion } from "framer-motion";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui/core"
import { Search, Edit, QrCode, Trash, Plus, X, Share2, Filter, Download, MoreVertical, CheckCircle, Clock } from "lucide-react"

type Team = {
    _id: string
    teamId: string
    name: string
    college: string
    members?: string
    gateCheckIn: boolean
    hallCheckIn: boolean
    qrCodeUrl: string | null
}

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'ALL' | 'GATE' | 'HALL'>('ALL')
    const [showAddModal, setShowAddModal] = useState(false)
    const [newTeamData, setNewTeamData] = useState({ teamId: '', name: '', college: '', members: '' })

    const fetchTeams = async () => {
        setLoading(true)
        try {
            let url = `/api/teams?search=${search}`
            if (filter === 'GATE') url += '&gate=true'
            if (filter === 'HALL') url += '&hall=true'

            const res = await fetch(url)
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
    }, [search, filter])

    const generateQRs = async () => {
        if (!confirm('Generate QR codes for all teams?')) return
        try {
            const res = await fetch('/api/admin/generate-qr', { method: 'POST' })
            const data = await res.json()
            alert(`Generated ${data.generated} QR codes`)
            fetchTeams()
        } catch (e) {
            alert('Error generating QRs')
        }
    }

    const exportCSV = () => {
        const headers = ['Team ID', 'Name', 'College', 'Members', 'Gate Check-in', 'Gate Time', 'Hall Check-in', 'Hall Time']
        const csvContent = [
            headers.join(','),
            ...teams.map(t => [
                t.teamId,
                `"${t.name}"`,
                `"${t.college}"`,
                `"${t.members || ''}"`,
                t.gateCheckIn ? 'Yes' : 'No',
                t.gateCheckIn ? new Date().toISOString() : '',
                t.hallCheckIn ? 'Yes' : 'No',
                t.hallCheckIn ? new Date().toISOString() : ''
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'teams_export.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTeamData.teamId || !newTeamData.name || !newTeamData.college) return alert('Fill all fields')

        try {
            const res = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTeamData)
            })
            if (res.ok) {
                setShowAddModal(false)
                setNewTeamData({ teamId: '', name: '', college: '', members: '' })
                fetchTeams()
            } else {
                alert('Failed to add team')
            }
        } catch (e) { console.error(e); alert('Error') }
    }

    const handleDeleteAll = async () => {
        if (!confirm('WARNING: THIS WILL DELETE ALL TEAMS! Are you sure?')) return;
        if (!confirm('Really?? This cannot be undone.')) return;

        try {
            const res = await fetch('/api/teams', { method: 'DELETE' });
            if (res.ok) fetchTeams();
            else alert('Failed to delete teams');
        } catch (e) { alert('Error'); }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team?')) return
        try {
            const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' })
            if (res.ok) fetchTeams()
            else alert('Failed to delete')
        } catch (e) { console.error(e); alert('Error') }
    }

    const handleShare = (team: Team) => {
        if (!team.teamId) return alert('Invalid Team ID');
        window.open(`/ticket/${team.teamId}`, '_blank');
    }

    return (
        <MotionWrapper className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white selection:bg-primary selection:text-black">
            {/* Top Navigation with 3 Logo Slots */}
            <header className="sticky top-0 z-50 w-full border-b border-[#393328] bg-background-dark/95 backdrop-blur">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Left: College Logo */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <img src="/pec-logo.png" alt="PEC Logo" className="h-10 w-auto object-contain" />
                        </div>
                        {/* Center: Event Logo/Name */}
                        <div className="flex flex-col items-center justify-center">
                            <img src="/LOGO1.png" alt="DataXscape" className="h-12 w-auto object-contain" />
                        </div>
                        {/* Right: User Profile */}
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-8 rounded-full bg-surface-dark-lighter ring-1 ring-[#393328] flex items-center justify-center overflow-hidden">
                                <span className="material-symbols-outlined text-gray-400 p-1">person</span>
                            </div>
                            <button onClick={async () => {
                                try {
                                    await fetch('/api/auth/logout', { method: 'POST' });
                                    window.location.href = '/login';
                                } catch (e) {
                                    window.location.href = '/login';
                                }
                            }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-full text-neutral-400 transition-colors group" title="Logout">
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Team Management</h2>
                        <p className="text-gray-400 text-sm mt-1">Manage registrations, check-ins, and QR codes.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={handleDeleteAll} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-all group">
                            <span className="material-symbols-outlined text-red-500 group-hover:scale-110 transition-transform">delete_forever</span>
                            Delete All
                        </button>
                        <button onClick={generateQRs} className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-[#393328] hover:border-primary/50 text-white rounded-lg text-sm font-medium transition-all group">
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">qr_code_2</span>
                            Generate QRs
                        </button>
                        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-[#393328] hover:border-primary/50 text-white rounded-lg text-sm font-medium transition-all group">
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">download</span>
                            Export CSV
                        </button>
                        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(242,166,13,0.4)] transition-all">
                            <span className="material-symbols-outlined">add</span>
                            Add New Team
                        </button>
                    </div>
                </div>

                {/* Filters & Toolbar */}
                <div className="p-4 rounded-xl bg-surface-dark border border-[#393328] flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
                    {/* Search */}
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors">search</span>
                        </div>
                        <input
                            type="text"
                            className="bg-background-dark border border-[#393328] text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 placeholder-gray-500 transition-all outline-none"
                            placeholder="Search by Team ID, Name, College..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-background-dark rounded-lg p-1 border border-[#393328]">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-surface-dark-lighter text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            All Teams
                        </button>
                        <button
                            onClick={() => setFilter('GATE')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'GATE' ? 'bg-surface-dark-lighter text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Checked In
                        </button>
                        <button
                            onClick={() => setFilter('HALL')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'HALL' ? 'bg-surface-dark-lighter text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            Seated
                        </button>
                    </div>
                </div>

                {/* Teams Table */}
                <div className="rounded-xl border border-[#393328] bg-surface-dark/50 backdrop-blur overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-surface-dark-lighter border-b border-[#393328]">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Team Details</th>
                                    <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Members</th>
                                    <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-center">Status</th>
                                    <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#393328]">
                                {loading && (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center">Loading teams...</td></tr>
                                )}
                                {!loading && teams.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center">No teams found matching your criteria.</td></tr>
                                )}
                                {teams.map((team, index) => (
                                    <motion.tr
                                        key={team._id} // Changed to _id
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-surface-dark border border-[#393328] flex items-center justify-center text-primary font-bold shadow-inner">
                                                    {team.teamId.split('-')[1] || 'ID'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-base group-hover:text-primary transition-colors">{team.name}</div>
                                                    <div className="text-xs text-gray-500">{team.college} • <span className="font-mono text-gray-400">{team.teamId}</span></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {/* Placeholder avatars since we don't have member details yet */}
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-dark bg-gray-700 flex items-center justify-center text-xs text-white">M1</div>
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-dark bg-gray-700 flex items-center justify-center text-xs text-white">M2</div>
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-dark bg-gray-800 flex items-center justify-center text-xs text-gray-400">+2</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-max ${team.gateCheckIn ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-gray-800/50 border-gray-700 text-gray-500'}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${team.gateCheckIn ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                    Gate
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-max ${team.hallCheckIn ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-gray-800/50 border-gray-700 text-gray-500'}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${team.hallCheckIn ? 'bg-orange-500' : 'bg-gray-500'}`}></span>
                                                    Hall
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleShare(team)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Share/View QR">
                                                    <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Edit Team">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(team.teamId)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors" title="Delete Team">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Placeholder */}
                    <div className="px-6 py-4 border-t border-[#393328] flex items-center justify-between">
                        <span className="text-xs text-gray-500">Showing <span className="font-medium text-white">{teams.length}</span> entries</span>
                        <div className="flex gap-2">
                            <button disabled className="px-3 py-1 text-xs rounded-md bg-white/5 text-gray-500 cursor-not-allowed">Previous</button>
                            <button disabled className="px-3 py-1 text-xs rounded-md bg-white/5 text-gray-500 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Team Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#181611] border border-[#393328] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-[#393328] flex justify-between items-center bg-[#221c10]">
                            <div>
                                <h3 className="text-lg font-bold text-white">Add New Team</h3>
                                <p className="text-xs text-gray-400">Manual registration entry</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-gray-400">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Team Information</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="group">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-gray-500 text-[20px]">badge</span>
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full bg-[#12100c] border border-[#393328] text-white text-sm rounded-lg focus:ring-1 focus:ring-primary focus:border-primary block pl-10 p-3 placeholder-gray-600 transition-colors"
                                                placeholder="Team ID (e.g. DX-001)"
                                                value={newTeamData.teamId}
                                                onChange={e => setNewTeamData({ ...newTeamData, teamId: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-gray-500 text-[20px]">group</span>
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full bg-[#12100c] border border-[#393328] text-white text-sm rounded-lg focus:ring-1 focus:ring-primary focus:border-primary block pl-10 p-3 placeholder-gray-600 transition-colors"
                                                placeholder="Team Name"
                                                value={newTeamData.name}
                                                onChange={e => setNewTeamData({ ...newTeamData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-gray-500 text-[20px]">school</span>
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full bg-[#12100c] border border-[#393328] text-white text-sm rounded-lg focus:ring-1 focus:ring-primary focus:border-primary block pl-10 p-3 placeholder-gray-600 transition-colors"
                                                placeholder="College / Institution"
                                                value={newTeamData.college}
                                                onChange={e => setNewTeamData({ ...newTeamData, college: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-gray-500 text-[20px]">person_add</span>
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full bg-[#12100c] border border-[#393328] text-white text-sm rounded-lg focus:ring-1 focus:ring-primary focus:border-primary block pl-10 p-3 placeholder-gray-600 transition-colors"
                                                placeholder="Members (comma separated)"
                                                value={newTeamData.members}
                                                onChange={e => setNewTeamData({ ...newTeamData, members: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-[#393328] bg-[#221c10] flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleAddTeam} className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(242,166,13,0.3)] hover:shadow-[0_0_20px_rgba(242,166,13,0.5)] transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                Create Team
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MotionWrapper>
    )
}
