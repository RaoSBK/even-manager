import { httpClient } from './httpClient';

export interface VendorServiceItem {
  id?: string;
  name: string;
  description?: string;
  basePrice?: number;
}

export interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
  notes?: string;
  services?: VendorServiceItem[];
  createdAt: string;
}

export const vendorApi = {
  getAll: (filters: { search?: string; category?: string; status?: string } = {}) =>
    httpClient.get<Vendor[]>('/vendors', filters),
  
  getById: (id: string) =>
    httpClient.get<Vendor>(`/vendors/${id}`),

  create: (data: Partial<Vendor>) =>
    httpClient.post<Vendor>('/vendors', data),

  update: (id: string, data: Partial<Vendor>) =>
    httpClient.put<Vendor>(`/vendors/${id}`, data),

  delete: (id: string) =>
    httpClient.delete<Vendor>(`/vendors/${id}`)
};
