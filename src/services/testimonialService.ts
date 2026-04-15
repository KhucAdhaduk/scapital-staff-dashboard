import axios from '@/utils/axios';

export interface Testimonial {
  id: string;
  name: string;
  designation?: string;
  content: string;
  rating: number;
  imageUrl?: string;
  order: number;
  isActive: boolean;
}

export const testimonialService = {
  getAll: async () => {
    const response = await axios.get<Testimonial[]>('/testimonials');
    return response.data;
  },

  create: async (data: Omit<Testimonial, 'id'>) => {
    const response = await axios.post<Testimonial>('/testimonials', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Testimonial>) => {
    const response = await axios.put<Testimonial>(`/testimonials/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`/testimonials/${id}`);
  },
};
