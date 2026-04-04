import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150'
      });
      setLoading(false);
    }, 1000);
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({
        id: '1',
        email,
        name,
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150'
      });
      setLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};