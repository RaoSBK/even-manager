import { httpClient } from './httpClient';
import { Customer } from './customerApi';
import { BookingDetails } from './bookingApi';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId?: string;
  customerId: string;
  issueDate: string;
  dueDate?: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  customer?: Customer;
  booking?: BookingDetails;
  items?: InvoiceItem[];
}

export const invoiceApi = {
  getAll: (filters: { search?: string; bookingId?: string; customerId?: string; status?: string } = {}) =>
    httpClient.get<Invoice[]>('/invoices', filters),

  getById: (id: string) =>
    httpClient.get<Invoice>(`/invoices/${id}`),

  create: (data: Partial<Invoice> & { items: InvoiceItem[] }) =>
    httpClient.post<Invoice>('/invoices', data),

  updateStatus: (id: string, status: string) =>
    httpClient.patch<Invoice>(`/invoices/${id}/status`, { status })
};
