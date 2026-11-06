import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cloudops_token');
    const savedUser = localStorage.getItem('cloudops_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token with backend
        api.getMe()
          .then(res => {
            if (res.success) {
              setUser(res.data);
              localStorage.setItem('cloudops_user', JSON.stringify(res.data));
            }
          })
          .catch(() => {
            // If token invalid, keep cached user for offline demo resilience or log out
          })
          .finally(() => setLoading(false));
      } catch (e) {
        setLoading(false);
      }
    } else {
      // Default to demo customer login for effortless initial exploration
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      setUser(res.data.user);
      localStorage.setItem('cloudops_token', res.data.token);
      localStorage.setItem('cloudops_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register({ name, email, password });
    if (res.success) {
      setUser(res.data.user);
      localStorage.setItem('cloudops_token', res.data.token);
      localStorage.setItem('cloudops_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cloudops_token');
    localStorage.removeItem('cloudops_user');
  };

  const loginAsDemoAdmin = async () => {
    return login('admin@ecommerce.io', 'Admin@123');
  };

  const loginAsDemoUser = async () => {
    return login('user@ecommerce.io', 'User@123');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loginAsDemoAdmin,
        loginAsDemoUser,
        isAdmin,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

