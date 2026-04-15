import axios from '@/utils/axios';

export interface LoanProduct {
  id: string;
  name: string;
  icon: string;
  applyLabel: string;
  applyUrl: string;
  order: number;
  isActive: boolean;
  loanBannerId?: string;
}

export interface ComparisonParameter {
  id: string;
  title: string;
  order: number;
  isActive: boolean;
}

export interface ComparisonValue {
  id: string;
  productId: string;
  parameterId: string;
  value: string;
}

export const loanComparisonService = {
  // Products
  getProducts: async () => {
    const response = await axios.get<LoanProduct[]>('/loan-comparison/products');
    return response.data;
  },

  createProduct: async (data: Omit<LoanProduct, 'id'>) => {
    const response = await axios.post<LoanProduct>('/loan-comparison/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<LoanProduct>) => {
    const response = await axios.put<LoanProduct>(`/loan-comparison/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    await axios.delete(`/loan-comparison/products/${id}`);
  },

  reorderProducts: async (ids: string[]) => {
    await axios.put('/loan-comparison/products/reorder', { ids });
  },

  // Parameters
  getParameters: async () => {
    const response = await axios.get<ComparisonParameter[]>('/loan-comparison/parameters');
    return response.data;
  },

  createParameter: async (data: Omit<ComparisonParameter, 'id'>) => {
    const response = await axios.post<ComparisonParameter>('/loan-comparison/parameters', data);
    return response.data;
  },

  updateParameter: async (id: string, data: Partial<ComparisonParameter>) => {
    const response = await axios.put<ComparisonParameter>(`/loan-comparison/parameters/${id}`, data);
    return response.data;
  },

  deleteParameter: async (id: string) => {
    await axios.delete(`/loan-comparison/parameters/${id}`);
  },

  reorderParameters: async (items: { id: string; order: number }[]) => {
    await axios.put('/loan-comparison/parameters/reorder', items);
  },

  // Values
  getValues: async () => {
    const response = await axios.get<ComparisonValue[]>('/loan-comparison/values');
    return response.data;
  },

  updateValue: async (data: { productId: string; parameterId: string; value: string }) => {
    const response = await axios.post<ComparisonValue>('/loan-comparison/values', data);
    return response.data;
  },
};
