import { httpClient } from './httpClient';
import { Customer } from './customerApi';
import { BookingDetails } from './bookingApi';

export type PaymentMethodType =
  | 'CASH'
  | 'ONLINE'
  | 'BANK_TRANSFER'
  | 'UPI'
  | 'CARD'
  | 'OTHER'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'NET_BANKING'
  | 'WALLET';

export interface PaymentAccountSettings {
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  upiId?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankName?: string;
  isRazorpayEnabled?: boolean;
  isUpiEnabled?: boolean;
  isBankTransferEnabled?: boolean;
  qrCodeUrl?: string;
  merchantName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  gatewayPublicKey?: string;
  gatewaySecretKey?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PublicPaymentSettings {
  razorpayKeyId?: string;
  upiId?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankName?: string;
  isRazorpayEnabled?: boolean;
  isUpiEnabled?: boolean;
  isBankTransferEnabled?: boolean;
  qrCodeUrl?: string;
  merchantName?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  bookingId?: string;
  customerId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethodType;
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
  upiId?: string;
  upiApp?: string;
  cardHolder?: string;
  cardNumber?: string;
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  cardCvc?: string;
  bankName?: string;
  walletName?: string;
  walletMobile?: string;
}

export interface PaymentDetails extends Payment {
  receiptUrl?: string;
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

  getAdminPaymentSettings: () =>
    httpClient.get<PaymentAccountSettings>('/payments/settings/admin'),

  updateAdminPaymentSettings: (data: Partial<PaymentAccountSettings>) =>
    httpClient.post<{ message: string; settings: PaymentAccountSettings }>('/payments/settings/admin', data),

  getPublicPaymentSettings: () =>
    httpClient.get<PublicPaymentSettings>('/payments/settings/public'),

  createPaymentOrder: (data: any) =>
    httpClient.post<any>('/payments/order', data),

  processPayment: (data: any) =>
    httpClient.post<any>('/payments/process', data),
};

export const getAdminPaymentSettings = paymentApi.getAdminPaymentSettings;
export const updateAdminPaymentSettings = paymentApi.updateAdminPaymentSettings;
export const getPublicPaymentSettings = paymentApi.getPublicPaymentSettings;
export const createPaymentOrder = paymentApi.createPaymentOrder;
export const processPayment = paymentApi.processPayment;
