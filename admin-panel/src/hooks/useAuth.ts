import { useState, useEffect } from 'react';
import { type User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Lataa tallennettu sessio sivun latauksen yhteydessä
  useEffect(() => {
    const savedToken = sessionStorage.getItem('authToken');
    const savedUser = sessionStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setAuthToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Virhe tallennetun session latauksessa:', error);
        // Poista virheelliset tiedot
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAuthToken(token);
    
    // Tallenna sessionStorageen jotta kirjautuminen säilyy sivun päivityksen yli
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    
    // Poista sessionStoragesta
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
  };

  return {
    user,
    authToken,
    login,
    logout,
    isAuthenticated: !!user && !!authToken
  };
};