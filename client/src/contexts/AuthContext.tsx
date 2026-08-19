import React, { createContext, useState, useContext, useEffect } from 'react';
import { signupUser, loginUser, verifySession } from '../api/authApi';

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  status: string;
}

export interface SignupData {
  name: string;
  email: string;
  mobile: string;
  password?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrMobile: string, password: string) => Promise<User>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;
  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendRoleToFrontend(role: string): UserRole {
  const norm = role.toUpperCase();
  if (norm === 'ADMIN' || norm === 'SUPER ADMIN') return 'ADMIN';
  if (norm === 'EMPLOYEE') return 'EMPLOYEE';
  return 'USER';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('gk_events_token');
      if (token) {
        try {
          const response = await verifySession(token);
          const backendUser = response.user;
          const mappedUser: User = {
            id: backendUser.id,
            name: backendUser.name,
            email: backendUser.email,
            mobile: backendUser.mobile,
            role: mapBackendRoleToFrontend(backendUser.role),
            status: 'active'
          };
          setUser(mappedUser);
        } catch (error) {
          console.error('Session restoration failed:', error);
          localStorage.removeItem('gk_events_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (emailOrMobile: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await loginUser({ mobile: emailOrMobile, password });
      const { token, user: backendUser } = response;

      const mappedUser: User = {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        mobile: backendUser.mobile,
        role: mapBackendRoleToFrontend(backendUser.role),
        status: 'active'
      };

      localStorage.setItem('gk_events_token', token);
      setUser(mappedUser);
      return mappedUser;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<void> => {
    setLoading(true);
    try {
      await signupUser({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: data.password || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      localStorage.removeItem('gk_events_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = (): User | null => {
    return user;
  };

  const isAuthenticated = (): boolean => {
    return user !== null;
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        getCurrentUser,
        isAuthenticated,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
