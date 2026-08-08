import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, SignupData, demoAuthService } from '../services/demoAuthService';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrMobile: string, password: string) => Promise<User>;
  signup: (data: SignupData) => Promise<void>;
  verifyOTP: (otp: string) => Promise<User>;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;
  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load persistent session on mount
  useEffect(() => {
    const sessionUser = demoAuthService.getCurrentUser();
    if (sessionUser) {
      setUser(sessionUser);
    }
    setLoading(false);
  }, []);

  const login = async (emailOrMobile: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const loggedUser = await demoAuthService.login(emailOrMobile, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<void> => {
    setLoading(true);
    try {
      await demoAuthService.signup(data);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string): Promise<User> => {
    setLoading(true);
    try {
      const verifiedUser = await demoAuthService.verifyOTP(otp);
      setUser(verifiedUser);
      return verifiedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await demoAuthService.logout();
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
        verifyOTP,
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
