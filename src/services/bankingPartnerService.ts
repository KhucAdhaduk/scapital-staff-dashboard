import axios from '@/utils/axios';

export interface BankingPartner {
  id: string;
  name: string;
  logoUrl: string;
  redirectUrl?: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
}

export const bankingPartnerService = {
  getAll: async () => {
    const response = await axios.get<BankingPartner[]>('banking-partners');
    return response.data;
  },

  create: async (data: Omit<BankingPartner, 'id'>) => {
    const response = await axios.post<BankingPartner>('banking-partners', data);
    return response.data;
  },

  update: async (id: string, data: Partial<BankingPartner>) => {
    const response = await axios.put<BankingPartner>(`banking-partners/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`banking-partners/${id}`);
  },

  reorder: async (ids: string[]) => {
    await axios.put('banking-partners/reorder', { ids });
  },
};
