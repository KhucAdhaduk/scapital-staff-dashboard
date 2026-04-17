import axios from '@/utils/axios';

export interface LoanDocument {
  id?: string;
  name: string;
  description?: string;
}

export interface LoanType {
  id: string;
  name: string;
  documents: LoanDocument[];
  createdAt: string;
  updatedAt: string;
  _count?: { leads: number };
}

export const loanTypeService = {
  getLoanTypes: async () => {
    const response = await axios.get<LoanType[]>('loan-types');
    return response.data;
  },

  getLoanType: async (id: string) => {
    const response = await axios.get<LoanType>(`loan-types/${id}`);
    return response.data;
  },

  createLoanType: async (data: { name: string; documents: LoanDocument[] }) => {
    const response = await axios.post<LoanType>('loan-types', data);
    return response.data;
  },

  updateLoanType: async (id: string, data: { name?: string; documents?: LoanDocument[] }) => {
    const response = await axios.patch<LoanType>(`loan-types/${id}`, data);
    return response.data;
  },

  deleteLoanType: async (id: string) => {
    const response = await axios.delete(`loan-types/${id}`);
    return response.data;
  },
};
