import { api } from './axios';

export const contactApi = {
  submit: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    const response = await api.post('/contact', data);
    return response.data;
  },
};
