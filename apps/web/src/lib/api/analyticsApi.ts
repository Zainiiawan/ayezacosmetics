import { api } from './axios';

export interface AnalyticsSummary {
  revenue: number;
  paidOrders: number;
  ordersByStatus: Record<string, number>;
  topProducts: Array<{
    _id: string;
    name: string;
    slug: string;
    soldCount: number;
    rating: number;
    reviewCount: number;
    basePrice: number;
  }>;
  lowStockCount: number;
}

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const response = await api.get('/analytics/summary');
    return response.data.data;
  },
};
