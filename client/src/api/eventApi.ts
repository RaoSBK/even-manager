import { httpClient } from './httpClient';

export interface EventPayload {
  customerId: string;
  eventName: string;
  eventType: string;
  description?: string;
  eventDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  expectedGuestCount?: number;
  budget?: number;
  notes?: string;
  hallId?: string;
  coordinatorIds?: string[];
}

export interface EventDetails {
  id: string;
  eventCode: string;
  customerId: string;
  eventName: string;
  eventType: string;
  description: string | null;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  expectedGuestCount: number | null;
  status: 'DRAFT' | 'PLANNING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  budget: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;
  booking?: {
    id: string;
    bookingNumber: string;
    status: string;
    totalAmount: number;
    hall?: {
      id: string;
      name: string;
    } | null;
  } | null;
  eventTimelines?: any[];
  tasks?: any[];
}

export const eventApi = {
  getAll: async (filters?: { search?: string; status?: string }): Promise<EventDetails[]> => {
    return httpClient.get<EventDetails[]>('/events', filters);
  },

  getById: async (id: string): Promise<EventDetails> => {
    return httpClient.get<EventDetails>(`/events/${id}`);
  },

  create: async (payload: EventPayload): Promise<{ message: string; event: EventDetails }> => {
    return httpClient.post('/events', payload);
  },

  update: async (id: string, payload: Partial<EventPayload>): Promise<{ message: string; event: EventDetails }> => {
    return httpClient.put(`/events/${id}`, payload);
  },

  cancel: async (id: string): Promise<{ message: string; event: EventDetails }> => {
    return httpClient.patch(`/events/${id}/cancel`);
  },

  createTask: async (eventId: string, payload: any): Promise<any> => {
    return httpClient.post(`/events/${eventId}/tasks`, payload);
  },

  updateTask: async (taskId: string, payload: any): Promise<any> => {
    return httpClient.put(`/events/tasks/${taskId}`, payload);
  },

  deleteTask: async (taskId: string): Promise<any> => {
    return httpClient.delete(`/events/tasks/${taskId}`);
  },
};
