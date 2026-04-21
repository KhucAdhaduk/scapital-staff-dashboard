'use client';

import { Lead, leadService } from '@/services/leadService';
import { LoanType, loanTypeService } from '@/services/loanTypeService';
import { useAppSelector } from '@/store/hooks';
import axios from '@/utils/axios';
import { formatPhoneNumber } from '@/utils/phoneFormat';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { Calendar, Check, ChevronDown, Download, Edit2, Eye, FileSpreadsheet, FileText, Info, Phone, Plus, Search, Trash2, User, UserPlus, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
    { id: 'all', label: 'All Leads' },
    { id: 'NEW', label: 'New' },
    { id: 'FOLLOW_UP', label: 'Follow Up' },
    { id: 'COMPLETED', label: 'Call Connected' },
    { id: 'NOT_INTERESTED', label: 'Not Interested' },
    { id: 'NO_ANSWER', label: 'No Answer' },
    { id: 'CLOSED', label: 'Closed' },
    { id: 'INVALID_WRONG', label: 'Invalid/Wrong' },
    { id: 'INTERESTED', label: 'Interested' },
    { id: 'RECALL', label: 'Recall' },
    { id: 'LOGIN', label: 'Login' },
    { id: 'SANCTIONED', label: 'Sanctioned' },
    { id: 'DISBURSEMENT', label: 'Disbursement' },
    { id: 'REJECT', label: 'Reject' },
    { id: 'DORMANT', label: 'Dormant' },
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
    const [statusRemark, setStatusRemark] = useState('');
    const [reminderDate, setReminderDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');
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
    const loanTypeDropdownRef = useRef<HTMLDivElement>(null);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const cibilDropdownRef = useRef<HTMLDivElement>(null);
    const [users, setUsers] = useState<{ id: string, name: string }[]>([]);
    const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
    const [editLoanTypeId, setEditLoanTypeId] = useState('');
    const [editLoanType, setEditLoanType] = useState('Other');
    const [editLoanTypeSearch, setEditLoanTypeSearch] = useState('');
    const [isLoanTypeDropdownOpen, setIsLoanTypeDropdownOpen] = useState(false);
    const [editProfile, setEditProfile] = useState('');
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [editCibilStatus, setEditCibilStatus] = useState('');
    const [editCibilRemark, setEditCibilRemark] = useState('');
    const [editCustomLoanType, setEditCustomLoanType] = useState('');
    const [isCibilDropdownOpen, setIsCibilDropdownOpen] = useState(false);

    // Row assignment state
    const [activeRowDropdown, setActiveRowDropdown] = useState<string | null>(null);
    const [updatingAgent, setUpdatingAgent] = useState<string | null>(null);
    const [rowAgentEditSearch, setRowAgentEditSearch] = useState('');

    // Create Lead Modal State
    const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);
    const [createLeadPhone, setCreateLeadPhone] = useState('');
    const [createLeadName, setCreateLeadName] = useState('');
    const [createLeadDate, setCreateLeadDate] = useState('');
    const [createLeadTime, setCreateLeadTime] = useState('');
    const [isCreatingLead, setIsCreatingLead] = useState(false);

    // Application Form State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedLeadForForm, setSelectedLeadForForm] = useState<Lead | null>(null);
    const [applicationFormData, setApplicationFormData] = useState<any>(null);
    const [isSavingForm, setIsSavingForm] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(false);


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
            if (loanTypeDropdownRef.current && !loanTypeDropdownRef.current.contains(event.target as Node)) {
                setIsLoanTypeDropdownOpen(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
            if (cibilDropdownRef.current && !cibilDropdownRef.current.contains(event.target as Node)) {
                setIsCibilDropdownOpen(false);
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
        const loadData = async () => {
            try {
                const [usersRes, loanTypesRes] = await Promise.all([
                    axios.get('v1/auth/users'),
                    loanTypeService.getLoanTypes()
                ]);
                setUsers(usersRes.data);
                setLoanTypes(loanTypesRes);
            } catch (e) { console.error('Failed to load initial data', e); }
        };
        loadData();
        fetchLeads();
    }, [fetchLeads]);

    const handleUpdateStatus = async () => {
        if (!selectedLead) return;

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(editPhone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            const updateData: any = {
                status: newStatus,
                name: editName,
                phoneNumber: editPhone,
                assignedToId: editAssignedToId === 'unassigned' ? null : editAssignedToId,
                loanTypeId: editLoanTypeId === 'unassigned' ? null : editLoanTypeId,
                notes: notes,
                statusRemark: statusRemark,
                profile: editProfile,
                cibilStatus: editCibilStatus,
                cibilRemark: editCibilRemark,
                loanType: editLoanType,
                customLoanType: editCustomLoanType,
                userId: currentUser?.id
            };

            if (newStatus === 'REJECT' && reminderDate) {
                const dateTime = reminderTime ? `${reminderDate}T${reminderTime}:00` : `${reminderDate}T00:00:00`;
                updateData.nextFollowUpAt = new Date(dateTime).toISOString();
            } else if (newStatus === 'FOLLOW_UP' || newStatus === 'RECALL') {
                updateData.nextFollowUpAt = followUpDate ? new Date(followUpDate).toISOString() : null;
            }

            const response = await leadService.updateStatus(selectedLead.id, updateData);
            const updatedLead = response as Lead;

            setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));

            if (isViewModalOpen) {
                await openViewModal(updatedLead);
            } else {
                setSelectedLead(updatedLead);
            }

            setIsStatusModalOpen(false);
            setNotes('');
            setFollowUpDate('');
            toast.success('Lead updated successfully');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to update lead';
            toast.error(typeof msg === 'string' ? msg : 'Failed to update lead');

            if (msg === 'This lead is already assigned to another mobile user' || msg === 'Forbidden') {
                setIsStatusModalOpen(false);
                fetchLeads();
            }
        }
    };

    const openCreateLeadModal = () => {
        const now = new Date();
        setCreateLeadPhone('');
        setCreateLeadName('');
        setCreateLeadDate(now.toISOString().split('T')[0]);
        setCreateLeadTime(now.toTimeString().slice(0, 5));
        setIsCreateLeadModalOpen(true);
    };

    const handleCreateLead = async () => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(createLeadPhone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        try {
            setIsCreatingLead(true);
            const newLead = await leadService.createManual({
                phoneNumber: createLeadPhone,
                name: createLeadName || undefined,
                date: createLeadDate || undefined,
                time: createLeadTime || undefined,
            });
            setLeads(prev => [newLead, ...prev]);
            setIsCreateLeadModalOpen(false);
            toast.success('Lead created successfully!');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to create lead';
            toast.error(typeof msg === 'string' ? msg : 'Failed to create lead');
        } finally {
            setIsCreatingLead(false);
        }
    };

    const openStatusModal = (lead: Lead) => {
        setSelectedLead(lead);
        setNewStatus(lead.status);
        setEditName(lead.name || '');
        setEditPhone(formatPhoneNumber(lead.phoneNumber));
        setEditAssignedToId(lead.assignedToId || '');
        setEditLoanTypeId(lead.loanTypeId || '');
        setEditLoanType(lead.loanType || 'Other');
        setEditProfile(lead.profile || '');
        setEditCibilStatus(lead.cibilStatus || '');
        setEditCibilRemark(lead.cibilRemark || '');
        setIsAgentEditDropdownOpen(false);
        setIsOutcomeDropdownOpen(false);
        setIsLoanTypeDropdownOpen(false);
        setIsStatusModalOpen(true);
        setStatusRemark(lead.statusRemark || '');
        setEditCustomLoanType(lead.customLoanType || '');

        if (lead.nextFollowUpAt) {
            const dt = new Date(lead.nextFollowUpAt);
            setReminderDate(dt.toISOString().split('T')[0]);
            setReminderTime(dt.toTimeString().slice(0, 5));
        } else {
            setReminderDate('');
            setReminderTime('');
        }
    };

    const openViewModal = async (lead: Lead) => {
        try {
            setSelectedLead(lead);
            setIsViewModalOpen(true);
            setShowAllHistory(false);

            const fullLead = await leadService.getLead(lead.id);
            setSelectedLead({
                ...fullLead.lead,
                callLogs: fullLead.calllogs
            });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to load lead history';
            toast.error(typeof msg === 'string' ? msg : 'Failed to load lead history');

            if (msg === 'This lead is already assigned to another mobile user' || msg === 'Forbidden') {
                setIsViewModalOpen(false);
                fetchLeads();
            }
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
            toast.error('Failed to delete lead');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenForm = async (lead: Lead) => {
        try {
            setSelectedLeadForForm(lead);
            setIsFormModalOpen(true);
            setIsLoadingForm(true);
            setApplicationFormData(null); // Reset

            try {
                const data = await leadService.getApplicationForm(lead.id);
                // Merge with default structure to ensure all keys and arrays exist
                const defaultValues = {
                    name: lead.name || '',
                    phoneNumber: lead.phoneNumber,
                    email: '',
                    motherName: '',
                    dob: '',
                    companyName: '',
                    fileNumber: '',
                    product: '',
                    residentType: '',
                    leadBy: lead.assignedTo?.name || '',
                    references: [{ name: '', phoneNumber: '' }, { name: '', phoneNumber: '' }],
                    coApplicants: []
                };

                setApplicationFormData({
                    ...defaultValues,
                    ...data,
                    fileNumber: data.fileNumber || '',
                    // Ensure nested objects are properly initialized/merged (spread is shallow)
                    addresses: {
                        current: '', permanent: '', office: '',
                        ...(data.addresses || {})
                    },
                    financials: {
                        netSalaryInr: 0, loanAmountInr: 0, obligationInr: 0,
                        ...(data.financials || {})
                    }
                });
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setApplicationFormData({
                        name: lead.name || '',
                        phoneNumber: lead.phoneNumber,
                        email: '',
                        motherName: '',
                        dob: '',
                        companyName: '',
                        fileNumber: '',
                        addresses: { current: '', permanent: '', office: '' },
                        financials: { netSalaryInr: 0, loanAmountInr: 0, obligationInr: 0 },
                        product: '',
                        residentType: '',
                        leadBy: lead.assignedTo?.name || '',
                        references: [
                            { name: '', phoneNumber: '' },
                            { name: '', phoneNumber: '' }
                        ],
                        coApplicants: []
                    });
                } else {
                    toast.error('Failed to load form sheet');
                }
            }
        } finally {
            setIsLoadingForm(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!selectedLeadForForm) return;
        try {
            const data = await leadService.downloadApplicationPdf(selectedLeadForForm.id);
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `application-form-${selectedLeadForForm.leadId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('Download PDF Error:', error);
            toast.error('Failed to download PDF');
        }
    };

    const handleSaveForm = async () => {
        if (!selectedLeadForForm || !applicationFormData) return;
        try {
            setIsSavingForm(true);
            await leadService.saveApplicationForm(selectedLeadForForm.id, applicationFormData);
            toast.success('Form saved successfully');
            setIsFormModalOpen(false);
            fetchLeads(); // Refresh to update "hasForm" status if needed
        } catch (error) {
            toast.error('Failed to save form');
        } finally {
            setIsSavingForm(false);
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
            'Assigned Agent': lead.assignedTo?.name || 'Unassigned',
            'Loan Type': lead.loanType === 'Other' ? (lead.customLoanType ? `Other - ${lead.customLoanType}` : 'Other') : (lead.loanType || 'Other'),
            'Profile': lead.profile || 'N/A',
            'CIBIL Status': lead.cibilStatus || 'N/A',
            'CIBIL Issue Remark': lead.cibilRemark || '',
            'Status Remarks': lead.statusRemark || '',
            'Interaction Notes': lead.notes || '',
            'Call Time & Date': (lead.lastCallAt || lead.createdAt) ? format(new Date(lead.lastCallAt || lead.createdAt), 'MMM d, yyyy hh:mm a') : 'Never',
            'Next Follow-up': lead.nextFollowUpAt ? format(new Date(lead.nextFollowUpAt), 'MMM d, yyyy hh:mm a') : 'None',
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
                            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#00a651] text-white rounded-xl hover:bg-[#008d45] hover:shadow-green-500/20 active:scale-[0.98] transition-all shadow-lg shadow-green-600/10 font-black text-[10px] uppercase tracking-widest leading-none"
                        >
                            <FileSpreadsheet className="h-3 w-3" />
                            <span>Export Results</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Leads Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <div className="overflow-x-auto min-h-[300px] pb-[160px]">
                    <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="w-[10%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lead ID</th>
                                <th className="w-[17%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lead Details</th>
                                <th className="w-[11%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loan Type</th>
                                <th className="w-[10%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="w-[14%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Call Time & Date</th>
                                <th className="w-[12%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next Follow-up</th>
                                <th className="w-[13%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Agent</th>
                                <th className="w-[13%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
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
                                    <td colSpan={8} className="px-6 py-20 text-center text-gray-400">
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
                                                    {lead.profile && (
                                                        <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                                            {lead.profile}
                                                        </span>
                                                    )}
                                                    {lead.source && (
                                                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                                            {lead.source}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.loanType !== 'Other' ? (
                                                <span className="whitespace-nowrap inline-block text-xs font-bold text-[#00a651] bg-[#00a651]/10 px-2.5 py-1 rounded-lg border border-[#00a651]/20">
                                                    {lead.loanType}
                                                </span>
                                            ) : (
                                                <span className="whitespace-nowrap inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                                                    Other {lead.customLoanType ? `- ${lead.customLoanType}` : ''}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "whitespace-nowrap inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                lead.status === 'NEW' ? 'bg-blue-50 text-blue-600' :
                                                    lead.status === 'FOLLOW_UP' ? 'bg-amber-50 text-amber-600' :
                                                        lead.status === 'COMPLETED' ? 'bg-slate-50 text-slate-600' :
                                                            lead.status === 'NO_ANSWER' ? 'bg-slate-50 text-slate-600' :
                                                                lead.status === 'INVALID_WRONG' ? 'bg-rose-50 text-rose-600' :
                                                                    lead.status === 'RECALL' ? 'bg-purple-50 text-purple-600' :
                                                                        lead.status === 'REJECT' ? 'bg-red-50 text-red-600' :
                                                                            lead.status === 'DORMANT' ? 'bg-amber-50 text-amber-600' :
                                                                                lead.status === 'LOGIN' ? 'bg-indigo-50 text-indigo-600' :
                                                                                    lead.status === 'SANCTIONED' ? 'bg-emerald-50 text-emerald-600' :
                                                                                        lead.status === 'DISBURSEMENT' ? 'bg-cyan-50 text-cyan-600' :
                                                                                            'bg-gray-100 text-gray-600'
                                            )}>
                                                {lead.status === 'NEW' ? 'New' :
                                                    lead.status === 'FOLLOW_UP' ? 'Follow Up' :
                                                        lead.status === 'COMPLETED' ? 'Call Connected' :
                                                            lead.status === 'NOT_INTERESTED' ? 'Not Interested' :
                                                                lead.status === 'NO_ANSWER' ? 'No Answer' :
                                                                    lead.status === 'CLOSED' ? 'Closed' :
                                                                        lead.status === 'INVALID_WRONG' ? 'Invalid/Wrong' :
                                                                            lead.status === 'INTERESTED' ? 'Interested' :
                                                                                lead.status === 'RECALL' ? 'Recall' :
                                                                                    lead.status === 'LOGIN' ? 'Login' :
                                                                                        lead.status === 'SANCTIONED' ? 'Sanctioned' :
                                                                                            lead.status === 'DISBURSEMENT' ? 'Disbursement' :
                                                                                                lead.status === 'REJECT' ? 'Reject' :
                                                                                                    lead.status === 'DORMANT' ? 'Dormant' :
                                                                                                        lead.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-xs text-gray-600">
                                            {(() => {
                                                const displayDate = lead.lastCallAt || lead.createdAt;
                                                if (displayDate) {
                                                    return (
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-900 font-bold">{format(new Date(displayDate), 'MMM d, yyyy')}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium">at {format(new Date(displayDate), 'hh:mm a')}</span>
                                                        </div>
                                                    );
                                                }
                                                return <span className="text-gray-300 italic">Never</span>;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.nextFollowUpAt && (lead.status === 'FOLLOW_UP' || lead.status === 'RECALL') && new Date(lead.nextFollowUpAt).getTime() > Date.now() ? (
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
                                            <div className="flex justify-start w-full max-w-[140px]">
                                                <button
                                                    className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border-2 transition-all duration-300 font-bold text-[10px] uppercase tracking-wider ${activeRowDropdown === lead.id
                                                        ? 'bg-[#00a651]/5 border-[#00a651] text-[#00a651] shadow-sm'
                                                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                        }`}
                                                    onClick={() => setActiveRowDropdown(activeRowDropdown === lead.id ? null : lead.id)}
                                                    disabled={updatingAgent === lead.id}
                                                >
                                                    <div className={`flex-none h-1.5 w-1.5 rounded-full ${lead.assignedTo?.id ? 'bg-[#00a651] shadow-[0_0_8px_rgba(0,166,81,0.5)]' : 'bg-gray-300'}`} />
                                                    <span className="flex-1 truncate text-left">
                                                        {updatingAgent === lead.id ? '...' : (lead.assignedTo?.name || 'Unassigned')}
                                                    </span>
                                                    <ChevronDown className={`flex-none h-3 w-3 transition-transform duration-300 ${activeRowDropdown === lead.id ? 'rotate-180' : 'opacity-40'}`} />
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
                                                    <div className="px-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
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
                                                {lead.applicationForm && (
                                                    <button
                                                        onClick={() => handleOpenForm(lead)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors shadow-sm border border-emerald-100/50"
                                                        title="Form Sheet"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openViewModal(lead)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shadow-sm border border-blue-100/50"
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openStatusModal(lead)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm border border-indigo-100/50"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(lead)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm border border-red-100/50"
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
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
                                <div className="space-y-1 px-4 flex-grow text-center">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Loan Type</label>
                                    <span className={clsx(
                                        "inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                        (selectedLead.loanType !== 'Other' || selectedLead.customLoanType) ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                                    )}>
                                        {selectedLead.loanType !== 'Other' ? selectedLead.loanType : (selectedLead.customLoanType ? `Other - ${selectedLead.customLoanType}` : 'Other')}
                                    </span>
                                </div>
                                <div className="space-y-1 px-4 flex-grow text-center">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Phone Number</label>
                                    <p className="text-lg font-bold text-indigo-600 tracking-tight">{formatPhoneNumber(selectedLead.phoneNumber)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Profile</label>
                                    <span className={clsx(
                                        "inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                        selectedLead.profile ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"
                                    )}>
                                        {selectedLead.profile || 'Not Set'}
                                    </span>
                                </div>
                                <div className="space-y-1 pl-4">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">CIBIL Status</label>
                                    <span className={clsx(
                                        "inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                        selectedLead.cibilStatus === 'ISSUED' ? "bg-red-100 text-red-700" :
                                            selectedLead.cibilStatus === 'NO ISSUED' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                                    )}>
                                        {selectedLead.cibilStatus || 'Not Set'}
                                    </span>
                                </div>
                            </div>

                            {/* CIBIL Remark Section */}
                            {selectedLead.cibilRemark && (
                                <div className={clsx(
                                    "space-y-2 p-4 rounded-2xl border",
                                    selectedLead.cibilStatus === 'ISSUED' ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
                                )}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={clsx("h-6 w-1 rounded-full", selectedLead.cibilStatus === 'ISSUED' ? "bg-red-500" : "bg-blue-500")} />
                                        <h4 className={clsx("text-[10px] font-black uppercase tracking-widest", selectedLead.cibilStatus === 'ISSUED' ? "text-red-900" : "text-blue-900")}>
                                            CIBIL Remark
                                        </h4>
                                    </div>
                                    <p className={clsx("text-sm font-semibold leading-relaxed", selectedLead.cibilStatus === 'ISSUED' ? "text-red-900" : "text-blue-900")}>
                                        {selectedLead.cibilRemark}
                                    </p>
                                </div>
                            )}

                            {/* Status Specific Remark (Dormant/Reject) */}
                            {selectedLead.statusRemark && (selectedLead.status === 'REJECT' || selectedLead.status === 'DORMANT') && (
                                <div className={clsx(
                                    "space-y-2 p-4 rounded-2xl border",
                                    selectedLead.status === 'REJECT' ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
                                )}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={clsx("h-6 w-1 rounded-full", selectedLead.status === 'REJECT' ? "bg-red-500" : "bg-amber-500")} />
                                        <h4 className={clsx("text-[10px] font-black uppercase tracking-widest", selectedLead.status === 'REJECT' ? "text-red-900" : "text-amber-900")}>
                                            {selectedLead.status === 'REJECT' ? 'Reject Remark' : 'Dormant Reason'}
                                        </h4>
                                    </div>
                                    <p className={clsx("text-sm font-semibold leading-relaxed", selectedLead.status === 'REJECT' ? "text-red-900" : "text-amber-900")}>
                                        {selectedLead.statusRemark}
                                    </p>
                                    {selectedLead.status === 'REJECT' && selectedLead.nextFollowUpAt && (
                                        <div className="mt-2 text-[10px] font-bold text-red-600 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Reminder: {format(new Date(selectedLead.nextFollowUpAt), 'MMM d, yyyy @ hh:mm a')}
                                        </div>
                                    )}
                                </div>
                            )}

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
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Edit2 className="h-5 w-5 text-[#00a651]" />
                                Edit Lead: {selectedLead?.leadId || '----'}
                            </h2>
                            <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600" type="button">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Lead Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 text-gray-900 bg-white"
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
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 text-gray-900 bg-white"
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
                                            className="w-full flex items-center justify-between border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 text-gray-900 bg-white transition-all hover:border-gray-300"
                                        >
                                            <span>{newStatus ? newStatus.replace('_', ' ') : 'Select Status'}</span>
                                            <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform duration-200", isOutcomeDropdownOpen && "rotate-180")} />
                                        </button>

                                        {isOutcomeDropdownOpen && (
                                            <div className="absolute z-[60] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 origin-top max-h-40 overflow-y-auto custom-scrollbar">
                                                {[
                                                    { id: 'NEW', label: 'New' },
                                                    { id: 'FOLLOW_UP', label: 'Follow Up' },
                                                    { id: 'COMPLETED', label: 'Call Connected' },
                                                    { id: 'NOT_INTERESTED', label: 'Not Interested' },
                                                    { id: 'NO_ANSWER', label: 'No Answer' },
                                                    { id: 'CLOSED', label: 'Closed' },
                                                    { id: 'INVALID_WRONG', label: 'Invalid/Wrong' },
                                                    { id: 'INTERESTED', label: 'Interested' },
                                                    { id: 'RECALL', label: 'Recall' },
                                                    { id: 'LOGIN', label: 'Login' },
                                                    { id: 'SANCTIONED', label: 'Sanctioned' },
                                                    { id: 'DISBURSEMENT', label: 'Disbursement' },
                                                    { id: 'REJECT', label: 'Reject' },
                                                    { id: 'DORMANT', label: 'Dormant' },
                                                ].filter(opt => {
                                                    const restricted = ['LOGIN', 'SANCTIONED', 'DISBURSEMENT', 'REJECT'];
                                                    if (currentUser?.userType === 'MOBILE' && restricted.includes(opt.id)) return false;
                                                    return true;
                                                }).map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewStatus(opt.id);
                                                            setIsOutcomeDropdownOpen(false);
                                                        }}
                                                        className={clsx(
                                                            "w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between",
                                                            newStatus === opt.id ? "bg-[#00a651]/10 text-[#00a651] font-bold" : "text-gray-700 hover:bg-gray-50"
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
                                            className="w-full flex items-center justify-between border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 text-gray-900 bg-white transition-all hover:border-gray-300"
                                        >
                                            <span className="truncate">{editAssignedToId === 'unassigned' || !editAssignedToId ? 'Unassigned' : (users.find(u => u.id === editAssignedToId)?.name || 'Select Agent')}</span>
                                            <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform duration-200", isAgentEditDropdownOpen && "rotate-180")} />
                                        </button>

                                        {isAgentEditDropdownOpen && (
                                            <div className="absolute z-[60] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100 origin-top max-h-40 overflow-y-auto custom-scrollbar">
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
                                                <div className="max-h-56 overflow-y-auto custom-scrollbar">
                                                    <button
                                                        type="button"
                                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${(!editAssignedToId || editAssignedToId === 'unassigned') ? 'text-primary font-black bg-primary/5' : 'text-gray-600 font-bold'}`}
                                                        onClick={() => { setEditAssignedToId('unassigned'); setIsAgentEditDropdownOpen(false); }}
                                                    >
                                                        Unassigned
                                                    </button>
                                                    {users.filter(u => u.name.toLowerCase().includes(agentEditSearch.toLowerCase())).map((u) => (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditAssignedToId(u.id);
                                                                setIsAgentEditDropdownOpen(false);
                                                            }}
                                                            className={clsx(
                                                                "w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between",
                                                                editAssignedToId === u.id ? "text-primary font-black bg-primary/5" : "text-gray-600 font-bold hover:bg-gray-50"
                                                            )}
                                                        >
                                                            <span>{u.name}</span>
                                                            {editAssignedToId === u.id && <Check className="h-3 w-3" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Conditional Status Remark/Date Fields */}
                            {(newStatus === 'REJECT' || newStatus === 'DORMANT') && (
                                <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={clsx("h-6 w-1 rounded-full", newStatus === 'REJECT' ? "bg-red-500" : "bg-amber-500")} />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            {newStatus === 'REJECT' ? 'Reject Details' : 'Dormant Details'}
                                        </h4>
                                    </div>

                                    {newStatus === 'REJECT' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Reminder Date</label>
                                                <input
                                                    type="date"
                                                    value={reminderDate}
                                                    onChange={(e) => setReminderDate(e.target.value)}
                                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Reminder Time</label>
                                                <input
                                                    type="time"
                                                    value={reminderTime}
                                                    onChange={(e) => setReminderTime(e.target.value)}
                                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 bg-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                            {newStatus === 'REJECT' ? 'Reject Remarks' : 'Dormant Reason'}
                                        </label>
                                        <textarea
                                            value={statusRemark}
                                            onChange={(e) => setStatusRemark(e.target.value)}
                                            placeholder={newStatus === 'REJECT' ? 'Enter rejection reason...' : 'Enter dormant reason...'}
                                            rows={2}
                                            className={clsx(
                                                "w-full border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none transition-all resize-none text-gray-900",
                                                newStatus === 'REJECT' ? "focus:ring-2 focus:ring-red-500/20 focus:border-red-300" : "focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300"
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Conditional Follow-up Fields */}
                            {(newStatus === 'FOLLOW_UP' || newStatus === 'RECALL') && (
                                <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 animate-in fade-in duration-200">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Follow-up Date & Time</label>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const d = new Date();
                                                d.setHours(d.getHours() + 1);
                                                setFollowUpDate(format(d, "yyyy-MM-dd'T'HH:mm"));
                                            }}
                                            className="text-[10px] py-2 bg-[#00a651]/10 hover:bg-[#00a651]/20 rounded-lg text-[#00a651] font-bold transition-colors"
                                        >
                                            +1 HOUR
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const d = new Date();
                                                d.setDate(d.getDate() + 1);
                                                d.setHours(10, 0, 0, 0);
                                                setFollowUpDate(format(d, "yyyy-MM-dd'T'HH:mm"));
                                            }}
                                            className="text-[10px] py-2 bg-[#00a651]/10 hover:bg-[#00a651]/20 rounded-lg text-[#00a651] font-bold transition-colors"
                                        >
                                            TOMORROW 10AM
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const d = new Date();
                                                d.setHours(17, 0, 0, 0);
                                                setFollowUpDate(format(d, "yyyy-MM-dd'T'HH:mm"));
                                            }}
                                            className="text-[10px] py-2 bg-[#00a651]/10 hover:bg-[#00a651]/20 rounded-lg text-[#00a651] font-bold transition-colors"
                                        >
                                            LATER TODAY
                                        </button>
                                    </div>
                                    <input
                                        type="datetime-local"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 text-gray-900 bg-white"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Loan Type</label>
                                    <div className="relative" ref={loanTypeDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsLoanTypeDropdownOpen(!isLoanTypeDropdownOpen)}
                                            className="w-full flex items-center justify-between border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 text-gray-900 bg-white transition-all hover:border-gray-300"
                                        >
                                            <span className="truncate">
                                                {editLoanType}
                                            </span>
                                            <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform duration-200", isLoanTypeDropdownOpen && "rotate-180")} />
                                        </button>

                                        {isLoanTypeDropdownOpen && (
                                            <div className="absolute z-[60] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100 origin-top max-h-40 overflow-y-auto custom-scrollbar">
                                                <div className="px-3 pb-2 mb-2 border-b border-gray-50">
                                                    <div className="relative">
                                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search types..."
                                                            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                                                            value={editLoanTypeSearch}
                                                            onChange={(e) => setEditLoanTypeSearch(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-56 overflow-y-auto custom-scrollbar">
                                                    <button
                                                        type="button"
                                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${editLoanType === 'Other' ? 'text-primary font-black bg-primary/5' : 'text-gray-600 font-bold'}`}
                                                        onClick={() => { setEditLoanType('Other'); setEditLoanTypeId(''); setIsLoanTypeDropdownOpen(false); }}
                                                    >
                                                        Other
                                                    </button>
                                                    {loanTypes.filter(lt => lt.name.toLowerCase().includes(editLoanTypeSearch.toLowerCase())).map((lt) => (
                                                        <button
                                                            key={lt.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditLoanType(lt.name);
                                                                setEditLoanTypeId(lt.id);
                                                                setIsLoanTypeDropdownOpen(false);
                                                            }}
                                                            className={clsx(
                                                                "w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between",
                                                                editLoanType === lt.name ? "text-primary font-black bg-primary/5" : "text-gray-600 font-bold hover:bg-gray-50"
                                                            )}
                                                        >
                                                            <span>{lt.name}</span>
                                                            {editLoanType === lt.name && <Check className="h-3 w-3" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {editLoanType === 'Other' && currentUser?.userType === 'MOBILE' && (
                                        <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                                            <textarea
                                                placeholder="Describe custom loan type..."
                                                value={editCustomLoanType}
                                                onChange={(e) => setEditCustomLoanType(e.target.value)}
                                                rows={3}
                                                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 text-gray-900 bg-white"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Profile</label>
                                    <div className="relative" ref={profileDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                            className="w-full flex items-center justify-between border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 text-gray-900 bg-white transition-all hover:border-gray-300"
                                        >
                                            <span>{editProfile || 'Select Profile'}</span>
                                            <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform duration-200", isProfileDropdownOpen && "rotate-180")} />
                                        </button>

                                        {isProfileDropdownOpen && (
                                            <div className="absolute z-[60] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 origin-top">
                                                {['Job', 'Business', 'Job + Business'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => {
                                                            setEditProfile(opt);
                                                            setIsProfileDropdownOpen(false);
                                                        }}
                                                        className={clsx(
                                                            "w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between",
                                                            editProfile === opt ? "bg-[#00a651]/10 text-[#00a651] font-bold" : "text-gray-700 hover:bg-gray-50"
                                                        )}
                                                    >
                                                        {opt}
                                                        {editProfile === opt && <Check className="h-4 w-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">CIBIL Status</label>
                                    <div className="relative" ref={cibilDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsCibilDropdownOpen(!isCibilDropdownOpen)}
                                            className="w-full flex items-center justify-between border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 text-gray-900 bg-white transition-all hover:border-gray-300"
                                        >
                                            <span className={clsx(
                                                editCibilStatus === 'ISSUED' ? "text-red-600 font-bold" :
                                                    editCibilStatus === 'NO ISSUED' ? "text-green-600 font-bold" : "text-gray-900"
                                            )}>
                                                {editCibilStatus || 'Select CIBIL Status'}
                                            </span>
                                            <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform duration-200", isCibilDropdownOpen && "rotate-180")} />
                                        </button>

                                        {isCibilDropdownOpen && (
                                            <div className="absolute z-[60] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 origin-top">
                                                {['ISSUED', 'NO ISSUED'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => {
                                                            setEditCibilStatus(opt);
                                                            setIsCibilDropdownOpen(false);
                                                        }}
                                                        className={clsx(
                                                            "w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between",
                                                            editCibilStatus === opt ? "bg-[#00a651]/10 text-[#00a651] font-bold" : "text-gray-700 hover:bg-gray-50"
                                                        )}
                                                    >
                                                        <span className={clsx(
                                                            opt === 'ISSUED' ? "text-red-600" : "text-green-600"
                                                        )}>{opt}</span>
                                                        {editCibilStatus === opt && <Check className="h-4 w-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">CIBIL Issue Remark</label>
                                    <input
                                        type="text"
                                        placeholder={editCibilStatus === 'ISSUED' ? "Explain the ISSUED..." : "Optional remark"}
                                        value={editCibilRemark}
                                        onChange={(e) => setEditCibilRemark(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 text-gray-900 bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Interaction Notes</label>
                                <textarea
                                    rows={4}
                                    placeholder="Add details about the conversation..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#00a651]/20 resize-none text-gray-900 placeholder:text-gray-400 bg-white"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50/80 flex justify-end gap-3 border-t border-gray-100">
                            <button
                                onClick={() => setIsStatusModalOpen(false)}
                                className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                type="button"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="px-8 py-2 bg-[#00a651] text-white rounded-xl font-bold text-sm hover:bg-[#008d45] shadow-lg shadow-green-100 active:scale-95 transition-all"
                                type="button"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {
                isDeleteModalOpen && (
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
                )
            }

            {/* Create Lead Modal */}
            {
                isCreateLeadModalOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                        <Plus className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900">Create New Lead</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add a lead manually</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCreateLeadModalOpen(false)}
                                    className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5 space-y-4">
                                {/* Phone Number */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Phone Number *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter 10-digit phone number"
                                            value={createLeadPhone}
                                            onChange={(e) => setCreateLeadPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-gray-900 bg-white transition-all"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Contact name (optional)"
                                            value={createLeadName}
                                            onChange={(e) => setCreateLeadName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-gray-900 bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Date & Time */}
                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="date"
                                                value={createLeadDate}
                                                onChange={(e) => setCreateLeadDate(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 text-gray-900 bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Time</label>
                                        <input
                                            type="time"
                                            value={createLeadTime}
                                            onChange={(e) => setCreateLeadTime(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 text-gray-900 bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                <button
                                    onClick={() => setIsCreateLeadModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateLead}
                                    disabled={isCreatingLead || !createLeadPhone}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isCreatingLead ? 'Creating...' : 'Create Lead'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Application Form Modal */}
            {isFormModalOpen && applicationFormData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-2 bg-emerald-50 rounded-xl">
                                        <FileText className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Form Sheet</h3>
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-11">
                                    Lead ID: <span className="text-emerald-500">{selectedLeadForForm?.leadId}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDownloadPdf}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all border border-emerald-100"
                                    title="Download PDF"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Download PDF</span>
                                </button>
                                <button
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 text-gray-400 hover:text-gray-900"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto p-8 custom-scrollbar">
                            <div className="space-y-10">
                                {/* Section 1: Applicant Details */}
                                 <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Header & Tracking</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-emerald-50/20 rounded-2xl border border-emerald-100/50 mb-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">File Number</label>
                                            <input
                                                type="text"
                                                placeholder="Enter file number..."
                                                value={applicationFormData.fileNumber || ''}
                                                onChange={(e) => setApplicationFormData({ ...applicationFormData, fileNumber: e.target.value })}
                                                className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Company Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter company name..."
                                                value={applicationFormData.companyName || ''}
                                                onChange={(e) => setApplicationFormData({ ...applicationFormData, companyName: e.target.value })}
                                                className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Applicant Details</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={applicationFormData.name || ''}
                                                onChange={(e) => setApplicationFormData({ ...applicationFormData, name: e.target.value })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                                            <input
                                                type="text"
                                                value={applicationFormData.phoneNumber || ''}
                                                onChange={(e) => setApplicationFormData({ ...applicationFormData, phoneNumber: e.target.value })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                value={applicationFormData.email || ''}
                                                onChange={(e) => setApplicationFormData({ ...applicationFormData, email: e.target.value })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mother's Name</label>
                                            <input
                                                type="text"
                                                value={applicationFormData.motherName || ''}
                                                onChange={(e) => setApplicationFormData({ ...applicationFormData, motherName: e.target.value })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={applicationFormData.dob || ''}
                                                onChange={(e) => setApplicationFormData({ ...applicationFormData, dob: e.target.value })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: Addresses */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-8 w-1 bg-blue-500 rounded-full" />
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Addresses</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Address</label>
                                            <textarea
                                                rows={2}
                                                value={applicationFormData.addresses?.current || ''}
                                                onChange={(e) => setApplicationFormData({
                                                    ...applicationFormData,
                                                    addresses: { ...applicationFormData.addresses, current: e.target.value }
                                                })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Permanent Address</label>
                                            <textarea
                                                rows={2}
                                                value={applicationFormData.addresses?.permanent || ''}
                                                onChange={(e) => setApplicationFormData({
                                                    ...applicationFormData,
                                                    addresses: { ...applicationFormData.addresses, permanent: e.target.value }
                                                })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Office Address</label>
                                            <textarea
                                                rows={2}
                                                value={applicationFormData.addresses?.office || ''}
                                                onChange={(e) => setApplicationFormData({
                                                    ...applicationFormData,
                                                    addresses: { ...applicationFormData.addresses, office: e.target.value }
                                                })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3: Financials */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-8 w-1 bg-indigo-500 rounded-full" />
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Financial Information</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Net Salary (INR)</label>
                                            <input
                                                type="number"
                                                value={applicationFormData.financials?.netSalaryInr || 0}
                                                onChange={(e) => setApplicationFormData({
                                                    ...applicationFormData,
                                                    financials: { ...applicationFormData.financials, netSalaryInr: Number(e.target.value) }
                                                })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Loan Amount (INR)</label>
                                            <input
                                                type="number"
                                                value={applicationFormData.financials?.loanAmountInr || 0}
                                                onChange={(e) => setApplicationFormData({
                                                    ...applicationFormData,
                                                    financials: { ...applicationFormData.financials, loanAmountInr: Number(e.target.value) }
                                                })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Obligation (INR)</label>
                                            <input
                                                type="number"
                                                value={applicationFormData.financials?.obligationInr || 0}
                                                onChange={(e) => setApplicationFormData({
                                                    ...applicationFormData,
                                                    financials: { ...applicationFormData.financials, obligationInr: Number(e.target.value) }
                                                })}
                                                className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4: References */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-1 bg-amber-500 rounded-full" />
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">References</h4>
                                        </div>
                                        <button
                                            onClick={() => setApplicationFormData({
                                                ...applicationFormData,
                                                references: [...(applicationFormData.references || []), { name: '', phoneNumber: '' }]
                                            })}
                                            className="text-[10px] font-black text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest"
                                        >
                                            + Add Reference
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {(applicationFormData.references || []).map((ref: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Name</label>
                                                    <input
                                                        type="text"
                                                        value={ref.name || ''}
                                                        onChange={(e) => {
                                                            const newRefs = [...(applicationFormData.references || [])];
                                                            newRefs[idx] = { ...newRefs[idx], name: e.target.value };
                                                            setApplicationFormData({ ...applicationFormData, references: newRefs });
                                                        }}
                                                        className="w-full bg-white border-gray-200 rounded-xl p-2.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={ref.phoneNumber || ''}
                                                        onChange={(e) => {
                                                            const newRefs = [...(applicationFormData.references || [])];
                                                            newRefs[idx] = { ...newRefs[idx], phoneNumber: e.target.value };
                                                            setApplicationFormData({ ...applicationFormData, references: newRefs });
                                                        }}
                                                        className="w-full bg-white border-gray-200 rounded-xl p-2.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newRefs = applicationFormData.references.filter((_: any, i: number) => i !== idx);
                                                        setApplicationFormData({ ...applicationFormData, references: newRefs });
                                                    }}
                                                    className="p-2.5 text-gray-300 hover:text-red-500 bg-white rounded-xl border border-gray-100 transition-all hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Section 5: Co-Applicants */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-1 bg-violet-500 rounded-full" />
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Co-Applicants</h4>
                                        </div>
                                        <button
                                            onClick={() => setApplicationFormData({
                                                ...applicationFormData,
                                                coApplicants: [...(applicationFormData.coApplicants || []), { name: '', phoneNumber: '', email: '', motherName: '' }]
                                            })}
                                            className="text-[10px] font-black text-violet-600 hover:text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest"
                                        >
                                            + Add Co-Applicant
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {(applicationFormData.coApplicants || []).map((co: any, idx: number) => (
                                            <div key={idx} className="relative bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                                <button
                                                    onClick={() => {
                                                        const newCos = applicationFormData.coApplicants.filter((_: any, i: number) => i !== idx);
                                                        setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                    }}
                                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Name</label>
                                                        <input
                                                            type="text"
                                                            value={co.name || ''}
                                                            onChange={(e) => {
                                                                const newCos = [...(applicationFormData.coApplicants || [])];
                                                                newCos[idx] = { ...newCos[idx], name: e.target.value };
                                                                setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                            }}
                                                            className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-500/20 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                                                        <input
                                                            type="text"
                                                            value={co.phoneNumber || ''}
                                                            onChange={(e) => {
                                                                const newCos = [...(applicationFormData.coApplicants || [])];
                                                                newCos[idx] = { ...newCos[idx], phoneNumber: e.target.value };
                                                                setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                            }}
                                                            className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-500/20 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                                                        <input
                                                            type="email"
                                                            value={co.email || ''}
                                                            onChange={(e) => {
                                                                const newCos = [...(applicationFormData.coApplicants || [])];
                                                                newCos[idx] = { ...newCos[idx], email: e.target.value };
                                                                setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                            }}
                                                            className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-500/20 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mother's Name</label>
                                                        <input
                                                            type="text"
                                                            value={co.motherName || ''}
                                                            onChange={(e) => {
                                                                const newCos = [...(applicationFormData.coApplicants || [])];
                                                                newCos[idx] = { ...newCos[idx], motherName: e.target.value };
                                                                setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                            }}
                                                            className="w-full bg-white border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-500/20 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-end gap-4 shrink-0">
                            <button
                                onClick={() => setIsFormModalOpen(false)}
                                className="px-6 py-3 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-[0.2em]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveForm}
                                disabled={isSavingForm}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-8 py-3 rounded-2xl shadow-lg shadow-emerald-200 text-sm font-black transition-all transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest flex items-center gap-2"
                            >
                                {isSavingForm ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span>Save Application</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
