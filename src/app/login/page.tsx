"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("") // Added role state locally for UI matching, though API might infer it or we pass it
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (res.ok) {
                const data = await res.json()
                // Simple client-side redirect based on role
                // Normalize role to uppercase for comparison, or check both
                const role = data.user.role.toUpperCase();

                if (role === 'ADMIN') {
                    router.push('/admin/dashboard')
                } else if (role === 'HALL_VOLUNTEER' || role === 'VOLUNTEER') {
                    // Assuming 'volunteer' role goes to hall, or maybe gate?
                    // The 'else' block goes to gate.
                    // Let's check if there's a specific logic.
                    // For now, let's treat generic 'VOLUNTEER' as gate scan or hall based on need.
                    // If the user said "volunteer", let's dump them to gate for now as a safe default in the else,
                    // or if we want to be specific:
                    router.push('/scan/gate')
                } else {
                    router.push('/scan/gate')
                }
            } else {
                setError("Invalid credentials")
            }
        } catch (err) {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0 bg-background-dark pointer-events-none">
                <div className="absolute inset-0 bg-tech-grid bg-size-grid opacity-30"></div>
                <div className="stars-layer absolute inset-0 opacity-50 pointer-events-none"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Header with 3 Logos */}
            <header className="relative z-10 w-full px-8 py-6 flex justify-between items-center border-b border-white/5 bg-background-dark/50 backdrop-blur-sm">
                {/* College Logo Area */}
                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                    <img src="/pec-logo.png" alt="PEC Logo" className="h-12 w-auto object-contain" />
                </div>
                {/* Event Logo Center */}
                <div className="flex flex-col items-center justify-center">
                    <img src="/LOGO1.png" alt="DataXscape" className="h-16 w-auto object-contain" />
                </div>
                {/* Sponsor Logo Area */}
                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity justify-end">
                    <span className="text-sm font-medium text-white/60 hidden sm:block">Sponsored by</span>
                    <div className="h-10 w-auto px-3 rounded bg-white/10 flex items-center justify-center border border-white/5">
                        <span className="material-symbols-outlined text-white/50">rocket_launch</span>
                        <span className="ml-2 text-xs font-bold text-white/80">TECHCORP</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-12">
                {/* Login Card */}
                <div className="w-full max-w-[480px] flex flex-col gap-6">
                    {/* Card Container */}
                    <div className="bg-surface-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
                        {/* Decorative top line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                        {/* Heading */}
                        <div className="flex flex-col gap-2 mb-8 text-center">
                            <h1 className="text-3xl font-bold text-white tracking-tight">Staff Portal Access</h1>
                            <p className="text-[#bab09c] text-sm">Please sign in to manage teams and check-ins.</p>
                        </div>

                        {/* Form */}
                        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                            {/* Role Dropdown */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Select Role</label>
                                <div className="relative group input-glow rounded-lg transition-all duration-300">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-500">badge</span>
                                    </div>
                                    <select
                                        className="w-full pl-10 pr-10 py-3.5 bg-[#27231b] border border-[#544c3b] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option disabled value="">Choose your role</option>
                                        <option value="volunteer">Volunteer</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-500">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Username / Email</label>
                                <div className="relative group input-glow rounded-lg transition-all duration-300">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-500">mail</span>
                                    </div>
                                    <input
                                        className="w-full pl-10 pr-3 py-3.5 bg-[#27231b] border border-[#544c3b] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        type="text"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                                <div className="relative group input-glow rounded-lg transition-all duration-300">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-500">lock</span>
                                    </div>
                                    <input
                                        className="w-full pl-10 pr-3 py-3.5 bg-[#27231b] border border-[#544c3b] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                        placeholder="Enter your password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between mt-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input className="w-4 h-4 rounded border-[#544c3b] bg-[#27231b] text-primary focus:ring-primary/50 focus:ring-offset-0" type="checkbox" />
                                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                                </label>
                                <a className="text-sm text-primary hover:text-primary/80 transition-colors font-medium" href="#">Forgot password?</a>
                            </div>

                            {/* Error Message */}
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            {/* Submit Button */}
                            <button
                                className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-300 transform active:scale-[0.98] shadow-[0_0_20px_rgba(242,166,13,0.3)] hover:shadow-[0_0_30px_rgba(242,166,13,0.5)] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                <span>{loading ? "Logging in..." : "Login to Dashboard"}</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </form>
                    </div>

                    {/* Footer Meta */}
                    <div className="flex justify-center items-center gap-2 text-xs text-white/30">
                        <span className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            System Status: Online
                        </span>
                        <span>•</span>
                        <span>v2.4.0-stable</span>
                    </div>
                </div>
            </main>
        </div>
    )
}
