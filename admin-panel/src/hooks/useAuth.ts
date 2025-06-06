import { useState } from 'react';
import { type User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };
};