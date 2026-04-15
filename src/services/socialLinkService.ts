import axios from '@/utils/axios';

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const socialLinkService = {
  getAll: async (): Promise<SocialLink[]> => {
    const response = await axios.get('/social-links');
    return response.data;
  },

  create: async (data: { platform: string; url: string; isActive?: boolean }): Promise<SocialLink> => {
    const response = await axios.post('/social-links', data);
    return response.data;
  },

  update: async (id: string, data: { platform?: string; url?: string; isActive?: boolean }): Promise<SocialLink> => {
    const response = await axios.patch(`/social-links/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`/social-links/${id}`);
  },
};
