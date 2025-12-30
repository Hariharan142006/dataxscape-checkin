"use client"

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
    role = 'ADMIN' // or 'VOLUNTEER'
}: {
    children: React.ReactNode;
    role?: string;
}) {
    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
            {/* Header */}
            <header className="border-b border-white/10 bg-neutral-900/50 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <img src="/LOGO1.png" alt="DataXscape Logo" className="w-10 h-10 object-contain" />
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-white leading-tight">DataXscape <span className="text-amber-500">2k26</span></h1>
                                <p className="text-xs text-neutral-400">Panimalar Engineering College</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4">
                        {role === 'ADMIN' && (
                            <>
                                <Link href="/admin/dashboard" className="text-sm font-medium hover:text-amber-500 transition">Dashboard</Link>
                                <Link href="/admin/teams" className="text-sm font-medium hover:text-amber-500 transition">Teams</Link>
                            </>
                        )}
                        <Link href="/scan/gate" className="text-sm font-medium hover:text-amber-500 transition">Gate</Link>
                        <Link href="/scan/hall" className="text-sm font-medium hover:text-amber-500 transition">Hall</Link>

                        <button onClick={async () => {
                            try {
                                await fetch('/api/auth/logout', { method: 'POST' });
                                window.location.href = '/login';
                            } catch (e) {
                                window.location.href = '/login';
                            }
                        }} className="ml-4 flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-full text-neutral-400 transition-colors group" title="Logout">
                            <span className="text-xs font-medium hidden md:block">Logout</span>
                            <LogOut size={16} />
                        </button>
                    </nav>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>

            <footer className="border-t border-white/10 py-6 text-center text-xs text-neutral-500">
                &copy; 2025 DataXscape. All rights reserved.
            </footer>
        </div>
    );
}
