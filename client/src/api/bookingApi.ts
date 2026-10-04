import { httpClient } from './httpClient';

export interface BookingPayload {
  hallId: string;
  eventType: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  guestCount: number;
  notes?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface BookingDetails {
  id: string;
  bookingNumber: string;
  eventId: string | null;
  customerId: string | null;
  userId: string | null;
  hallId: string | null;
  eventType: string | null;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  guestCount: number | null;
  bookingDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  totalAmount: number;
  advanceAmount: number | null;
  balanceAmount: number | null;
  notes: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    mobile: string;
  } | null;
  hall?: {
    id: string;
    hallCode: string;
    name: string;
    description: string | null;
    location: string | null;
    capacity: number | null;
    basePrice: number;
  } | null;
}

export const bookingApi = {
  create: async (payload: BookingPayload): Promise<{ success: boolean; message: string; booking: BookingDetails }> => {
    return httpClient.post('/bookings', payload);
  },
  
  getMyBookings: async (): Promise<BookingDetails[]> => {
    return httpClient.get('/bookings/my-bookings');
  },
  
  getById: async (id: string): Promise<BookingDetails> => {
    return httpClient.get(`/bookings/${id}`);
  },
  
  getAll: async (): Promise<BookingDetails[]> => {
    return httpClient.get('/bookings');
  },
  
  updateStatus: async (id: string, status: string): Promise<{ message: string; booking: BookingDetails }> => {
    return httpClient.patch(`/bookings/${id}/status`, { status });
  },
  
  cancel: async (id: string): Promise<{ message: string; booking: BookingDetails }> => {
    return httpClient.patch(`/bookings/${id}/cancel`);
  },
  
  getHistory: async (id: string): Promise<any[]> => {
    return httpClient.get(`/bookings/hall/${id}/history`);
  },
};

