import { httpClient } from './httpClient';
import { Customer } from './customerApi';
import { BookingDetails } from './bookingApi';

export interface Payment {
  id: string;
  paymentNumber: string;
  bookingId?: string;
  customerId: string;
  amount: number;
  currency?: string;
  paymentMethod: 'CASH' | 'ONLINE' | 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'OTHER';
  transactionReference?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'PENDING' | 'PAID' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentDate: string;
  paidAt?: string;
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
    httpClient.patch<Payment>(`/payments/${id}/status`, { status }),

  verifyRazorpayPayment: (payload: {
    bookingId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    httpClient.post<{
      success: boolean;
      message: string;
      booking: BookingDetails;
      payment: Payment;
    }>('/payments/razorpay/verify', payload),

  retryRazorpayOrder: (bookingId: string) =>
    httpClient.post<{
      success: boolean;
      booking: BookingDetails;
      razorpayOrder: {
        id: string;
        amount: number;
        currency: string;
        key: string;
      };
    }>('/payments/razorpay/retry', { bookingId }),
};
