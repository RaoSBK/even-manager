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
}

const DEMO_USERS: Record<string, User & { passwordHash: string }> = {
  'admin@gkevent.com': {
    id: 'ADM001',
    name: 'GK Admin',
    email: 'admin@gkevent.com',
    mobile: '9999999999',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100',
    status: 'active',
    passwordHash: 'Admin@123'
  },
  'employee@gkevent.com': {
    id: 'EMP001',
    name: 'GK Employee',
    email: 'employee@gkevent.com',
    mobile: '8888888888',
    role: 'EMPLOYEE',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100',
    status: 'active',
    passwordHash: 'Employee@123'
  },
  'user@gkevent.com': {
    id: 'USR001',
    name: 'Rahul Kumar',
    email: 'user@gkevent.com',
    mobile: '9876543210',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100',
    status: 'active',
    passwordHash: 'User@123'
  },
  'disabled@gkevent.com': {
    id: 'USR002',
    name: 'Disabled User',
    email: 'disabled@gkevent.com',
    mobile: '5555555555',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100',
    status: 'disabled',
    passwordHash: 'Disabled@123'
  }
};

const SESSION_KEY = 'gk_events_session';
const PENDING_SIGNUP_KEY = 'gk_events_pending_signup';

export const demoAuthService = {
  login: async (emailOrMobile: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const email = emailOrMobile.trim().toLowerCase();
        let targetUser = Object.values(DEMO_USERS).find(
          (u) => u.email.toLowerCase() === email || u.mobile === emailOrMobile
        );

        if (!targetUser || targetUser.passwordHash !== password) {
          reject(new Error('Invalid email or password.'));
          return;
        }

        if (targetUser.status === 'disabled') {
          reject(new Error('Your account has been disabled. Please contact the administrator.'));
          return;
        }

        const { passwordHash, ...userProfile } = targetUser;
        localStorage.setItem(SESSION_KEY, JSON.stringify(userProfile));
        resolve(userProfile);
      }, 500);
    });
  },

  signup: async (data: SignupData): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!data.name || !data.email || !data.mobile || !data.password) {
          reject(new Error('All fields are required.'));
          return;
        }
        if (!data.email.includes('@')) {
          reject(new Error('Invalid email format.'));
          return;
        }
        if (data.mobile.length !== 10 || isNaN(Number(data.mobile))) {
          reject(new Error('Mobile number must be a 10-digit number.'));
          return;
        }

        // Store pending user registration
        const pendingUser = {
          id: `USR${Math.floor(100 + Math.random() * 900)}`,
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          role: 'USER' as UserRole,
          status: 'active',
          passwordHash: data.password
        };

        localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(pendingUser));
        resolve();
      }, 500);
    });
  },

  verifyOTP: async (otp: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp !== '123456') {
          reject(new Error('OTP invalid or expired. Please use the demo code 123456.'));
          return;
        }

        const pendingStr = localStorage.getItem(PENDING_SIGNUP_KEY);
        if (!pendingStr) {
          reject(new Error('No pending registration found. Please sign up again.'));
          return;
        }

        const pendingUser = JSON.parse(pendingStr);
        // Save to demo users mock db in memory (or localStorage to keep it persistent)
        DEMO_USERS[pendingUser.email] = pendingUser;

        const { passwordHash, ...userProfile } = pendingUser;
        localStorage.setItem(SESSION_KEY, JSON.stringify(userProfile));
        localStorage.removeItem(PENDING_SIGNUP_KEY);
        resolve(userProfile);
      }, 500);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem(SESSION_KEY);
        resolve();
      }, 200);
    });
  },

  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }
};
