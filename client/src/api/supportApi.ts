const BASE_URL = 'http://localhost:5050/api/support';

export interface SupportRequestPayload {
  userId?: string;
  name: string;
  email: string;
  mobile: string;
  category: string;
  message: string;
}

export interface SupportRequestResponse {
  id: string;
  userId?: string;
  name: string;
  email: string;
  mobile: string;
  category: string;
  message: string;
  status: string;
  createdAt: string;
}

export async function submitSupportRequest(payload: SupportRequestPayload): Promise<{ message: string; request: SupportRequestResponse }> {
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
