import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user',
    reputation: 1250,
    joinedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    role: 'admin',
    reputation: 3450,
    joinedAt: new Date('2022-11-20')
  },
  {
    id: '3',
    username: 'dev_guru',
    email: 'guru@example.com',
    role: 'user',
    reputation: 2890,
    joinedAt: new Date('2023-03-10')
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('stackit_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Mock login - in real app, this would be an API call
    const mockUser = mockUsers.find(u => u.email === email);
    if (mockUser && password === 'password') {
      setUser(mockUser);
      localStorage.setItem('stackit_user', JSON.stringify(mockUser));
    } else {
      throw new Error('Invalid credentials');
    }
    setIsLoading(false);
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    // Mock registration
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      role: 'user',
      reputation: 0,
      joinedAt: new Date()
    };
    setUser(newUser);
    localStorage.setItem('stackit_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stackit_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};