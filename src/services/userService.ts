import axios from '@/utils/axios';

export interface User {
  id: string;
  name: string | null;
  username: string;
  mobileNumber: string | null;
  role: string;
  createdAt: string;
}

export const userService = {
  getUsers: async () => {
    const response = await axios.get<User[]>('v1/auth/users');
    return response.data;
  },

  createUser: async (data: Omit<User, 'id' | 'createdAt'> & { password?: string }) => {
    const response = await axios.post('v1/auth/users', data);
    return response.data;
  },

  resetPassword: async (id: string, password: string) => {
    const response = await axios.patch(`v1/auth/users/${id}/reset-password`, { password });
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await axios.patch(`v1/auth/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axios.delete(`v1/auth/users/${id}`);
    return response.data;
  },
};
