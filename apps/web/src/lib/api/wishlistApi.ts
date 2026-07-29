import { api } from './axios';
import { Product } from './productApi';

export const wishlistApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/wishlist');
    return response.data.data;
  },

  add: async (productId: string): Promise<string[]> => {
    const response = await api.post(`/wishlist/${productId}`);
    return response.data.data;
  },

  remove: async (productId: string): Promise<string[]> => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data.data;
  },
};
