import React, { createContext, useState, useContext } from 'react';

export type UserRole = 'Customer' | 'Admin' | 'Super Admin';

interface User {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (role: UserRole, userDetails?: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_isAuthenticated') === 'true';
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  const login = (role: UserRole, userDetails?: Partial<User>) => {
    setLoading(true);
    setTimeout(() => {
      const loggedInUser: User = {
        name: userDetails?.name || (role === 'Customer' ? 'Rao SBK' : 'GK Admin'),
        email: userDetails?.email || (role === 'Customer' ? 'customer@gkevents.com' : 'admin@gkevents.com'),
        role: role,
        phone: userDetails?.phone || (role === 'Customer' ? '+91 98765 43210' : undefined)
      };
      setIsAuthenticated(true);
      setUser(loggedInUser);
      localStorage.setItem('auth_isAuthenticated', 'true');
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
      setLoading(false);
    }, 200);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth_isAuthenticated');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
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
