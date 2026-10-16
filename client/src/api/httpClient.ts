import { demoAuthService } from '../services/demoAuthService';

const getApiHost = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5050';
};

export const API_HOST = getApiHost();
const BASE_URL = `${API_HOST}/api`;

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const cleanParams = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {});
    
    const queryString = new URLSearchParams(cleanParams).toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = demoAuthService.getToken();
  const requestHeaders = new Headers(headers);
  
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (!(restOptions.body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  });

  if (response.status === 401) {
    // Session expired or unauthorized
    await demoAuthService.logout();
    // Redirect to login page
    window.location.href = '/login';
    throw new Error('Your session has expired. Please log in again.');
  }

  let responseData;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const errorMessage = (responseData && typeof responseData === 'object' && responseData.message)
      ? responseData.message
      : `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return responseData as T;
}

export const httpClient = {
  get: <T>(endpoint: string, params?: Record<string, any>, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', params, ...options }),
  
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...options }),
  
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...options }),
  
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...options }),
  
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};

