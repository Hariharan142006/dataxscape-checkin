"use client"

import { useState, useEffect } from "react";
import { MotionWrapper, FadeIn, ScaleIn } from "@/components/MotionWrapper";
import { motion } from "framer-motion";


export default function AdminDashboard() {
    const [stats, setStats] = useState({ total: 0, gate: 0, hall: 0 })

    useEffect(() => {
        // In a real app we'd have a specific stats endpoint, 
        // but here we can just fetch all teams and count client-side for simplicity given N=90
        fetch('/api/teams').then(r => r.json()).then(data => {
            setStats({
                total: data.length,
                gate: data.filter((t: any) => t.gateCheckIn).length,
                hall: data.filter((t: any) => t.hallCheckIn).length
            })
        })
    }, [])

    return (
        <MotionWrapper className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white selection:bg-primary selection:text-black">
            {/* Top Navigation with 3 Logo Slots */}
            <header className="sticky top-0 z-50 w-full border-b border-[#393328] bg-background-dark/95 backdrop-blur">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Left: College Logo */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-white/10 flex items-center justify-center overflow-hidden">
                                <span className="material-symbols-outlined text-gray-400">school</span>
                            </div>
                            <span className="hidden md:block text-sm font-medium text-gray-400">Tech University</span>
                        </div>
                        {/* Center: Event Logo/Name */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-2xl">terminal</span>
                                <h1 className="text-xl font-black tracking-tight text-white uppercase"><span className="text-primary">Hack</span>Portal</h1>
                            </div>
                            <span className="text-[10px] text-primary/70 tracking-widest uppercase font-bold">Admin Console</span>
                        </div>
                        {/* Right: Sponsor Logo & User Profile */}
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-3 border-r border-[#393328] pr-6">
                                <span className="text-xs text-gray-500 font-medium">Sponsored by</span>
                                <div className="h-8 w-24 rounded bg-white/5 flex items-center justify-center overflow-hidden">
                                    <span className="text-xs font-bold text-gray-500">CORP INC</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="relative rounded-full p-1 text-gray-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">notifications</span>
                                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background-dark"></span>
                                </button>
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
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
                {/* Page Heading & Controls */}
                <FadeIn delay={0.1} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h2>
                        <p className="text-gray-400 mt-1">Real-time attendance tracking for <span className="text-primary font-medium">HackPortal 2024</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-dark border border-[#393328]">
                            <span className="material-symbols-outlined text-green-500 text-[18px]">wifi</span>
                            <span className="text-xs font-medium text-gray-300">System Online</span>
                        </div>
                        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-semibold transition-all">
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                            Refresh Data
                        </button>
                    </div>
                </FadeIn>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Teams KPI */}
                    <FadeIn delay={0.2} className="h-full">
                        <div className="relative overflow-hidden rounded-xl bg-surface-dark border border-[#393328] p-6 group hover:border-primary/50 transition-all duration-300 h-full">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-white">groups</span>
                            </div>
                            <div className="flex flex-col gap-1 z-10 relative">
                                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Registrations</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-bold text-white transition-all duration-1000 ease-out">{stats.total}</h3>
                                    <span className="text-sm text-green-500 font-medium flex items-center">
                                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span> +0
                                    </span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1 mt-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="bg-gray-600 h-1 rounded-full"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Teams confirmed via email</p>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Gate Check-in KPI */}
                    <FadeIn delay={0.3} className="h-full">
                        <div className="relative overflow-hidden rounded-xl bg-surface-dark border border-[#393328] p-6 group hover:border-primary/50 transition-all duration-300 h-full">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">id_card</span>
                            </div>
                            <div className="flex flex-col gap-1 z-10 relative">
                                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Gate Check-in</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-bold text-primary">{stats.gate}</h3>
                                    <span className="text-sm text-gray-400 font-medium">/ {stats.total}</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1 mt-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.total ? (stats.gate / stats.total) * 100 : 0}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="bg-primary h-1 rounded-full shadow-[0_0_10px_rgba(242,166,13,0.5)]"
                                    />
                                </div>
                                <p className="text-xs text-primary/80 mt-2 font-medium">{stats.total ? Math.round((stats.gate / stats.total) * 100) : 0}% Arrival Rate</p>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Hall Check-in KPI */}
                    <FadeIn delay={0.4} className="h-full">
                        <div className="relative overflow-hidden rounded-xl bg-surface-dark border border-[#393328] p-6 group hover:border-primary/50 transition-all duration-300 h-full">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-orange-400">meeting_room</span>
                            </div>
                            <div className="flex flex-col gap-1 z-10 relative">
                                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Hall Check-in</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-bold text-white">{stats.hall}</h3>
                                    <span className="text-sm text-gray-400 font-medium">/ {stats.total}</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1 mt-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.total ? (stats.hall / stats.total) * 100 : 0}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="bg-orange-400 h-1 rounded-full"
                                    />
                                </div>
                                <p className="text-xs text-orange-400/80 mt-2 font-medium">{stats.total ? Math.round((stats.hall / stats.total) * 100) : 0}% Seated</p>
                            </div>
                        </div>
                    </FadeIn>
                </div>

                {/* Main Content Area: Charts & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Charts Section (Left 2/3) */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gate Saturation Chart Card */}
                        <FadeIn delay={0.5} className="h-full">
                            <div className="glass-panel rounded-xl p-6 flex flex-col justify-between min-h-[300px] h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Gate Flow</h3>
                                        <p className="text-sm text-gray-400">Real-time entry velocity</p>
                                    </div>
                                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                        <span className="material-symbols-outlined">bar_chart</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center relative">
                                    <div className="relative w-40 h-40">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                            <motion.path
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: stats.total ? (stats.gate / stats.total) : 0 }}
                                                transition={{ duration: 2, ease: "easeOut" }}
                                                className="text-primary drop-shadow-[0_0_6px_rgba(242,166,13,0.6)]"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-white">{stats.total ? Math.round((stats.gate / stats.total) * 100) : 0}%</span>
                                            <span className="text-xs text-gray-400 font-medium uppercase">Processed</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#393328] pt-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Pending</p>
                                        <p className="text-lg font-bold text-gray-300">{stats.total - stats.gate}</p>
                                    </div>
                                    <div className="text-center border-l border-[#393328]">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Processed</p>
                                        <p className="text-lg font-bold text-primary">{stats.gate}</p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Hall Occupancy Chart Card */}
                        <FadeIn delay={0.6} className="h-full">
                            <div className="glass-panel rounded-xl p-6 flex flex-col justify-between min-h-[300px] h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Hall Occupancy</h3>
                                        <p className="text-sm text-gray-400">Seats filled vs Capacity</p>
                                    </div>
                                    <div className="bg-orange-500/10 text-orange-500 p-2 rounded-lg">
                                        <span className="material-symbols-outlined">pie_chart</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center relative">
                                    <div className="relative w-40 h-40">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                            <motion.path
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: stats.total ? (stats.hall / stats.total) : 0 }}
                                                transition={{ duration: 2, ease: "easeOut" }}
                                                className="text-orange-500"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-white">{stats.total ? Math.round((stats.hall / stats.total) * 100) : 0}%</span>
                                            <span className="text-xs text-gray-400 font-medium uppercase">Seated</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#393328] pt-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Available</p>
                                        <p className="text-lg font-bold text-gray-300">{stats.total - stats.hall}</p>
                                    </div>
                                    <div className="text-center border-l border-[#393328]">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Occupied</p>
                                        <p className="text-lg font-bold text-orange-400">{stats.hall}</p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Quick Actions & Recent Activity (Right 1/3) */}
                    <div className="flex flex-col gap-6">
                        {/* Quick Action Grid */}
                        <FadeIn delay={0.7}>
                            <div className="grid grid-cols-2 gap-3">
                                <ScaleIn delay={0.8}>
                                    <a href="/admin/teams" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-surface-dark border border-[#393328] hover:bg-surface-dark-lighter hover:border-primary/50 hover:shadow-[0_0_15px_rgba(242,166,13,0.15)] transition-all group h-full">
                                        <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-primary transition-colors">groups</span>
                                        <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wide">Teams</span>
                                    </a>
                                </ScaleIn>
                                <ScaleIn delay={0.9}>
                                    <a href="/scan/gate" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-surface-dark border border-[#393328] hover:bg-surface-dark-lighter hover:border-primary/50 hover:shadow-[0_0_15px_rgba(242,166,13,0.15)] transition-all group h-full">
                                        <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-primary transition-colors">qr_code_scanner</span>
                                        <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wide">Gate Scan</span>
                                    </a>
                                </ScaleIn>
                                <ScaleIn delay={1.0}>
                                    <a href="/scan/hall" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-surface-dark border border-[#393328] hover:bg-surface-dark-lighter hover:border-primary/50 hover:shadow-[0_0_15px_rgba(242,166,13,0.15)] transition-all group h-full">
                                        <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-primary transition-colors">domain_verification</span>
                                        <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wide">Hall Scan</span>
                                    </a>
                                </ScaleIn>
                                <ScaleIn delay={1.1}>
                                    <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-surface-dark border border-[#393328] hover:bg-surface-dark-lighter hover:border-primary/50 hover:shadow-[0_0_15px_rgba(242,166,13,0.15)] transition-all group h-full w-full">
                                        <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-primary transition-colors">download</span>
                                        <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wide">Export</span>
                                    </button>
                                </ScaleIn>
                            </div>
                        </FadeIn>
                        {/* Recent Activity Feed */}
                        <FadeIn delay={1.2} className="flex-1">
                            <div className="flex-1 rounded-xl bg-surface-dark border border-[#393328] overflow-hidden flex flex-col h-full min-h-[200px]">
                                <div className="px-5 py-4 border-b border-[#393328] flex justify-between items-center bg-surface-dark-lighter">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Feed</h3>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                </div>
                                <div className="p-2 overflow-y-auto max-h-[300px]">
                                    {/* Feed Item 1 */}
                                    <div className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-200 truncate">System Status</p>
                                            <p className="text-xs text-gray-500">Dashboard loaded successfully</p>
                                        </div>
                                        <span className="text-[10px] text-gray-600 font-mono">Now</span>
                                    </div>
                                </div>
                                <div className="p-3 border-t border-[#393328] text-center mt-auto">
                                    <a href="#" className="text-xs text-primary hover:text-white transition-colors">View Full Log</a>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>

                {/* Footer Info */}
                <footer className="mt-auto border-t border-[#393328] pt-6 pb-2 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
                    <p>© 2024 HackPortal System. Version 2.4.1</p>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <a href="#" className="hover:text-gray-400">Support</a>
                        <a href="#" className="hover:text-gray-400">Documentation</a>
                        <a href="#" className="hover:text-gray-400">Status</a>
                    </div>
                </footer>
            </main>
        </MotionWrapper>
    )
}
