'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const CartContext = createContext(null);
export function CartProvider({
  children
}) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem('gift-zone-cart') || '[]'));
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem('gift-zone-cart', JSON.stringify(items));
  }, [items, hydrated]);
  const addToCart = (product, quantity = 1) => {
    const id = product._id || product.id || product.slug;
    const stock = Number(product.stock ?? 999);
    setItems(current => {
      const existing = current.find(item => (item._id || item.id || item.slug) === id);
      if (existing) {
        return current.map(item => item === existing ? {
          ...item,
          quantity: Math.min(stock, item.quantity + quantity)
        } : item);
      }
      return [...current, {
        ...product,
        id,
        quantity: Math.min(stock, Math.max(1, quantity))
      }];
    });
  };
  const updateQuantity = (id, quantity) => {
    setItems(current => current.map(item => {
      if ((item._id || item.id || item.slug) !== id) return item;
      const next = Math.max(0, quantity);
      const stock = Number(item.stock ?? 999);
      return {
        ...item,
        quantity: Math.min(stock, next)
      };
    }).filter(item => item.quantity > 0));
  };
  const removeFromCart = id => {
    setItems(current => current.filter(item => (item._id || item.id || item.slug) !== id));
  };
  const clearCart = () => setItems([]);
  const cartCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  return <CartContext.Provider value={{
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount
  }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
