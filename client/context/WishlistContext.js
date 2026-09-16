'use client';

import { createContext, useContext, useEffect, useState } from 'react';
const WishlistContext = createContext(null);
export function WishlistProvider({
  children
}) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem('gift-zone-wishlist') || '[]'));
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem('gift-zone-wishlist', JSON.stringify(items));
  }, [items, hydrated]);
  const toggleWishlist = product => {
    const id = product._id || product.id || product.slug;
    setItems(current => current.some(item => (item._id || item.id || item.slug) === id) ? current.filter(item => (item._id || item.id || item.slug) !== id) : [...current, product]);
  };
  const isWishlisted = product => {
    const id = product._id || product.id || product.slug;
    return items.some(item => (item._id || item.id || item.slug) === id);
  };
  const removeFromWishlist = id => setItems(current => current.filter(item => (item._id || item.id || item.slug) !== id));
  return <WishlistContext.Provider value={{
    items,
    toggleWishlist,
    isWishlisted,
    removeFromWishlist
  }}>{children}</WishlistContext.Provider>;
}
export const useWishlist = () => useContext(WishlistContext);
