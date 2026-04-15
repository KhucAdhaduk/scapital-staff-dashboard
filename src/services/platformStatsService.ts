import axios from '@/utils/axios';

export interface PlatformStat {
  id: string;
  label: string;
  value: string;
  icon: string;
  order: number;
  isActive: boolean;
  suffix?: string;
  status?: string;
  isAnimated?: boolean;
}

export const platformStatsService = {
  getAll: async () => {
    const response = await axios.get<PlatformStat[]>('/platform-stats');
    return response.data;
  },

  create: async (data: Omit<PlatformStat, 'id'>) => {
    const response = await axios.post<PlatformStat>('/platform-stats', data);
    return response.data;
  },

  update: async (id: string, data: Partial<PlatformStat>) => {
    const response = await axios.put<PlatformStat>(`/platform-stats/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`/platform-stats/${id}`);
  },

  reorder: async (ids: string[]) => {
    await axios.put('/platform-stats/reorder', { ids });
  },
};
