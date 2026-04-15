import axios from '@/utils/axios';

export interface SectionContent {
  heading?: string;
  highlightedText?: string;
  description?: string;
  isActive: boolean;
  extraConfig?: Record<string, any>;
}

export const sectionContentService = {
  getSection: async (key: string) => {
    const response = await axios.get<SectionContent>(`/section-content/${key}`);
    return response.data;
  },

  updateSection: async (key: string, data: SectionContent) => {
    const response = await axios.post<SectionContent>(`/section-content/${key}`, data);
    return response.data;
  },
};
