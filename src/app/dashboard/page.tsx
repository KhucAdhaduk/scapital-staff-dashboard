'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { leadService, LeadStats } from '@/services/leadService';
import { CheckCircle2, Clock, Phone, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function DashboardPage() {
    const [stats, setStats] = useState<LeadStats>({
        totalCalls: 0,
        completedLeads: 0,
        followUpLeads: 0,
        notAnsweredLeads: 0,
        closedLeads: 0,
        assignedCalls: 0,
        newLeads: 0,
        todayCalls: 0,
        invalidLeads: 0,
        last7DaysCalls: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await leadService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Calls', value: stats.totalCalls, icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Completed Leads', value: stats.completedLeads, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Follow-up Needed', value: stats.followUpLeads, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { title: 'Closed Leads', value: stats.closedLeads, icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
    ];

    if (loading) {
        return <div className="p-6 space-y-6 animate-pulse">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}
            </div>
            <div className="h-[400px] bg-gray-100 rounded-xl" />
        </div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((item, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                {item.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${item.bg}`}>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Lead Activity (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.last7DaysCalls || []}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="leads"
                                        stroke="#0C8281"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#0C8281', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Lead Funnel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Not Answered</span>
                            <span className="font-bold text-gray-900">{stats.notAnsweredLeads}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-red-400 h-full"
                                style={{ width: `${(stats.notAnsweredLeads / (stats.totalCalls || 1)) * 100}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center text-sm pt-2">
                            <span className="text-gray-500">Scheduled Follow-ups</span>
                            <span className="font-bold text-gray-900">{stats.followUpLeads}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-yellow-400 h-full"
                                style={{ width: `${(stats.followUpLeads / (stats.totalCalls || 1)) * 100}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center text-sm pt-2">
                            <span className="text-gray-500">Successfully Completed</span>
                            <span className="font-bold text-gray-900">{stats.completedLeads}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-green-500 h-full"
                                style={{ width: `${(stats.completedLeads / (stats.totalCalls || 1)) * 100}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
