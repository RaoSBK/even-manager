const BASE_URL = 'http://localhost:5050/api/auth';

export interface SignupData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  referralCode?: string;
}

export interface LoginCredentials {
  mobile: string;
  password: string;
}

export async function signupUser(data: SignupData) {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Signup failed');
  }

  return responseData;
}

export async function loginUser(credentials: LoginCredentials) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Login failed');
  }

  return responseData;
}

export async function forgotPassword(mobile: string) {
  const response = await fetch(`${BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Password recovery failed');
  }

  return responseData;
}

export async function resetPassword(data: { mobile: string; otp: string; password: string }) {
  const response = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Password reset failed');
  }

  return responseData;
}

export async function verifySession(token: string) {
  const response = await fetch(`${BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Session verification failed');
  }

  return responseData;
}
