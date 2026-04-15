'use client';

import { Lead, leadService } from '@/services/leadService';
import { useAppSelector } from '@/store/hooks';
import axios from '@/utils/axios';
import { formatPhoneNumber } from '@/utils/phoneFormat';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { Calendar, Check, ChevronDown, Edit2, Eye, Info, Phone, Search, Trash2, User, UserPlus, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
    { id: 'all', label: 'All Leads' },
    { id: 'NEW', label: 'New' },
    { id: 'FOLLOW_UP', label: 'follow up' },
    { id: 'COMPLETED', label: 'completed' },
    { id: 'NOT_INTERESTED', label: 'not interested' },
    { id: 'NO_ANSWER', label: 'no answer' },
    { id: 'CLOSED', label: 'closed' },
    { id: 'INVALID_WRONG', label: 'invalid/wrong' },
    { id: 'CALL_SUCCESS', label: 'call success' },
    { id: 'RECALL', label: 'Recall' },
];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);

    // Modal Form State
    const [newStatus, setNewStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAssignedToId, setEditAssignedToId] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [assignedToFilter, setAssignedToFilter] = useState('all');
    const [agentFilterSearch, setAgentFilterSearch] = useState('');
    const [agentEditSearch, setAgentEditSearch] = useState('');
    const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
    const [isOutcomeDropdownOpen, setIsOutcomeDropdownOpen] = useState(false);
    const [isAgentEditDropdownOpen, setIsAgentEditDropdownOpen] = useState(false);
    const agentDropdownRef = useRef<HTMLDivElement>(null);
    const outcomeDropdownRef = useRef<HTMLDivElement>(null);
    const agentEditDropdownRef = useRef<HTMLDivElement>(null);
    const [users, setUsers] = useState<{ id: string, name: string }[]>([]);

    // Row assignment state
    const [activeRowDropdown, setActiveRowDropdown] = useState<string | null>(null);
    const [updatingAgent, setUpdatingAgent] = useState<string | null>(null);
    const [rowAgentEditSearch, setRowAgentEditSearch] = useState('');


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
                setIsAgentDropdownOpen(false);
            }
            if (outcomeDropdownRef.current && !outcomeDropdownRef.current.contains(event.target as Node)) {
                setIsOutcomeDropdownOpen(false);
            }
            if (agentEditDropdownRef.current && !agentEditDropdownRef.current.contains(event.target as Node)) {
                setIsAgentEditDropdownOpen(false);
            }
            if (activeRowDropdown && !(event.target as HTMLElement).closest('.agent-dropdown-container')) {
                setActiveRowDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeRowDropdown]);

    useEffect(() => {
        if (!isAgentDropdownOpen) setAgentFilterSearch('');
    }, [isAgentDropdownOpen]);

    useEffect(() => {
        if (!isAgentEditDropdownOpen) setAgentEditSearch('');
    }, [isAgentEditDropdownOpen]);

    useEffect(() => {
        if (!activeRowDropdown) setRowAgentEditSearch('');
    }, [activeRowDropdown]);

    const handleAgentChange = async (leadId: string, newAgentId: string) => {
        try {
            setUpdatingAgent(leadId);
            await leadService.assignLead(leadId, newAgentId);

            setLeads(prev => prev.map(l => {
                if (l.id === leadId) {
                    const u = users.find(u => u.id === newAgentId);
                    return {
                        ...l,
                        assignedTo: newAgentId === 'unassigned' ? undefined : (u ? { id: u.id, name: u.name, email: '' } : l.assignedTo),
                        assignedToId: newAgentId === 'unassigned' ? null : newAgentId
                    };
                }
                return l;
            }));

            toast.success('Agent updated successfully');
            setActiveRowDropdown(null);
        } catch (error) {
            console.error('Error updating agent:', error);
            toast.error('Failed to update agent');
        } finally {
            setUpdatingAgent(null);
        }
    };

    const fetchLeads = React.useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string | undefined> = { status: activeTab === 'all' ? undefined : activeTab };
            if (dateRange.start) params.startDate = dateRange.start;
            if (dateRange.end) params.endDate = dateRange.end;
            if (assignedToFilter !== 'all') params.assignedToId = assignedToFilter;

            const data = await leadService.getLeads(params);
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, dateRange, assignedToFilter]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await axios.get('auth/users');
                setUsers(response.data);
            } catch (e) { console.error('Failed to load users', e); }
        };
        loadUsers();
        fetchLeads();
    }, [fetchLeads]);

    const handleUpdateStatus = async () => {
        if (!selectedLead) return;

        // Validation for exactly 10 digits
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(editPhone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        try {
            await leadService.updateStatus(selectedLead.id, {
                status: newStatus,
                name: editName,
                phoneNumber: editPhone,
                assignedToId: editAssignedToId || null,
                notes: notes,
                nextFollowUpAt: newStatus === 'FOLLOW_UP' ? (followUpDate || undefined) : undefined,
                userId: currentUser?.id
            });
            setIsStatusModalOpen(false);
            setNotes('');
            setFollowUpDate('');
            fetchLeads();
            toast.success('Lead updated successfully');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const msg = err.response?.data?.message || 'Failed to update lead';
            toast.error(typeof msg === 'string' ? msg : 'Failed to update lead');
        }
    };

    const openStatusModal = (lead: Lead) => {
        setSelectedLead(lead);
        setNewStatus(lead.status);
        setEditName(lead.name || '');
        setEditPhone(formatPhoneNumber(lead.phoneNumber));
        setEditAssignedToId(lead.assignedToId || '');
        setIsAgentEditDropdownOpen(false);
        setIsOutcomeDropdownOpen(false);
        setNotes(lead.notes || '');
        setIsStatusModalOpen(true);
    };

    const openViewModal = async (lead: Lead) => {
        try {
            setSelectedLead(lead);
            setIsViewModalOpen(true);
            setShowAllHistory(false);

            // Fetch latest lead data with call logs
            const fullLead = await leadService.getLead(lead.id);
            setSelectedLead({
                ...fullLead.lead,
                callLogs: fullLead.calllogs
            });
        } catch (error) {
            console.error('Failed to fetch lead details:', error);
            toast.error('Failed to load lead history');
        }
    };

    const openDeleteModal = (lead: Lead) => {
        setSelectedLead(lead);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteLead = async () => {
        if (!selectedLead) return;
        try {
            setIsDeleting(true);
            await leadService.deleteLead(selectedLead.id);
            toast.success('Lead deleted successfully');
            setIsDeleteModalOpen(false);
            fetchLeads();
        } catch (error) {
            console.error('Failed to delete lead:', error);
            toast.error('Failed to delete lead');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredLeads = leads.filter(lead =>
    (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phoneNumber.includes(searchTerm))
    );

    const handleExport = async () => {
        const XLSX = await import('xlsx');
        const rows = filteredLeads.map(lead => ({
            'Lead ID': lead.leadId || '----',
            'Lead Name': lead.name || 'Anonymous Lead',
            'Phone Number': lead.phoneNumber,
            'Status': lead.status.replace('_', ' '),
            'Call Time & Date': lead.lastCallAt ? format(new Date(lead.lastCallAt), 'MMM d, yyyy hh:mm a') : 'Never',
            'Next Follow-up': lead.nextFollowUpAt ? format(new Date(lead.nextFollowUpAt), 'MMM d, yyyy hh:mm a') : 'None',
            'Assigned Agent': lead.assignedTo?.name || 'Unassigned'
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

        XLSX.writeFile(workbook, `leads_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
                    <p className="text-sm text-gray-500">Track and manage your potential client interactions</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            'px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer',
                            activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search & Actions Area */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-4 items-end">

                    {/* Search - Primary Action */}
                    <div className="flex flex-col gap-1.5 flex-grow min-w-[280px]">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Search Database</label>
                        <div className="relative group/search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/search:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/20 transition-all text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="flex flex-col gap-1.5 flex-grow lg:flex-grow-0">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Filter by Date</label>
                        <div className="flex items-center gap-2.5 bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 group/date">
                            <Calendar className="h-4 w-4 text-gray-400 group-focus-within/date:text-primary transition-colors shrink-0" />
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="date"
                                    className="bg-transparent border-none p-0 text-xs text-gray-800 focus:ring-0 w-[115px] font-bold"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                />
                                <span className="text-gray-300 text-xs font-black select-none">—</span>
                                <input
                                    type="date"
                                    className="bg-transparent border-none p-0 text-xs text-gray-800 focus:ring-0 w-[115px] font-bold"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex flex-col gap-1.5 flex-grow sm:flex-grow-0 sm:min-w-[180px]" ref={agentDropdownRef}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Lead Owner</label>
                        <div className="relative group/agent">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <User className="h-4 w-4 text-gray-400 group-focus-within/agent:text-primary transition-colors" />
                            </div>
                            <button
                                className={`w-full flex items-center justify-between pl-10 pr-3 py-2.5 border rounded-xl text-xs font-black transition-all ${isAgentDropdownOpen ? 'bg-white border-primary shadow-lg shadow-primary/5 text-primary' : 'bg-gray-50/50 border-gray-100 text-gray-600 hover:border-gray-200'
                                    }`}
                                onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                            >
                                <span className="truncate">{assignedToFilter === 'all' ? 'All Personnel' : assignedToFilter === 'unassigned' ? 'Unassigned' : users.find(u => u.id === assignedToFilter)?.name || 'Select Agent'}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isAgentDropdownOpen ? 'rotate-180' : 'opacity-40'}`} />
                            </button>
                            {isAgentDropdownOpen && (
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
                                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${assignedToFilter === 'all' ? 'text-primary font-black bg-primary/5' : 'text-gray-600 font-bold'}`}
                                                    onClick={() => { setAssignedToFilter('all'); setIsAgentDropdownOpen(false); }}
                                                >
                                                    All Team Members
                                                </button>
                                                <button
                                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${assignedToFilter === 'unassigned' ? 'text-primary font-black bg-primary/5' : 'text-gray-600 font-bold'}`}
                                                    onClick={() => { setAssignedToFilter('unassigned'); setIsAgentDropdownOpen(false); }}
                                                >
                                                    Unassigned
                                                </button>
                                                <div className="h-px bg-gray-50 my-1 mx-3" />
                                            </>
                                        )}
                                        {users.filter(u => u.name.toLowerCase().includes(agentFilterSearch.toLowerCase())).map(u => (
                                            <button
                                                key={u.id}
                                                className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${assignedToFilter === u.id ? 'text-primary font-black bg-primary/5' : 'text-gray-600 font-bold'}`}
                                                onClick={() => { setAssignedToFilter(u.id); setIsAgentDropdownOpen(false); }}
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

            {/* Leads Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible flex flex-col">
                <div className="overflow-visible max-lg:overflow-x-auto min-h-[300px] pb-24">
                    <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="w-[10%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lead ID</th>
                                <th className="w-[20%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lead Details</th>
                                <th className="w-[14%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="w-[18%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Call Time & Date</th>
                                <th className="w-[14%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next Follow-up</th>
                                <th className="w-[14%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Agent</th>
                                <th className="w-[10%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                                        <Info className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No leads found matching your criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map(lead => (
                                    <tr key={lead.id} className="group hover:bg-indigo-50/30 transition-colors duration-150">
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                            {lead.leadId || '----'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {lead.name || 'Anonymous Lead'}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Phone className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500 font-medium">{formatPhoneNumber(lead.phoneNumber)}</span>
                                                    {lead.source && (
                                                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                                            {lead.source}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                lead.status === 'NEW' ? 'bg-blue-50 text-blue-600' :
                                                    lead.status === 'FOLLOW_UP' ? 'bg-amber-50 text-amber-600' :
                                                        lead.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                                                            lead.status === 'NO_ANSWER' ? 'bg-slate-50 text-slate-600' :
                                                                lead.status === 'INVALID_WRONG' ? 'bg-rose-50 text-rose-600' :
                                                                    lead.status === 'RECALL' ? 'bg-purple-50 text-purple-600' :
                                                                        'bg-gray-100 text-gray-600'
                                            )}>
                                                {lead.status === 'NEW' ? 'New' :
                                                    lead.status === 'FOLLOW_UP' ? 'follow up' :
                                                        lead.status === 'COMPLETED' ? 'completed' :
                                                            lead.status === 'NOT_INTERESTED' ? 'not interested' :
                                                                lead.status === 'NO_ANSWER' ? 'no answer' :
                                                                    lead.status === 'CLOSED' ? 'closed' :
                                                                        lead.status === 'INVALID_WRONG' ? 'invalid/wrong' :
                                                                            lead.status === 'CALL_SUCCESS' ? 'call success' :
                                                                                lead.status === 'RECALL' ? 'Recall' :
                                                                                    lead.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-xs text-gray-600">
                                            {lead.lastCallAt ? (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-bold">{format(new Date(lead.lastCallAt), 'MMM d, yyyy')}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">at {format(new Date(lead.lastCallAt), 'hh:mm a')}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 italic">Never</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.nextFollowUpAt ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-indigo-600">
                                                        {format(new Date(lead.nextFollowUpAt), 'MMM d')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        at {format(new Date(lead.nextFollowUpAt), 'hh:mm a')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 relative agent-dropdown-container">
                                            <div className="flex justify-start">
                                                <button
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 font-bold text-[10px] uppercase tracking-wider ${activeRowDropdown === lead.id
                                                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                                                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                        }`}
                                                    onClick={() => setActiveRowDropdown(activeRowDropdown === lead.id ? null : lead.id)}
                                                    disabled={updatingAgent === lead.id}
                                                >
                                                    <div className={`h-1.5 w-1.5 rounded-full ${lead.assignedTo?.id ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 'bg-gray-300'}`} />
                                                    <span className="truncate max-w-[100px]">
                                                        {updatingAgent === lead.id ? '...' : (lead.assignedTo?.name || 'Unassigned')}
                                                    </span>
                                                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${activeRowDropdown === lead.id ? 'rotate-180' : 'opacity-40'}`} />
                                                </button>
                                            </div>

                                            {activeRowDropdown === lead.id && (
                                                <div className={`absolute ${filteredLeads.indexOf(lead) > (filteredLeads.length / 2) ? 'bottom-full mb-2' : 'top-full mt-2'} left-6 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-200 ${filteredLeads.indexOf(lead) > (filteredLeads.length / 2) ? 'origin-bottom-left' : 'origin-top-left'}`}>
                                                    <div className="px-4 py-2 border-b border-gray-50 mb-2 flex items-center gap-2">
                                                        <UserPlus className="h-3 w-3 text-primary" />
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Agent</p>
                                                    </div>
                                                    <div className="px-3 pb-2 mb-2 border-b border-gray-50">
                                                        <div className="relative">
                                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search agents..."
                                                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                                                                value={rowAgentEditSearch}
                                                                onChange={(e) => setRowAgentEditSearch(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="px-2 space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                                                        {!rowAgentEditSearch && (
                                                            <button
                                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all duration-200 group ${!lead.assignedTo?.id
                                                                    ? 'bg-primary/5 text-primary font-bold'
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
                                                                    }`}
                                                                onClick={() => handleAgentChange(lead.id, 'unassigned')}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`h-2 w-2 rounded-full transition-all ${!lead.assignedTo?.id ? 'bg-primary scale-110' : 'bg-transparent border border-gray-200 group-hover:border-primary/40'}`} />
                                                                    <span>Unassigned</span>
                                                                </div>
                                                                {!lead.assignedTo?.id && (
                                                                    <div className="bg-primary text-white p-0.5 rounded-md shadow-sm">
                                                                        <Check className="h-2.5 w-2.5" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        )}
                                                        {users.filter(u => u.name.toLowerCase().includes(rowAgentEditSearch.toLowerCase())).map(u => (
                                                            <button
                                                                key={u.id}
                                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all duration-200 group ${lead.assignedTo?.id === u.id
                                                                    ? 'bg-primary/5 text-primary font-bold'
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
                                                                    }`}
                                                                onClick={() => handleAgentChange(lead.id, u.id)}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`h-2 w-2 rounded-full transition-all ${lead.assignedTo?.id === u.id ? 'bg-primary scale-110' : 'bg-transparent border border-gray-200 group-hover:border-primary/40'}`} />
                                                                    <span>{u.name}</span>
                                                                </div>
                                                                {lead.assignedTo?.id === u.id && (
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
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openViewModal(lead)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openStatusModal(lead)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(lead)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Lead Modal */}
            {isViewModalOpen && selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-600" />
                                Lead Details
                            </h2>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Profile Header - Simplified */}
                            <div className="flex items-center justify-between bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Lead ID</label>
                                    <p className="text-lg font-mono font-bold text-gray-900 tracking-tight">{selectedLead.leadId || '----'}</p>
                                </div>
                                <div className="h-10 w-px bg-gray-200" />
                                <div className="space-y-1 text-right">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Phone Number</label>
                                    <p className="text-lg font-bold text-indigo-600 tracking-tight">{formatPhoneNumber(selectedLead.phoneNumber)}</p>
                                </div>
                            </div>

                            {/* Lead Information & Notes */}
                            {selectedLead.notes && selectedLead.notes.trim() && (
                                <div className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-6 w-1 bg-amber-400 rounded-full" />
                                        <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">General Lead Notes</h4>
                                    </div>
                                    <p className="text-sm font-medium text-amber-900/80 leading-relaxed italic">
                                        &quot;{selectedLead.notes.trim()}&quot;
                                    </p>
                                </div>
                            )}

                            {/* Call & Interaction History */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-[#1a1a1a]">Call History</h3>
                                    {selectedLead.callLogs && selectedLead.callLogs.length > 3 && (
                                        <button
                                            onClick={() => setShowAllHistory(!showAllHistory)}
                                            className="text-sm font-bold text-[#00695c] hover:underline"
                                        >
                                            {showAllHistory ? 'Show Less' : 'View All'}
                                        </button>
                                    )}
                                </div>

                                <div className="relative pl-10 space-y-8">
                                    {/* Continuous Vertical Line from mockup */}
                                    <div className="absolute left-[15.5px] top-4 bottom-4 w-[1px] bg-[#e5e7eb]" />

                                    {/* Call Logs History */}
                                    {selectedLead.callLogs && selectedLead.callLogs.length > 0 ? (
                                        (showAllHistory ? selectedLead.callLogs : selectedLead.callLogs.slice(0, 3)).map((log, index) => {
                                            const date = new Date(log.createdAt);
                                            let dateLabel = format(date, 'MMM d');
                                            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                                            const isYesterday = format(date, 'yyyy-MM-dd') === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

                                            if (isToday) dateLabel = 'Today';
                                            else if (isYesterday) dateLabel = 'Yesterday';

                                            let dotColor = 'bg-[#556980]'; // Default Slate
                                            let ringColor = 'bg-[#f0f4f8]';
                                            let resultColor = 'text-[#556980]';
                                            let title = 'Interaction';

                                            const outcome = log.outcome?.toUpperCase() || '';
                                            if (outcome.includes('COMPLETED') || outcome.includes('CALL_SUCCESSFUL') || outcome.includes('INTERESTED') || outcome.includes('CLOSED')) {
                                                dotColor = 'bg-[#00695c]';
                                                ringColor = 'bg-[#e0f2f1]';
                                                title = outcome.includes('CALL_SUCCESSFUL') ? 'Successful Call' : 'Completed';
                                                resultColor = 'text-[#00695c]';
                                            } else if (
                                                outcome.includes('NO ANSWER') ||
                                                outcome.includes('NO_ANSWER') ||
                                                outcome.includes('NOT_ANSWERED') ||
                                                outcome.includes('BUSY') ||
                                                outcome.includes('WRONG_NUMBER') ||
                                                outcome.includes('REJECTED')
                                            ) {
                                                dotColor = 'bg-[#d32f2f]';
                                                ringColor = 'bg-[#feecec]';
                                                title = outcome.includes('WRONG_NUMBER') ? 'Invalid Number' : 'No Answer';
                                                resultColor = 'text-[#556980]';
                                            } else if (outcome.includes('FOLLOW_UP') || outcome.includes('CALL_AFTER_1H') || outcome.includes('CALL_TOMORROW')) {
                                                dotColor = 'bg-[#f59e0b]'; // Amber
                                                ringColor = 'bg-[#fef3c7]';
                                                title = 'Follow-up Scheduled';
                                                resultColor = 'text-[#b45309]';
                                            } else if (log.callType === 'MISSED' || outcome.includes('MISSED')) {
                                                dotColor = 'bg-[#ef4444]'; // Red
                                                ringColor = 'bg-[#fee2e2]';
                                                title = 'Missed Call';
                                                resultColor = 'text-[#b91c1c]';
                                            } else if (log.callType === 'INCOMING') {
                                                dotColor = 'bg-[#3b82f6]'; // Blue
                                                ringColor = 'bg-[#dbeafe]';
                                                title = 'Incoming Call';
                                                resultColor = 'text-[#1e40af]';
                                            } else if (log.callType === 'OUTGOING') {
                                                dotColor = 'bg-[#8b5cf6]'; // Purple
                                                ringColor = 'bg-[#f3e8ff]';
                                                title = 'Outgoing Call';
                                                resultColor = 'text-[#6d28d9]';
                                            } else {
                                                dotColor = 'bg-[#64748b]';
                                                ringColor = 'bg-[#f1f5f9]';
                                                title = 'Interaction';
                                                resultColor = 'text-[#475569]';
                                            }

                                            return (
                                                <div key={log.id || index} className="relative group">
                                                    {/* Status Indicator Dot & Ring */}
                                                    <div className={`absolute -left-[35px] top-4 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center ${ringColor} transition-transform duration-200 group-hover:scale-110`}>
                                                        <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                                                    </div>

                                                    <div className="space-y-1 py-1">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-sm font-bold text-[#1a1a1a] tracking-tight">{title}</span>
                                                            <span className="text-[11px] font-medium text-[#9ca3af]">
                                                                {dateLabel}, {format(date, 'h:mm a')}
                                                            </span>
                                                            {log.admin || log.caller ? (
                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                    by {(log.admin || log.caller)?.name}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm leading-snug">
                                                                <span className="font-bold text-[#1a1a1a]">Result:</span> <span className={`${resultColor} font-medium tracking-tight`}>{log.outcome?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Interaction recorded.'}</span>
                                                            </p>
                                                            {log.notes && log.notes.trim() && !log.notes.startsWith('Outcome set to') && (
                                                                <p className="text-xs leading-snug text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100/50 mt-1.5 flex flex-col gap-1">
                                                                    <span className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Notes</span>
                                                                    <span className="font-medium italic">&quot;{log.notes.trim()}&quot;</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute -left-[35px] top-1 h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                <div className="h-3 w-3 rounded-full bg-gray-200" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-400 pl-2 py-1.5">No call history recorded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50/80 flex justify-end border-t border-gray-100">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-8 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Edit2 className="h-5 w-5 text-indigo-600" />
                                Edit Lead: {selectedLead?.leadId || '----'}
                            </h2>
                            <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Lead Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 bg-white"
                                        placeholder="Lead Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={editPhone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setEditPhone(val);
                                        }}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 bg-white"
                                        placeholder="10-digit number"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Outcome Status</label>
                                    <div className="relative" ref={outcomeDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsOutcomeDropdownOpen(!isOutcomeDropdownOpen)}
                                            className="w-full flex items-center justify-between border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 bg-white transition-all hover:border-gray-300"
                                        >
                                            <span>{newStatus ? newStatus.replace('_', ' ') : 'Select Status'}</span>
                                            <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform duration-200", isOutcomeDropdownOpen && "rotate-180")} />
                                        </button>

                                        {isOutcomeDropdownOpen && (
                                            <div className="absolute z-[60] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top max-h-48 overflow-y-auto custom-scrollbar">
                                                {[
                                                    { id: 'NEW', label: 'New' },
                                                    { id: 'FOLLOW_UP', label: 'follow up' },
                                                    { id: 'COMPLETED', label: 'completed' },
                                                    { id: 'NOT_INTERESTED', label: 'not interested' },
                                                    { id: 'NO_ANSWER', label: 'no answer' },
                                                    { id: 'CLOSED', label: 'closed' },
                                                    { id: 'INVALID_WRONG', label: 'invalid/wrong' },
                                                    { id: 'CALL_SUCCESS', label: 'call success' },
                                                    { id: 'RECALL', label: 'Recall' }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewStatus(opt.id);
                                                            setIsOutcomeDropdownOpen(false);
                                                        }}
                                                        className={clsx(
                                                            "w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between",
                                                            newStatus === opt.id ? "bg-indigo-50 text-indigo-600 font-bold" : "text-gray-700 hover:bg-gray-50"
                                                        )}
                                                    >
                                                        {opt.label}
                                                        {newStatus === opt.id && <Check className="h-4 w-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Assigned Agent</label>
                                    <div className="relative" ref={agentEditDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsAgentEditDropdownOpen(!isAgentEditDropdownOpen)}
                                            className="w-full flex items-center justify-between border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 bg-white transition-all hover:border-gray-300"
                                        >
                                            <span>{editAssignedToId ? users.find(u => u.id === editAssignedToId)?.name : 'Unassigned'}</span>
                                            <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform duration-200", isAgentEditDropdownOpen && "rotate-180")} />
                                        </button>

                                        {isAgentEditDropdownOpen && (
                                            <div className="absolute z-[60] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top">
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
                                                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                    {!agentEditSearch && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditAssignedToId('');
                                                                setIsAgentEditDropdownOpen(false);
                                                            }}
                                                            className={clsx(
                                                                "w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between",
                                                                !editAssignedToId ? "bg-indigo-50 text-indigo-600 font-bold" : "text-gray-700 hover:bg-gray-50"
                                                            )}
                                                        >
                                                            Unassigned
                                                            {!editAssignedToId && <Check className="h-4 w-4" />}
                                                        </button>
                                                    )}
                                                    {users.filter(u => u.name.toLowerCase().includes(agentEditSearch.toLowerCase())).map((user) => (
                                                        <button
                                                            key={user.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditAssignedToId(user.id);
                                                                setIsAgentEditDropdownOpen(false);
                                                            }}
                                                            className={clsx(
                                                                "w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between",
                                                                editAssignedToId === user.id ? "bg-indigo-50 text-indigo-600 font-bold" : "text-gray-700 hover:bg-gray-50"
                                                            )}
                                                        >
                                                            {user.name}
                                                            {editAssignedToId === user.id && <Check className="h-4 w-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {newStatus === 'FOLLOW_UP' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Follow-up Date</label>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <button
                                            onClick={() => {
                                                const d = new Date();
                                                d.setHours(d.getHours() + 1);
                                                setFollowUpDate(format(d, "yyyy-MM-dd'T'HH:mm"));
                                            }}
                                            className="text-[10px] py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 font-bold transition-colors"
                                        >
                                            +1 HOUR
                                        </button>
                                        <button
                                            onClick={() => {
                                                const d = new Date();
                                                d.setDate(d.getDate() + 1);
                                                d.setHours(10, 0, 0, 0);
                                                setFollowUpDate(format(d, "yyyy-MM-dd'T'HH:mm"));
                                            }}
                                            className="text-[10px] py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 font-bold transition-colors"
                                        >
                                            TOMORROW 10AM
                                        </button>
                                        <button
                                            onClick={() => {
                                                const d = new Date();
                                                d.setHours(17, 0, 0, 0);
                                                setFollowUpDate(format(d, "yyyy-MM-dd'T'HH:mm"));
                                            }}
                                            className="text-[10px] py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 font-bold transition-colors"
                                        >
                                            LATER TODAY
                                        </button>
                                    </div>
                                    <input
                                        type="datetime-local"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 bg-white"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Interaction Notes</label>
                                <textarea
                                    rows={4}
                                    placeholder="Add details about the conversation..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none text-gray-900 placeholder:text-gray-400 bg-white"
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50/80 flex justify-end gap-3 border-t border-gray-100">
                            <button
                                onClick={() => setIsStatusModalOpen(false)}
                                className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Lead?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete lead for <span className="font-bold text-gray-900">{selectedLead?.name || formatPhoneNumber(selectedLead?.phoneNumber || '')}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteLead}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-100 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Additional missing icons
const FileSpreadsheet = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M8 13h2" />
        <path d="M8 17h2" />
        <path d="M10 13h2" />
        <path d="M10 17h2" />
        <path d="M12 13h2" />
        <path d="M12 17h2" />
        <path d="M14 13h2" />
        <path d="M14 17h2" />
    </svg>
);
