import { api } from './axios';

export interface ApiCartItem {
  product: string;
  variant?: string;
  name: string;
  image?: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  sku?: string;
  slug?: string;
  maxQuantity?: number;
  total: number;
}

export interface ApiCart {
  items: ApiCartItem[];
  subtotal: number;
  itemCount: number;
  couponCode?: string;
  couponDiscount?: number;
}

export const cartApi = {
  get: async (): Promise<ApiCart> => {
    const response = await api.get('/cart');
    return response.data.data;
  },

  addItem: async (data: {
    productId: string;
    variant?: string;
    quantity: number;
  }): Promise<ApiCart> => {
    const response = await api.post('/cart/items', data);
    return response.data.data;
  },

  updateItem: async (productId: string, quantity: number): Promise<ApiCart> => {
    const response = await api.patch(`/cart/items/${productId}`, { quantity });
    return response.data.data;
  },

  removeItem: async (productId: string): Promise<ApiCart> => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data.data;
  },

  applyCoupon: async (code: string): Promise<ApiCart> => {
    const response = await api.post('/cart/coupon', { code });
    return response.data.data;
  },
};
