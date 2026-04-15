import axios from '@/utils/axios';

export interface ContactInfo {
  id: string;
  phone: string;
  email: string;
  workingHours: string;
  address: string;
  mapUrl?: string; // Google Maps Embed URL
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactInfoDto {
  phone: string;
  email: string;
  workingHours: string;
  address: string;
  mapUrl?: string;
  isActive?: boolean;
}

export interface UpdateContactInfoDto extends Partial<CreateContactInfoDto> {}

export const contactInfoService = {
  getAll: async () => {
    const response = await axios.get<ContactInfo[]>('/contact-infos');
    return response.data;
  },

  getActive: async () => {
      const response = await axios.get<ContactInfo | null>('/contact-infos/active');
      return response.data;
  },

  getOne: async (id: string) => {
    const response = await axios.get<ContactInfo>(`/contact-infos/${id}`);
    return response.data;
  },

  create: async (data: CreateContactInfoDto) => {
    const response = await axios.post<ContactInfo>('/contact-infos', data);
    return response.data;
  },

  update: async (id: string, data: UpdateContactInfoDto) => {
    const response = await axios.patch<ContactInfo>(`/contact-infos/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`/contact-infos/${id}`);
  },
};
