import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.getWishlist();
      if (res.success && res.data) {
        setWishlistItems(res.data);
      }
    } catch (err) {
      console.warn('Using local wishlist fallback:', err.message);
    }
  };

  const toggleWishlist = async (product) => {
    const productId = product._id || product.id;
    setWishlistItems(prev => {
      const exists = prev.some(item => (item._id || item.id) === productId);
      if (exists) {
        return prev.filter(item => (item._id || item.id) !== productId);
      } else {
        return [...prev, product];
      }
    });

    try {
      await api.toggleWishlist(productId);
    } catch (e) {
      // ignore
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => (item._id || item.id) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        toggleWishlist,
        isInWishlist,
        loading
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

