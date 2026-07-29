import { api } from './axios';

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount?: number;
  perUserLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  description?: string;
}

export const couponApi = {
  getAll: async (): Promise<Coupon[]> => {
    const response = await api.get('/coupons');
    return response.data.data;
  },

  create: async (data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.post('/coupons', data);
    return response.data.data;
  },

  update: async (couponId: string, data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.put(`/coupons/${couponId}`, data);
    return response.data.data;
  },

  delete: async (couponId: string): Promise<Coupon> => {
    const response = await api.delete(`/coupons/${couponId}`);
    return response.data.data;
  },

  validate: async (
    code: string,
    cartTotal: number
  ): Promise<{ isValid: boolean; discount: number; coupon?: Coupon }> => {
    const response = await api.post('/coupons/validate', { code, cartTotal });
    return response.data.data;
  },
};
