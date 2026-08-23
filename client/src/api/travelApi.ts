import { httpClient } from './httpClient';
import { Customer } from './customerApi';
import { EventDetails } from './eventApi';

export interface TravelBooking {
  id: string;
  eventId?: string;
  customerId: string;
  travelType: string;
  provider?: string;
  bookingReference?: string;
  departureLocation?: string;
  destination?: string;
  departureAt?: string;
  arrivalAt?: string;
  passengerCount: number;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  customer?: Customer;
  event?: EventDetails;
}

export const travelApi = {
  getAll: (filters: { search?: string; eventId?: string; customerId?: string; status?: string } = {}) =>
    httpClient.get<TravelBooking[]>('/travel', filters),

  getById: (id: string) =>
    httpClient.get<TravelBooking>(`/travel/${id}`),

  create: (data: Partial<TravelBooking>) =>
    httpClient.post<TravelBooking>('/travel', data),

  update: (id: string, data: Partial<TravelBooking>) =>
    httpClient.put<TravelBooking>(`/travel/${id}`, data),

  delete: (id: string) =>
    httpClient.delete<TravelBooking>(`/travel/${id}`)
};
