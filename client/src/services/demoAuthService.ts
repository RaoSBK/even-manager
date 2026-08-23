export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'disabled' | string;
}

export interface SignupData {
  name: string;
  email: string;
  mobile: string;
  password?: string;
  referralCode?: string;
}

const SESSION_KEY = 'gk_events_session';
const TOKEN_KEY = 'gk_events_token';
const PENDING_SIGNUP_KEY = 'gk_events_pending_signup';

const BACKEND_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api`;

function mapRole(backendRole: string): UserRole {
  const roleUpper = (backendRole || '').toUpperCase();
  if (roleUpper === 'ADMIN') return 'ADMIN';
  if (roleUpper === 'EMPLOYEE') return 'EMPLOYEE';
  return 'USER';
}

export const demoAuthService = {
  login: async (emailOrMobile: string, password: string): Promise<User> => {
    const response = await fetch(`${BACKEND_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ emailOrMobile, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const mappedUser: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      mobile: data.user.mobile,
      role: mapRole(data.user.role),
      status: 'active',
      avatar: data.user.role.toUpperCase() === 'ADMIN'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'
        : data.user.role.toUpperCase() === 'EMPLOYEE'
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100'
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(mappedUser));
    localStorage.setItem(TOKEN_KEY, data.token);

    return mappedUser;
  },

  signup: async (data: SignupData): Promise<void> => {
    if (!data.name || !data.email || !data.mobile || !data.password) {
      throw new Error('All fields are required.');
    }
    if (!data.email.includes('@')) {
      throw new Error('Invalid email format.');
    }
    if (data.mobile.length !== 10 || isNaN(Number(data.mobile))) {
      throw new Error('Mobile number must be a 10-digit number.');
    }

    // Save registration info to localStorage so we can submit it upon OTP verification
    localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(data));
  },

  verifyOTP: async (otp: string): Promise<User> => {
    if (otp !== '123456') {
      throw new Error('OTP invalid or expired. Please use the demo code 123456.');
    }

    const pendingStr = localStorage.getItem(PENDING_SIGNUP_KEY);
    if (!pendingStr) {
      throw new Error('No pending registration found. Please sign up again.');
    }

    const pendingData = JSON.parse(pendingStr);

    const response = await fetch(`${BACKEND_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pendingData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup registration failed');
    }

    const mappedUser: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      mobile: data.user.mobile,
      role: mapRole(data.user.role),
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100'
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(mappedUser));
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.removeItem(PENDING_SIGNUP_KEY);

    return mappedUser;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }
};
