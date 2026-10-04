import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('tcet_user');
    const storedToken = localStorage.getItem('tcet_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);
  
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('tcet_user', JSON.stringify(userData));
    localStorage.setItem('tcet_token', authToken);
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tcet_user');
    localStorage.removeItem('tcet_token');
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
