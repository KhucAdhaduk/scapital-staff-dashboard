import axios from '@/utils/axios';
import { LoanType } from './loanTypeService';

export interface Lead {
  id: string;
  serialId: number;
  leadId: string;
  name: string | null;
  phoneNumber: string;
  email: string | null;
  status: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string | null;
  notes: string | null;
  nextFollowUpAt: string | null;
  lastCallAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedToId: string | null;
  loanTypeId: string | null;
  loanType?: LoanType;
  assignedTo?: { id: string; name: string; email: string };
  callLogs?: CallLog[];
  _count?: { callLogs: number };
}

export interface CallLog {
  id: string;
  serialId: number;
  phoneNumber: string;
  callType: string;
  duration: number | null;
  outcome: string | null;
  notes: string | null;
  leadId: string | null;
  createdAt: string;
  caller?: { id: string; name: string };
  admin?: { id: string; name: string };
  lead?: { status: string; name?: string | null; serialId?: number };
}

export interface LeadStats {
  totalCalls: number;
  completedLeads: number;
  followUpLeads: number;
  notAnsweredLeads: number;
  closedLeads: number;
  assignedCalls: number;
  newLeads: number;
  todayCalls: number;
  invalidLeads: number;
  last7DaysCalls: { name: string; leads: number }[];
}

export const leadService = {
  getLeads: async (params?: { status?: string; startDate?: string; endDate?: string; assignedToId?: string }) => {
    const response = await axios.get<Lead[]>('leads', { params });
    return response.data;
  },

  getLead: async (id: string) => {
    const response = await axios.get<{ lead: Lead; calllogs: CallLog[] }>(`leads/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, data: {
    status: string;
    name?: string;
    phoneNumber?: string;
    assignedToId?: string | null;
    loanTypeId?: string | null;
    notes?: string;
    nextFollowUpAt?: string;
    priority?: string;
    source?: string;
    userId?: string;
  }) => {
    const response = await axios.post(`leads/${id}/call-result`, data);
    return response.data;
  },

  assignLead: async (id: string, userId: string) => {
    const response = await axios.patch(`leads/${id}/assign`, { userId });
    return response.data;
  },

  deleteLead: async (id: string) => {
    const response = await axios.delete(`leads/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get<LeadStats>('leads/stats');
    return response.data;
  },
};
