import { httpClient } from './httpClient';

export interface CustomerPayload {
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  notes?: string;
  password?: string;
}

export interface Customer {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: {
    isActive: boolean;
    createdAt: string;
  } | null;
  bookings?: any[];
  events?: any[];
  payments?: any[];
  invoices?: any[];
}

export const customerApi = {
  getAll: async (search?: string): Promise<Customer[]> => {
    return httpClient.get<Customer[]>('/users/customers', { search });
  },

  getById: async (id: string): Promise<Customer> => {
    return httpClient.get<Customer>(`/users/customers/${id}`);
  },

  create: async (payload: CustomerPayload): Promise<{ message: string; customer: Customer }> => {
    return httpClient.post('/users/customers', payload);
  },

  update: async (id: string, payload: Partial<CustomerPayload>): Promise<{ message: string; customer: Customer }> => {
    return httpClient.put(`/users/customers/${id}`, payload);
  },

  toggleActive: async (id: string): Promise<{ message: string; isActive: boolean }> => {
    return httpClient.patch(`/users/customers/${id}/toggle-active`);
  },
};
