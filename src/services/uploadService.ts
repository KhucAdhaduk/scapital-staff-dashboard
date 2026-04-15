import axios from '@/utils/axios';

export interface UploadResponse {
  urls: string[];
}

export const uploadService = {
  uploadFile: async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) {
            onProgress(percentCompleted);
          }
        }
      },
    });

    return response.data.urls[0];
  },
};
