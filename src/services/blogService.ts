import axios from '@/utils/axios';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  imageUrl?: string;
  author?: string;
  isPopular: boolean;
  isActive: boolean;
  publishedAt: string; // ISO Date string
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogDto {
  title: string;
  slug: string;
  category?: string;
  content: string;
  imageUrl?: string;
  author?: string;
  isPopular?: boolean;
  isActive?: boolean;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {}

export const blogService = {
  getAll: async (params?: { isPopular?: boolean; isActive?: boolean }) => {
    const response = await axios.get<Blog[]>('/blogs', { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await axios.get<Blog>(`/blogs/${id}`);
    return response.data;
  },

  create: async (data: CreateBlogDto) => {
    const response = await axios.post<Blog>('/blogs', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBlogDto) => {
    const response = await axios.put<Blog>(`/blogs/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`/blogs/${id}`);
  },
};
