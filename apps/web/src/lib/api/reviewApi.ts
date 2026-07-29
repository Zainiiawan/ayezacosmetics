import { api } from './axios';

export interface Review {
  _id: string;
  product: string | { _id?: string; name: string; slug?: string };
  user: { _id: string; firstName: string; lastName: string; avatar?: string };
  rating: number;
  title: string;
  body: string;
  images?: Array<{ url: string; alt?: string }>;
  isVerifiedPurchase?: boolean;
  isApproved?: boolean;
  helpfulVotes?: number;
  helpfulVoters?: string[];
  createdAt: string;
  moderationNote?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export const reviewApi = {
  getByProduct: async (productId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/${productId}`);
    return response.data.data;
  },

  getStats: async (productId: string): Promise<ReviewStats> => {
    const response = await api.get(`/reviews/${productId}/stats`);
    return response.data.data;
  },

  create: async (data: {
    product: string;
    rating: number;
    title: string;
    body: string;
    images?: Array<{ url: string; alt?: string }>;
  }): Promise<Review> => {
    const response = await api.post('/reviews', data);
    return response.data.data;
  },

  markHelpful: async (reviewId: string): Promise<Review> => {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data.data;
  },

  getPending: async (): Promise<Review[]> => {
    const response = await api.get('/reviews/admin/pending');
    return response.data.data;
  },

  moderate: async (
    reviewId: string,
    data: { isApproved: boolean; moderationNote?: string }
  ): Promise<Review> => {
    const response = await api.patch(`/reviews/${reviewId}/moderate`, data);
    return response.data.data;
  },
};
