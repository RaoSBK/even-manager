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

export interface HallManager {
  id: string;
  name: string;
  email: string;
  mobile: string;
  loginId?: string | null;
  isActive: boolean;
  createdAt?: string;
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
  ownerId?: string | null;
  manager?: HallManager | null;
}

export interface HallBookingCalendarEvent {
  id: string;
  title: string;
  start: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  clientName: string;
  notes?: string | null;
  eventType?: string | null;
  isBlocked?: boolean;
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

  getAdminOverview: async (): Promise<Hall[]> => {
    return httpClient.get<Hall[]>('/halls/admin/overview');
  },

  getMyHall: async (): Promise<Hall> => {
    return httpClient.get<Hall>('/halls/my-hall');
  },

  getById: async (id: string): Promise<Hall> => {
    return httpClient.get<Hall>(`/halls/${id}`);
  },

  create: async (payload: Partial<Hall> & {
    manager?: {
      name: string;
      loginId: string;
      email?: string;
      mobile?: string;
      password: string;
    };
  }): Promise<{ message: string; hall: Hall }> => {
    return httpClient.post('/halls', payload);
  },

  update: async (
    id: string,
    payload: Partial<Hall> & {
      manager?: {
        name?: string;
        loginId?: string;
        email?: string;
        mobile?: string;
        password?: string;
        isActive?: boolean;
        revoke?: boolean;
      };
    }
  ): Promise<{ message: string; hall: Hall }> => {
    return httpClient.put(`/halls/${id}`, payload);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return httpClient.delete(`/halls/${id}`);
  },

  getBookingsCalendar: async (id: string, start: string, end: string): Promise<HallBookingCalendarEvent[]> => {
    return httpClient.get<HallBookingCalendarEvent[]>(`/halls/${id}/bookings`, { start, end });
  },

  // Hall Manager Management
  assignManager: async (hallId: string, data: {
    userId?: string;
    name?: string;
    loginId?: string;
    email?: string;
    mobile?: string;
    password?: string;
  }): Promise<{ message: string; manager: HallManager }> => {
    return httpClient.post(`/halls/${hallId}/manager`, data);
  },

  resetManagerPassword: async (hallId: string, newPassword: string): Promise<{ message: string }> => {
    return httpClient.post(`/halls/${hallId}/manager/reset-password`, { newPassword });
  },

  toggleManagerActive: async (hallId: string, isActive: boolean): Promise<{ message: string; isActive: boolean }> => {
    return httpClient.patch(`/halls/${hallId}/manager/toggle-active`, { isActive });
  },

  revokeManager: async (hallId: string): Promise<{ message: string }> => {
    return httpClient.delete(`/halls/${hallId}/manager`);
  },

  // Manager Availability & Status Controls
  updateMyHallStatus: async (status: 'AVAILABLE' | 'MAINTENANCE' | 'INACTIVE'): Promise<{ message: string; status: string; hall: Hall }> => {
    return httpClient.patch('/halls/my-hall/status', { status });
  },

  toggleDateAvailability: async (data: {
    date: string;
    reason?: string;
    available?: boolean;
    bookingId?: string;
  }): Promise<{ message: string; available: boolean; date: string; block?: any }> => {
    return httpClient.post('/halls/my-hall/toggle-date', data);
  },
};
