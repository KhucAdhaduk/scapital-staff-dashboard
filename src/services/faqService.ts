import axios from '@/utils/axios';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  defaultOpen: boolean;
}

export const faqService = {
  getAll: async () => {
    const response = await axios.get<FAQ[]>('/faqs');
    return response.data;
  },

  create: async (data: Omit<FAQ, 'id'>) => {
    const response = await axios.post<FAQ>('/faqs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<FAQ>) => {
    const response = await axios.put<FAQ>(`/faqs/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`/faqs/${id}`);
  },
};
