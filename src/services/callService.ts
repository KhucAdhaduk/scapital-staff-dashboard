import axios from '@/utils/axios';
import { CallLog } from './leadService';

export const callService = {
  getCallLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    phoneNumber?: string;
    assignedToId?: string;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await axios.get<{ data: CallLog[]; total: number; page: number; limit: number }>('calls', { params });
    return response.data;
  },
  exportCallLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    assignedToId?: string;
    search?: string;
    status?: string;
  }) => {
    const response = await axios.get('calls/export', { 
      params, 
      responseType: 'blob' 
    });
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Generate descriptive filename
    const dateStr = new Date().toISOString().split('T')[0];
    const rangeStr = params?.startDate && params?.endDate 
      ? `${params.startDate}_to_${params.endDate}`
      : params?.startDate 
        ? `from_${params.startDate}`
        : params?.endDate 
          ? `until_${params.endDate}`
          : 'all_time';
    
    a.href = url;
    a.download = `call_logs_${rangeStr}_${dateStr}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  updateCallLogAgent: async (id: string, callerId: string) => {
    const response = await axios.patch<CallLog>(`calls/${id}`, { callerId });
    return response.data;
  },
};
