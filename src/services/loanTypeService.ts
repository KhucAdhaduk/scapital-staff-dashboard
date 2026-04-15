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
}

export const loanTypeService = {
    async getLoanTypes(): Promise<LoanType[]> {
        const response = await axios.get('/loan-types');
        return response.data;
    },

    async getLoanType(id: string): Promise<LoanType> {
        const response = await axios.get(`/loan-types/${id}`);
        return response.data;
    },

    async createLoanType(data: { name: string; documents: LoanDocument[] }): Promise<LoanType> {
        const response = await axios.post('/loan-types', data);
        return response.data;
    },

    async updateLoanType(id: string, data: { name: string; documents: LoanDocument[] }): Promise<LoanType> {
        const response = await axios.patch(`/loan-types/${id}`, data);
        return response.data;
    },

    async deleteLoanType(id: string): Promise<void> {
        await axios.delete(`/loan-types/${id}`);
    }
};
