import { api } from './axios';

export interface UploadedFile {
  url: string;
  publicId: string;
  alt?: string;
}

export interface SmtpStatus {
  ok: boolean;
  message: string;
  host?: string;
  port?: number;
  user?: string;
}

export const mediaApi = {
  upload: async (files: File[]): Promise<UploadedFile[]> => {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    const response = await api.post('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getSmtpStatus: async (): Promise<SmtpStatus> => {
    const response = await api.get('/media/smtp-status');
    return response.data.data;
  },
};
