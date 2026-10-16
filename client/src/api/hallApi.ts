import { httpClient } from './httpClient';

export interface HallAvailabilityResponse {
  date: string;
  halls: Array<{
    id: string;
    name: string;
    hallCode: string;
    description: string | null;
    location: string | null;
    state?: string | null;
    district?: string | null;
    mandal?: string | null;
    capacity: number | null;
    basePrice: number;
    status: string;
    available: boolean;
  }>;
}

export interface Hall {
  id: string;
  hallCode: string;
  name: string;
  description: string | null;
  location: string | null;
  state?: string | null;
  district?: string | null;
  mandal?: string | null;
  capacity: number | null;
  basePrice: number;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface HallBookingCalendarEvent {
  id: string;
  title: string;
  start: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  clientName: string;
}

export const hallApi = {
  checkAvailability: async (
    date: string,
    startTime?: string,
    endTime?: string
  ): Promise<HallAvailabilityResponse> => {
    return httpClient.get<HallAvailabilityResponse>('/halls/availability', {
      date,
      startTime,
      endTime,
    });
  },

  getAll: async (): Promise<Hall[]> => {
    return httpClient.get<Hall[]>('/halls');
  },

  getById: async (id: string): Promise<Hall> => {
    return httpClient.get<Hall>(`/halls/${id}`);
  },

  create: async (payload: Partial<Hall>): Promise<{ message: string; hall: Hall }> => {
    return httpClient.post('/halls', payload);
  },

  update: async (id: string, payload: Partial<Hall>): Promise<{ message: string; hall: Hall }> => {
    return httpClient.put(`/halls/${id}`, payload);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return httpClient.delete(`/halls/${id}`);
  },

  getBookingsCalendar: async (id: string, start: string, end: string): Promise<HallBookingCalendarEvent[]> => {
    return httpClient.get<HallBookingCalendarEvent[]>(`/halls/${id}/bookings`, { start, end });
  },
};
