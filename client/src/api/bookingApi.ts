import { API_HOST } from './httpClient';
const BASE_URL = `${API_HOST}/api/bookings/hall`;

export interface HallBookingPayload {
  userId: string;
  customerName: string;
  email: string;
  mobile: string;
  state: string;
  district: string;
  mandal: string;
  hallId: string;
  hallName: string;
  hallAddress: string;
  eventDate: string;
  costPerDay: number;
  totalAmount: number;
  capacity?: number;
  eventType: string;
  guestsCount: number;
  eventSession: string;
  foodItems?: Array<{ id: string; name: string; price: number }>;
}

export interface HallBookingResponse {
  bookingId: string;
  userId: string;
  customerName: string;
  email: string;
  mobile: string;
  state: string;
  district: string;
  mandal: string;
  hallId: string;
  hallName: string;
  hallAddress: string;
  eventDate: string;
  bookingDate: string;
  costPerDay: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  eventType: string;
  guestsCount: number;
  eventSession: string;
  foodItems?: string | null; // stored as JSON string in database
  updatedAt?: string;
  paymentStatus?: string;
  specialNotes?: string;
  startTime?: string;
  endTime?: string;
}

export async function createHallBooking(bookingData: HallBookingPayload): Promise<{ message: string; booking: HallBookingResponse }> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Booking failed');
  }

  return responseData;
}

export async function getHallBookings(userId?: string): Promise<HallBookingResponse[]> {
  const url = userId ? `${BASE_URL}?userId=${encodeURIComponent(userId)}` : BASE_URL;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to fetch bookings');
  }

  return responseData;
}

export async function cancelHallBooking(bookingId: string): Promise<{ message: string }> {
  const response = await fetch(`${BASE_URL}/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Booking cancellation failed');
  }

  return responseData;
}

export async function updateBookingFood(
  bookingId: string,
  foodItems: any[]
): Promise<{ message: string; booking: HallBookingResponse }> {
  const response = await fetch(`${BASE_URL}/${bookingId}/food`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ foodItems }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to update booking food items');
  }

  return responseData;
}

export async function updateHallBooking(
  bookingId: string,
  updateData: any
): Promise<{ message: string; booking: HallBookingResponse }> {
  const response = await fetch(`${BASE_URL}/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to update booking details');
  }

  return responseData;
}

export interface BookingHistoryResponse {
  id: string;
  bookingId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedAt: string;
  changedBy: string;
}

export async function getBookingHistory(bookingId: string): Promise<BookingHistoryResponse[]> {
  const response = await fetch(`${BASE_URL}/${bookingId}/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to fetch booking history');
  }

  return responseData;
}
