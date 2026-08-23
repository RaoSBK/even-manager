import { httpClient } from './httpClient';
import { Customer } from './customerApi';
import { EventDetails } from './eventApi';
import { Vendor } from './vendorApi';

export interface QuotationItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
  serviceType?: string;
  vendorId?: string;
  vendor?: Vendor;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  eventId?: string;
  customerId: string;
  validUntil?: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  notes?: string;
  createdAt: string;
  customer?: Customer;
  event?: EventDetails;
  items?: QuotationItem[];
}

export const quotationApi = {
  getAll: (filters: { search?: string; customerId?: string; status?: string } = {}) =>
    httpClient.get<Quotation[]>('/quotations', filters),

  getById: (id: string) =>
    httpClient.get<Quotation>(`/quotations/${id}`),

  create: (data: Partial<Quotation> & { items: QuotationItem[] }) =>
    httpClient.post<Quotation>('/quotations', data),

  update: (id: string, data: Partial<Quotation> & { items: QuotationItem[] }) =>
    httpClient.put<Quotation>(`/quotations/${id}`, data),

  updateStatus: (id: string, status: string) =>
    httpClient.patch<Quotation>(`/quotations/${id}/status`, { status })
};
