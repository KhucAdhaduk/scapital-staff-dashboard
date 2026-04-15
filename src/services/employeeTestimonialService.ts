import axios from '@/utils/axios';

export interface EmployeeTestimonial {
    id: string;
    name: string;
    position: string;
    content: string;
    imageUrl?: string;
    isActive: boolean;
    createdAt?: string;
}

export const employeeTestimonialService = {
    getAll: async () => {
        const response = await axios.get<EmployeeTestimonial[]>('/employee-testimonials');
        return response.data;
    },

    create: async (data: Omit<EmployeeTestimonial, 'id' | 'createdAt'>) => {
        const response = await axios.post<EmployeeTestimonial>('/employee-testimonials', data);
        return response.data;
    },

    update: async (id: string, data: Partial<EmployeeTestimonial>) => {
        const response = await axios.patch<EmployeeTestimonial>(`/employee-testimonials/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await axios.delete(`/employee-testimonials/${id}`);
    }
};
