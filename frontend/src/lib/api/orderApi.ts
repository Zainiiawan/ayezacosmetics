import { api } from './axios';

export type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  variant?: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
  sku?: string;
}

export interface PaymentProof {
  transactionId: string;
  paidAmount: number;
  screenshotUrl: string;
  screenshotPublicId?: string;
  note?: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | { _id: string; firstName: string; lastName: string; email: string; phone?: string };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  paymentProof?: PaymentProof;
  status: string;
  trackingNumber?: string;
  courierName?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  dispatchedAt?: string;
  trackingHistory?: Array<{
    status: string;
    message: string;
    timestamp: string;
    location?: string;
  }>;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const orderApi = {
  create: async (data: {
    shippingAddress: ShippingAddress;
    billingAddress?: ShippingAddress;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    notes?: string;
  }): Promise<Order> => {
    const response = await api.post('/orders', data);
    return response.data.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; pagination: OrderPagination }> => {
    const response = await api.get('/orders', { params });
    return response.data.data;
  },

  getAllAdmin: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
  }): Promise<{ orders: Order[]; pagination: OrderPagination }> => {
    const response = await api.get('/orders/admin/all', { params });
    return response.data.data;
  },

  getById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  },

  updateStatus: async (
    orderId: string,
    data: {
      status: string;
      message?: string;
      trackingNumber?: string;
      courierName?: string;
      trackingUrl?: string;
      estimatedDelivery?: string;
      dispatchedAt?: string;
      location?: string;
    }
  ): Promise<Order> => {
    const response = await api.patch(`/orders/${orderId}/status`, data);
    return response.data.data;
  },

  trackLookup: async (orderNumber: string, email: string): Promise<Order> => {
    const response = await api.get('/orders/track/lookup', {
      params: { orderNumber, email },
    });
    return response.data.data;
  },
};
