'use client';

import { callService } from '@/services/callService';
import { CallLog, LeadStats, leadService } from '@/services/leadService';
import { userService } from '@/services/userService';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, FileSpreadsheet, Filter, Phone, PhoneMissed, PhoneOutgoing, Search, User, UserPlus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { formatPhoneNumber } from '@/utils/phoneFormat';

export default function CallsPage() {
    const [calls, setCalls] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [users, setUsers] = useState<{ id: string, name: string }[]>([]);
    const [assignedToFilter, setAssignedToFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agentFilterSearch, setAgentFilterSearch] = useState('');
    const [agentEditSearch, setAgentEditSearch] = useState('');
    const [updatingAgent, setUpdatingAgent] = useState<string | null>(null);
    const [activeRowDropdown, setActiveRowDropdown] = useState<string | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Stats
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
        last7DaysCalls: []
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [mobileUsers, statsRes] = await Promise.all([
                    userService.getUsers(),
                    leadService.getStats()
                ]);
                // Ensure name is always a string for CallLog compatibility
                const formattedUsers = mobileUsers.map(u => ({
                    id: u.id,
                    name: u.name || u.username || 'Unknown User'
                }));
                setUsers(formattedUsers);
                setStats(statsRes);
            } catch (e) { console.error('Failed to load initial data', e); }
        };
        loadInitialData();
    }, []);

    const fetchCalls = React.useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number | undefined> = {
                page,
                limit,
            };
            if (dateRange.start) params.startDate = dateRange.start;
            if (dateRange.end) params.endDate = dateRange.end;
            if (assignedToFilter !== 'all') params.assignedToId = assignedToFilter;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;

            const res = await callService.getCallLogs(params);
            setCalls(res.data);
            setTotal(res.total);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, dateRange, assignedToFilter, statusFilter, searchTerm]);

    useEffect(() => {
        fetchCalls();
    }, [fetchCalls]);

    const handleExport = async () => {
        try {
            toast.loading('Exporting...', { id: 'export' });
            const params: Record<string, string | undefined> = {};
            if (dateRange.start) params.startDate = dateRange.start;
            if (dateRange.end) params.endDate = dateRange.end;
            if (assignedToFilter !== 'all') params.assignedToId = assignedToFilter;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;

            await callService.exportCallLogs(params);
            toast.success('Exported successfully', { id: 'export' });
        } catch (error) {
            console.error('Export failed', error);
            toast.error('Export failed', { id: 'export' });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
            if (activeRowDropdown && !(event.target as HTMLElement).closest('.agent-dropdown-container')) {
                setActiveRowDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeRowDropdown]);

    useEffect(() => {
        if (!isDropdownOpen) setAgentFilterSearch('');
    }, [isDropdownOpen]);

    useEffect(() => {
        if (!activeRowDropdown) setAgentEditSearch('');
    }, [activeRowDropdown]);

    const handleAgentChange = async (callId: string, newAgentId: string) => {
        try {
            setUpdatingAgent(callId);
            await callService.updateCallLogAgent(callId, newAgentId);

            setCalls(prev => prev.map(c =>
                c.id === callId
                    ? { ...c, caller: newAgentId === 'unassigned' ? undefined : (users.find(u => u.id === newAgentId) || c.caller) }
                    : c
            ));

            toast.success('Agent updated successfully');
            setActiveRowDropdown(null);
        } catch (error) {
            console.error('Error updating agent:', error);
            toast.error('Failed to update agent');
        } finally {
            setUpdatingAgent(null);
        }
    };



    const statusOptions = [
        'NEW', 'CONTACTED', 'ASSIGNED', 'FOLLOW_UP', 'NOT_INTERESTED', 'NOT_ANSWERED', 'WRONG_NUMBER', 'INVALID', 'SERVICE_NOT_NEEDED', 'COMPLETED', 'CLOSED', 'RECALL'
    ];

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Call Leads</h1>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-cyan-50 rounded-lg">
                        <PhoneOutgoing className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Today Calls</p>
                        <p className="text-xl font-bold text-gray-900">{stats.todayCalls}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Calls</p>
                        <p className="text-xl font-bold text-gray-900">{stats.totalCalls}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-lg">
                        <UserPlus className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Assigned</p>
                        <p className="text-xl font-bold text-gray-900">{stats.assignedCalls}</p>
                    </div>
                </div>
            </div>

            {/* Filters & Actions Area */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-4 items-end">

                    {/* Search - Primary Action */}
                    <div className="flex flex-col gap-1.5 flex-grow min-w-[280px]">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Search Phone</label>
                        <div className="relative group/search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/search:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search phone number..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/20 transition-all text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="flex flex-col gap-1.5 flex-grow lg:flex-grow-0">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Date Range</label>
                        <div className="flex items-center gap-2.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 group/date">
                            <Calendar className="h-4 w-4 text-gray-400 group-focus-within/date:text-primary transition-colors shrink-0" />
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="date"
                                    className="bg-transparent border-none p-0 text-xs text-gray-800 focus:ring-0 w-[115px] font-bold"
                                    value={dateRange.start}
                                    onChange={(e) => {
                                        setDateRange(prev => ({ ...prev, start: e.target.value }));
                                        setPage(1);
                                    }}
                                />
                                <span className="text-gray-300 text-xs font-black select-none">—</span>
                                <input
                                    type="date"
                                    className="bg-transparent border-none p-0 text-xs text-gray-800 focus:ring-0 w-[115px] font-bold"
                                    value={dateRange.end}
                                    onChange={(e) => {
                                        setDateRange(prev => ({ ...prev, end: e.target.value }));
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-col gap-1.5 flex-grow sm:flex-grow-0 sm:min-w-[160px]" ref={statusDropdownRef}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Lead Status</label>
                        <div className="relative group/status">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Filter className="h-4 w-4 text-gray-400 group-focus-within/status:text-primary transition-colors" />
                            </div>
                            <button
                                className={`w-full flex items-center justify-between pl-10 pr-3 py-2.5 border rounded-xl text-xs font-black transition-all ${isStatusDropdownOpen ? 'bg-white border-primary shadow-lg shadow-primary/5 text-primary' : 'bg-gray-50/50 border-gray-100 text-gray-600 hover:border-gray-200'
                                    }`}
                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            >
                                <span className="truncate">{statusFilter === 'all' ? 'All Leads' : statusFilter}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isStatusDropdownOpen ? 'rotate-180' : 'opacity-40'}`} />
                            </button>
                            {isStatusDropdownOpen && (
                                <div className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${statusFilter === 'all' ? 'text-primary font-black bg-primary/5' : 'text-gray-600 font-bold'}`}
                                        onClick={() => { setStatusFilter('all'); setIsStatusDropdownOpen(false); setPage(1); }}
                                    >
                                        All Status Types
                                    </button>
                                    <div className="h-px bg-gray-50 my-1 mx-3" />
                                    {statusOptions.map(opt => (
                                        <button
                                            key={opt}
                                            className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${statusFilter === opt ? 'text-primary font-black bg-primary/5' : 'text-gray-600 font-bold'}`}
                                            onClick={() => { setStatusFilter(opt); setIsStatusDropdownOpen(false); setPage(1); }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Agent Filter */}
                    <div className="flex flex-col gap-1.5 flex-grow sm:flex-grow-0 sm:min-w-[180px]" ref={dropdownRef}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Assigned To</label>
                        <div className="relative group/agent">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <User className="h-4 w-4 text-gray-400 group-focus-within/agent:text-primary transition-colors" />
                            </div>
                            <button
                                className={`w-full flex items-center justify-between pl-10 pr-3 py-2.5 border rounded-xl text-xs font-black transition-all ${isDropdownOpen ? 'bg-white border-primary shadow-lg shadow-primary/5 text-primary' : 'bg-gray-50/50 border-gray-100 text-gray-600 hover:border-gray-200'
                                    }`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className="truncate">{assignedToFilter === 'all' ? 'All Agents' : assignedToFilter === 'unassigned' ? 'Unassigned' : users.find(u => u.id === assignedToFilter)?.name || 'Select Agent'}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'opacity-40'}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 pb-2 mb-2 border-b border-gray-50">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search agents..."
                                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                                                value={agentFilterSearch}
                                                onChange={(e) => setAgentFilterSearch(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-56 overflow-y-auto custom-scrollbar">
                                        {!agentFilterSearch && (
                                            <>
                                                <button
                                                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${assignedToFilter === 'all' ? 'text-primary font-black bg-primary/5' : 'text-gray-600 font-bold'}`}
                                                    onClick={() => { setAssignedToFilter('all'); setIsDropdownOpen(false); setPage(1); }}
                                                >
                                                    All Agents
                                                </button>
                                                <button
                                                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${assignedToFilter === 'unassigned' ? 'text-primary font-black bg-primary/5' : 'text-gray-600 font-bold'}`}
                                                    onClick={() => { setAssignedToFilter('unassigned'); setIsDropdownOpen(false); setPage(1); }}
                                                >
                                                    Unassigned
                                                </button>
                                                <div className="h-px bg-gray-50 my-1 mx-3" />
                                            </>
                                        )}
                                        {users.filter(u => u.name.toLowerCase().includes(agentFilterSearch.toLowerCase())).map(u => (
                                            <button
                                                key={u.id}
                                                className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${assignedToFilter === u.id ? 'text-primary font-black bg-primary/5' : 'text-gray-600 font-bold'}`}
                                                onClick={() => { setAssignedToFilter(u.id); setIsDropdownOpen(false); setPage(1); }}
                                            >
                                                {u.name}
                                                {assignedToFilter === u.id && <Check className="h-3 w-3" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Export - Primary Action */}
                    <div className="flex-none items-end">
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2.5 px-6 py-3 bg-[#00a651] text-white rounded-xl hover:bg-[#008d45] hover:shadow-green-500/20 active:scale-[0.98] transition-all shadow-lg shadow-green-600/10 font-black text-[10px] uppercase tracking-widest leading-none h-[46px]"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Export Results</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
                <div className="overflow-visible max-lg:overflow-x-auto min-h-[300px] pb-24">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lead ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Agent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-gray-50 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : calls.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Phone className="h-8 w-8 text-gray-400" />
                                            <p className="text-sm font-medium text-gray-500">No call leads found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                calls.map((call) => (
                                    <tr key={call.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                            {call.lead?.serialId ? `LD-${String(call.lead.serialId).padStart(5, '0')}` : '----'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">{formatPhoneNumber(call.phoneNumber)}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {call.lead?.name || 'Customer Name'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-gray-700">{format(new Date(call.createdAt), 'MMM d, yyyy')}</span>
                                                <span className="text-[10px] text-gray-400">{format(new Date(call.createdAt), 'hh:mm a')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {call.lead?.status ? (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${call.lead.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                                                    call.lead.status === 'FOLLOW_UP' ? 'bg-amber-50 text-amber-600' :
                                                        call.lead.status === 'NEW' ? 'bg-blue-50 text-blue-600' :
                                                            call.lead.status === 'RECALL' ? 'bg-purple-50 text-purple-600' :
                                                                'bg-gray-50 text-gray-500'
                                                    }`}>
                                                    {call.lead.status}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 italic">Not Linked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${call.callType === 'INCOMING' ? 'text-blue-600' :
                                                    call.callType === 'MISSED' ? 'text-red-500' :
                                                        'text-purple-600'
                                                }`}>
                                                {call.callType === 'INCOMING' ? <ArrowDownLeft className="h-3 w-3" /> :
                                                    call.callType === 'MISSED' ? <PhoneMissed className="h-3 w-3" /> :
                                                        <ArrowUpRight className="h-3 w-3" />}
                                                {call.callType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 relative agent-dropdown-container">
                                            <div className="flex justify-start">
                                                <button
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 font-bold text-[10px] uppercase tracking-wider ${activeRowDropdown === call.id
                                                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                                                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                        }`}
                                                    onClick={() => setActiveRowDropdown(activeRowDropdown === call.id ? null : call.id)}
                                                    disabled={updatingAgent === call.id}
                                                >
                                                    <div className={`h-1.5 w-1.5 rounded-full ${(call.caller?.id || call.admin?.id) ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 'bg-gray-300'}`} />
                                                    <span className="truncate max-w-[100px]">
                                                        {updatingAgent === call.id ? '...' : (call.caller?.name || call.admin?.name || 'Unassigned')}
                                                    </span>
                                                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${activeRowDropdown === call.id ? 'rotate-180' : 'opacity-40'}`} />
                                                </button>
                                            </div>

                                            {activeRowDropdown === call.id && (
                                                <div className={`absolute ${calls.indexOf(call) > (calls.length / 2) ? 'bottom-full mb-2' : 'top-full mt-2'} left-6 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-200 ${calls.indexOf(call) > (calls.length / 2) ? 'origin-bottom-left' : 'origin-top-left'}`}>
                                                    <div className="px-4 py-2 border-b border-gray-50 mb-2 flex items-center gap-2">
                                                        <UserPlus className="h-3 w-3 text-primary" />
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Call Agent</p>
                                                    </div>
                                                    <div className="px-3 pb-2 mb-2 border-b border-gray-50">
                                                        <div className="relative">
                                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search agents..."
                                                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                                                                value={agentEditSearch}
                                                                onChange={(e) => setAgentEditSearch(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="px-2 space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                                                        {!agentEditSearch && (
                                                            <button
                                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all duration-200 group ${!call.caller?.id && !call.admin?.id
                                                                    ? 'bg-primary/5 text-primary font-bold'
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
                                                                    }`}
                                                                onClick={() => handleAgentChange(call.id, 'unassigned')}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`h-2 w-2 rounded-full transition-all ${!call.caller?.id && !call.admin?.id ? 'bg-primary scale-110' : 'bg-transparent border border-gray-200 group-hover:border-primary/40'}`} />
                                                                    <span>Unassigned</span>
                                                                </div>
                                                                {!call.caller?.id && !call.admin?.id && (
                                                                    <div className="bg-primary text-white p-0.5 rounded-md shadow-sm">
                                                                        <Check className="h-2.5 w-2.5" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        )}
                                                        {users.filter(u => u.name.toLowerCase().includes(agentEditSearch.toLowerCase())).map(u => (
                                                            <button
                                                                key={u.id}
                                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all duration-200 group ${call.caller?.id === u.id
                                                                    ? 'bg-primary/5 text-primary font-bold'
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
                                                                    }`}
                                                                onClick={() => handleAgentChange(call.id, u.id)}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`h-2 w-2 rounded-full transition-all ${call.caller?.id === u.id ? 'bg-primary scale-110' : 'bg-transparent border border-gray-200 group-hover:border-primary/40'}`} />
                                                                    <span>{u.name}</span>
                                                                </div>
                                                                {call.caller?.id === u.id && (
                                                                    <div className="bg-primary text-white p-0.5 rounded-md shadow-sm">
                                                                        <Check className="h-2.5 w-2.5" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-medium">
                            Showing <span className="text-gray-900 font-bold">{(page - 1) * limit + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(page * limit, total)}</span> of <span className="text-gray-900 font-bold">{total}</span> leads
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
