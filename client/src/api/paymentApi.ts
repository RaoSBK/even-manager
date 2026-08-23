import { httpClient } from './httpClient';
import { Customer } from './customerApi';
import { BookingDetails } from './bookingApi';

export interface Payment {
  id: string;
  paymentNumber: string;
  bookingId?: string;
  customerId: string;
  amount: number;
  paymentMethod: 'CASH' | 'ONLINE' | 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'OTHER';
  transactionReference?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentDate: string;
  notes?: string;
  customer?: Customer;
  booking?: BookingDetails;
}

export const paymentApi = {
  getAll: (filters: { search?: string; bookingId?: string; customerId?: string; status?: string } = {}) =>
    httpClient.get<Payment[]>('/payments', filters),

  getById: (id: string) =>
    httpClient.get<Payment>(`/payments/${id}`),

  create: (data: Partial<Payment>) =>
    httpClient.post<Payment>('/payments', data),

  updateStatus: (id: string, status: string) =>
    httpClient.patch<Payment>(`/payments/${id}/status`, { status })
};
