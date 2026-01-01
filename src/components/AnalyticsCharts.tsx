'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend,
    PieChart, Pie, Cell, Brush
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg shadow-xl">
                <p className="text-gray-300 font-medium mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {entry.name}: <span className="font-bold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function CheckinTimeline({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="p-4 text-center text-gray-500">No check-in data yet</div>;

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#666" fontSize={12} tickMargin={10} />
                    <YAxis allowDecimals={false} stroke="#666" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="checkins" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    <Brush dataKey="time" height={30} stroke="#2563eb" fill="#1e1e1e" tickFormatter={() => ''} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function CollegeDistribution({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="p-4 text-center text-gray-500">No college data available</div>;

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis type="number" stroke="#666" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: '#9ca3af' }} interval={0} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="total" name="Total Teams" fill="#64748b" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="checkedIn" name="Checked In" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TrackDistribution({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="p-4 text-center text-gray-500">No track data available</div>;

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                            const p = percent || 0;
                            return p > 0.05 ? `${name} ${(p * 100).toFixed(0)}%` : '';
                        }}
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="count"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function SparkLine({ data, color = "#2563eb" }: { data: any[], color?: string }) {
    return (
        <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={true} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
