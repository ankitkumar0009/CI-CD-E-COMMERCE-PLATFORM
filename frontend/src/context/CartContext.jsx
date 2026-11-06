import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.getCart();
      if (res.success && res.data.items) {
        setCartItems(res.data.items);
      }
    } catch (err) {
      console.warn('Could not fetch cart from backend, using local fallback:', err.message);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    setLoading(true);
    try {
      const res = await api.addToCart(product._id || product.id, quantity);
      if (res.success && res.data.items) {
        setCartItems(res.data.items);
      }
      setIsCartOpen(true);
    } catch (err) {
      // Local state fallback
      setCartItems(prev => {
        const existing = prev.find(i => (i.productId === (product._id || product.id)));
        if (existing) {
          return prev.map(i => i.productId === (product._id || product.id) ? { ...i, quantity: i.quantity + quantity } : i);
        }
        return [...prev, {
          id: `cart_${Date.now()}`,
          productId: product._id || product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity,
          stock: product.stock
        }];
      });
      setIsCartOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    try {
      const res = await api.updateCartItem(itemId, quantity);
      if (res.success && res.data.items) {
        setCartItems(res.data.items);
      }
    } catch (err) {
      setCartItems(prev => prev.map(item => (item.id === itemId || item.productId === itemId) ? { ...item, quantity } : item));
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.removeCartItem(itemId);
      if (res.success && res.data.items) {
        setCartItems(res.data.items);
      }
    } catch (err) {
      setCartItems(prev => prev.filter(item => item.id !== itemId && item.productId !== itemId));
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
    } catch (err) {
      // ignore
    }
    setCartItems([]);
    setCouponCode('');
    setDiscountPercent(0);
  };

  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'DEVOPS20') {
      setDiscountPercent(20);
      setCouponSuccess('20% DevOps Cloud Special Discount Applied!');
      setCouponError('');
      setCouponCode(cleanCode);
      return true;
    } else if (cleanCode === 'AWS50') {
      setDiscountPercent(50);
      setCouponSuccess('50% AWS Cloud Architect Discount Applied!');
      setCouponError('');
      setCouponCode(cleanCode);
      return true;
    } else {
      setCouponError('Invalid coupon code. Try "DEVOPS20"');
      setCouponSuccess('');
      return false;
    }
  };

  // Calculations
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = (subtotal * discountPercent) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const tax = parseFloat((taxableSubtotal * 0.08).toFixed(2));
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
  const total = parseFloat((taxableSubtotal + tax + shipping).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        tax,
        shipping,
        total,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen(prev => !prev),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        couponCode,
        discountPercent,
        couponSuccess,
        couponError,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

