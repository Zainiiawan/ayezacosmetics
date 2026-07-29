import { api } from './axios';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; alt?: string };
  productCount?: number;
  isActive?: boolean;
  order?: number;
}

export interface Subcategory {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  category: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: { url: string; alt?: string };
  isActive?: boolean;
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  getBySlug: async (
    slug: string
  ): Promise<{ category: Category; subcategories: Subcategory[] }> => {
    const response = await api.get(`/categories/${slug}`);
    return response.data.data;
  },

  create: async (data: { name: string; description?: string; isActive?: boolean }): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data.data;
  },

  update: async (
    id: string,
    data: { name?: string; description?: string; isActive?: boolean }
  ): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export const brandApi = {
  getAll: async (): Promise<Brand[]> => {
    const response = await api.get('/brands');
    return response.data.data;
  },

  getBySlug: async (slug: string): Promise<Brand> => {
    const response = await api.get(`/brands/${slug}`);
    return response.data.data;
  },

  create: async (data: { name: string; description?: string; isActive?: boolean }): Promise<Brand> => {
    const response = await api.post('/brands', data);
    return response.data.data;
  },

  update: async (
    id: string,
    data: { name?: string; description?: string; isActive?: boolean }
  ): Promise<Brand> => {
    const response = await api.put(`/brands/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/brands/${id}`);
  },
};
