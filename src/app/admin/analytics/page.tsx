'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { MotionWrapper, FadeIn } from '@/components/MotionWrapper';
import { CheckinTimeline, CollegeDistribution, TrackDistribution } from '@/components/AnalyticsCharts';
import { Button } from '@/components/ui/core';
import { ArrowLeft, RefreshCw, BarChart2, PieChart, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// ... (imports)
// Duplicate imports removed

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/analytics', { cache: 'no-store' });
            if (!res.ok) throw new Error("Failed to fetch analytics");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
            setError("Could not load analytics data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const totalCheckins = data?.timeline?.reduce((acc: number, curr: any) => acc + curr.checkins, 0) || 0;

    return (
        <DashboardLayout>
            <MotionWrapper className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Event Analytics</h1>
                            <p className="text-gray-400 mt-1">Deep dive into attendance trends and participation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 font-mono hidden md:block">
                            Last updated: {new Date().toLocaleTimeString()}
                        </div>
                        <Button onClick={fetchData} variant="outline" disabled={loading} className="border-[#393328] bg-surface-dark hover:bg-surface-dark-lighter">
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}

                {loading && !data ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                        <div className="h-40 bg-white/5 rounded-xl"></div>
                        <div className="h-40 bg-white/5 rounded-xl"></div>
                        <div className="h-40 bg-white/5 rounded-xl"></div>
                        <div className="h-96 bg-white/5 rounded-xl md:col-span-3"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FadeIn delay={0.1}>
                                <div className="bg-surface-dark border border-[#393328] p-6 rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                                        <TrendingUp className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Check-ins</p>
                                        <h3 className="text-3xl font-bold text-white">{totalCheckins}</h3>
                                    </div>
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.2}>
                                <div className="bg-surface-dark border border-[#393328] p-6 rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                                        <BarChart2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Peak Hour</p>
                                        <h3 className="text-3xl font-bold text-white">09:00 AM</h3>
                                    </div>
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.3}>
                                <div className="bg-surface-dark border border-[#393328] p-6 rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Colleges</p>
                                        <h3 className="text-3xl font-bold text-white">{data?.colleges?.length || 0}</h3>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>

                        {/* Row 1: Timeline */}
                        <FadeIn delay={0.4} className="bg-surface-dark border border-[#393328] p-6 rounded-xl shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <span className="material-symbols-outlined text-[120px]">timeline</span>
                            </div>
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                    <BarChart2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Check-in Trends</h3>
                                    <p className="text-xs text-gray-500">Hourly breakdown of arrivals</p>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <CheckinTimeline data={data?.timeline} />
                            </div>
                        </FadeIn>

                        {/* Row 2: Distributions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FadeIn delay={0.5} className="bg-surface-dark border border-[#393328] p-6 rounded-xl shadow-lg h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">College Participation</h3>
                                        <p className="text-xs text-gray-500">Top attending institutions</p>
                                    </div>
                                </div>
                                <CollegeDistribution data={data?.colleges} />
                            </FadeIn>

                            <FadeIn delay={0.6} className="bg-surface-dark border border-[#393328] p-6 rounded-xl shadow-lg h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Track Distribution</h3>
                                        <p className="text-xs text-gray-500">Teams classification by track</p>
                                    </div>
                                </div>
                                <TrackDistribution data={data?.tracks} />
                            </FadeIn>
                        </div>
                    </div>
                )}
            </MotionWrapper>
        </DashboardLayout>
    );
}
