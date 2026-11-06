// ==============================================================================
// SHOPSPHERE - Authentication Context Provider
// Roles: CUSTOMER, SELLER, SUPER_ADMIN with Demo Switcher & Google OAuth Flow
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('shopsphere_token') || localStorage.getItem('cloudops_token');
    const savedUser = localStorage.getItem('shopsphere_user') || localStorage.getItem('cloudops_user');

    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Verify token with backend
        api.getMe()
          .then(res => {
            if (res.success) {
              setUser(res.data);
              localStorage.setItem('shopsphere_user', JSON.stringify(res.data));
            }
          })
          .catch(() => {
            // Keep cached user for offline development resilience
          })
          .finally(() => setLoading(false));
      } catch (e) {
        setLoading(false);
      }
    } else {
      // Auto-initialize demo customer for instant testing
      const defaultDemo = {
        _id: 'usr-customer-1',
        id: 'usr-customer-1',
        name: 'Rahul Sharma (Customer)',
        email: 'customer@shopsphere.io',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'
      };
      setUser(defaultDemo);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      setUser(res.data.user);
      localStorage.setItem('shopsphere_token', res.data.token);
      localStorage.setItem('shopsphere_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      setUser(res.data.user);
      localStorage.setItem('shopsphere_token', res.data.token);
      localStorage.setItem('shopsphere_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const googleLogin = async (googleData) => {
    const res = await api.googleLogin(googleData);
    if (res.success) {
      setUser(res.data.user);
      localStorage.setItem('shopsphere_token', res.data.token);
      localStorage.setItem('shopsphere_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shopsphere_token');
    localStorage.removeItem('shopsphere_user');
    localStorage.removeItem('cloudops_token');
    localStorage.removeItem('cloudops_user');
  };

  const loginAsDemoAdmin = async () => {
    return login('admin@shopsphere.io', 'Admin@123').catch(() => {
      // Fallback in case of mock offline
      const admin = {
        id: 'usr-admin-1',
        _id: 'usr-admin-1',
        name: 'Super Admin',
        email: 'admin@shopsphere.io',
        role: 'SUPER_ADMIN',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      };
      setUser(admin);
      localStorage.setItem('shopsphere_user', JSON.stringify(admin));
    });
  };

  const loginAsDemoSeller = async () => {
    return login('seller@shopsphere.io', 'Seller@123').catch(() => {
      const seller = {
        id: 'usr-seller-1',
        _id: 'usr-seller-1',
        name: 'Apex Merchant',
        email: 'seller@shopsphere.io',
        role: 'SELLER',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      };
      setUser(seller);
      localStorage.setItem('shopsphere_user', JSON.stringify(seller));
    });
  };

  const loginAsDemoCustomer = async () => {
    return login('customer@shopsphere.io', 'Customer@123').catch(() => {
      const customer = {
        id: 'usr-customer-1',
        _id: 'usr-customer-1',
        name: 'Rahul Sharma',
        email: 'customer@shopsphere.io',
        role: 'CUSTOMER',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'
      };
      setUser(customer);
      localStorage.setItem('shopsphere_user', JSON.stringify(customer));
    });
  };

  const role = user?.role?.toUpperCase();
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isSeller = role === 'SELLER' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        loginAsDemoAdmin,
        loginAsDemoSeller,
        loginAsDemoCustomer,
        isAdmin,
        isSeller,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
