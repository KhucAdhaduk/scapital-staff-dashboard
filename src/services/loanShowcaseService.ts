import axios from '@/utils/axios';

export interface FeatureItem {
  text: string;
  isActive: boolean;
}

export interface CtaButton {
  label: string;
  url?: string;
  enabled: boolean;
}

export interface LoanShowcase {
  id: string;
  label: string;
  imageUrl: string;
  description: string;
  features: FeatureItem[];
  ctaPrimary?: CtaButton;
  ctaSecondary?: CtaButton;
  order: number;
  isActive: boolean;
  isDefault: boolean;

  // Configuration
  defaultAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  
  defaultTenure?: number;
  minTenure?: number;
  maxTenure?: number;
  
  defaultInterest?: number;
  minInterest?: number;
  maxInterest?: number;
}

export const loanShowcaseService = {
  getAll: async () => {
    const response = await axios.get<LoanShowcase[]>('/loan-showcases');
    return response.data;
  },

  create: async (data: Omit<LoanShowcase, 'id'>) => {
    const response = await axios.post<LoanShowcase>('/loan-showcases', data);
    return response.data;
  },

  update: async (id: string, data: Partial<LoanShowcase>) => {
    const response = await axios.put<LoanShowcase>(`/loan-showcases/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`/loan-showcases/${id}`);
  },

  reorder: async (ids: string[]) => {
    await axios.put('/loan-showcases/reorder', { ids });
  },
};
