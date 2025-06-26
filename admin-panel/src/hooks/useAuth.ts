import { useState, useEffect, useCallback } from 'react';
import { type User } from '../types';

const EXPIRY_MS = 60 * 60* 1000;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0); // Lisää tämä!

  const logout = useCallback(() => {
    // console.log('Logging out...');
    setUser(null);
    setAuthToken(null);
    sessionStorage.clear();
    setForceUpdate(prev => prev + 1); // Pakota re-render!
    // console.log('Logged out!');
  }, []);

  const checkTokenExpiry = useCallback(() => {
    const loginTimeStr = sessionStorage.getItem('loginTime');
    if (!loginTimeStr) return false;

    const loginTime = parseInt(loginTimeStr, 10);
    const now = Date.now();
    
    return now - loginTime > EXPIRY_MS;
  }, []);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('authToken');
    const savedUser = sessionStorage.getItem('user');
    const loginTimeStr = sessionStorage.getItem('loginTime');

    if (!savedToken || !savedUser || !loginTimeStr) return;

    if (checkTokenExpiry()) {
      logout();
      return;
    }

    try {
      setAuthToken(savedToken);
      setUser(JSON.parse(savedUser));

      const loginTime = parseInt(loginTimeStr, 10);
      const timeLeft = EXPIRY_MS - (Date.now() - loginTime);
      
      // console.log(`Token expires in ${Math.floor(timeLeft / 1000)} seconds`);
      
      const timeoutId = setTimeout(() => {
        // console.log('Token expired, logging out...');
        logout();
      }, timeLeft);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Virhe session latauksessa:', error);
      logout();
    }
  }, [logout, checkTokenExpiry, forceUpdate]); // Lisää forceUpdate riippuvuuksiin

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAuthToken(token);
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('loginTime', Date.now().toString());
    setForceUpdate(prev => prev + 1); // Varmista re-render myös loginissa
  };

  return {
    user,
    authToken,
    login,
    logout,
    isAuthenticated: !!user && !!authToken
  };
};