import { API_HOST } from './httpClient';
const BASE_URL = `${API_HOST}/api/contact`;

export interface ContactMessagePayload {
  userId?: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  id: string;
  userId?: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export async function submitContactMessage(payload: ContactMessagePayload): Promise<{ message: string; enquiry: ContactMessageResponse }> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Submission failed');
  }

  return responseData;
}
