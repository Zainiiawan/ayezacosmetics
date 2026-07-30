import { api } from './axios';

export type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa';

export interface ManualPaymentAccounts {
  jazzcash: { accountName: string; number: string; methodLabel: string };
  easypaisa: { accountName: string; number: string; methodLabel: string };
}

export const paymentApi = {
  getAccounts: async (): Promise<ManualPaymentAccounts> => {
    const response = await api.get('/payments/accounts');
    return response.data.data;
  },

  submitProof: async (
    orderId: string,
    data: {
      transactionId: string;
      paidAmount: number;
      screenshotUrl: string;
      screenshotPublicId?: string;
      note?: string;
    }
  ) => {
    const response = await api.post(`/payments/${orderId}/proof`, data);
    return response.data.data;
  },

  getPending: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/payments/pending', { params });
    return response.data.data;
  },

  verify: async (orderId: string, data: { action: 'approve' | 'reject'; rejectionReason?: string }) => {
    const response = await api.patch(`/payments/${orderId}/verify`, data);
    return response.data.data;
  },

  uploadScreenshot: async (file: File) => {
    const form = new FormData();
    form.append('files', file);
    const response = await api.post('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data[0] as { url: string; publicId: string; alt?: string };
  },
};
