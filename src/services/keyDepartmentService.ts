import axios from '@/utils/axios';

export interface KeyDepartment {
    id: string;
    title: string;
    experience: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const keyDepartmentService = {
    getAll: async () => {
        const response = await axios.get<KeyDepartment[]>('/key-departments');
        return response.data;
    },

    create: async (data: Omit<KeyDepartment, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => {
        const response = await axios.post<KeyDepartment>('/key-departments', data);
        return response.data;
    },

    update: async (id: string, data: Partial<KeyDepartment>) => {
        const response = await axios.put<KeyDepartment>(`/key-departments/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await axios.delete(`/key-departments/${id}`);
    }
};
