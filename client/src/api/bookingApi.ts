const BASE_URL = 'http://localhost:5050/api/bookings/hall';

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
