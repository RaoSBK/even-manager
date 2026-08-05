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
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Default logged in for easy routing
  const [user, setUser] = useState<User | null>({
    name: 'Rao SBK',
    email: 'raosbk@example.com',
    role: 'Customer', // Default to Customer role
    phone: '+91 98765 43210'
  });
  const [loading, setLoading] = useState<boolean>(false);

  const login = (role: UserRole) => {
    setLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setUser({
        name: role === 'Customer' ? 'Rao SBK' : 'GK Admin',
        email: role === 'Customer' ? 'customer@gkevents.com' : 'admin@gkevents.com',
        role: role,
        phone: '+91 98765 43210'
      });
      setLoading(false);
    }, 200);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
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
