'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'gift-zone-cart';
const BUY_NOW_STORAGE_KEY = 'gift-zone-buy-now';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem(CART_STORAGE_KEY) || '[]'
      );

      setItems(Array.isArray(savedCart) ? savedCart : []);
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items, hydrated]);

  // Add product to normal cart
  const addToCart = (
    product,
    quantity = 1,
    selectedSize = null
  ) => {
    const id = product._id || product.id || product.slug;
    const stock = Number(product.stock ?? 999);

    const safeQuantity = Math.min(
      stock,
      Math.max(1, Number(quantity) || 1)
    );

    setItems(current => {
      const existing = current.find(
        item =>
          (item._id || item.id || item.slug) === id &&
          (item.selectedSize || null) === (selectedSize || null)
      );

      if (existing) {
        return current.map(item => {
          if (item !== existing) return item;

          return {
            ...item,
            quantity: Math.min(
              stock,
              item.quantity + safeQuantity
            )
          };
        });
      }

      return [
        ...current,
        {
          ...product,
          id,
          selectedSize: selectedSize || null,
          quantity: safeQuantity
        }
      ];
    });
  };

  // Buy Now - only this product will be purchased
  const buyNow = (product, quantity = 1, selectedSize = null) => {
    const id = product._id || product.id || product.slug;
    const stock = Number(product.stock ?? 999);

    const safeQuantity = Math.min(
      stock,
      Math.max(1, Number(quantity) || 1)
    );

    const buyNowItem = {
      ...product,
      id,
      selectedSize: selectedSize || null,
      quantity: safeQuantity
    };

    sessionStorage.setItem(
      BUY_NOW_STORAGE_KEY,
      JSON.stringify(buyNowItem)
    );

    return buyNowItem;
  };

  // Get Buy Now product
  const getBuyNowItem = () => {
    try {
      const savedBuyNow = sessionStorage.getItem(
        BUY_NOW_STORAGE_KEY
      );

      if (!savedBuyNow) return null;

      return JSON.parse(savedBuyNow);
    } catch {
      return null;
    }
  };

  // Clear Buy Now product
  const clearBuyNow = () => {
    sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
  };

  // Update normal cart quantity
  const updateQuantity = (
    id,
    quantity,
    selectedSize = null
  ) => {
    setItems(current =>
      current
        .map(item => {
          const itemId =
            item._id || item.id || item.slug;

          const itemSize = item.selectedSize || null;

          if (
            itemId !== id ||
            itemSize !== (selectedSize || null)
          ) {
            return item;
          }

          const nextQuantity = Math.max(
            0,
            Number(quantity) || 0
          );

          const stock = Number(
            item.stock ?? 999
          );

          return {
            ...item,
            quantity: Math.min(
              stock,
              nextQuantity
            )
          };
        })
        .filter(item => item.quantity > 0)
    );
  };

  // Remove product from normal cart
  const removeFromCart = (
    id,
    selectedSize = null
  ) => {
    setItems(current =>
      current.filter(item => {
        const itemId =
          item._id || item.id || item.slug;

        const itemSize =
          item.selectedSize || null;

        return !(
          itemId === id &&
          itemSize === (selectedSize || null)
        );
      })
    );
  };

  // Clear complete cart
  const clearCart = () => {
    setItems([]);
  };

  // Total number of products in cart
  const cartCount = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      ),
    [items]
  );

  // Total cart amount
  const cartTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
          Number(item.quantity || 0),
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,

        addToCart,
        buyNow,

        getBuyNowItem,
        clearBuyNow,

        updateQuantity,
        removeFromCart,
        clearCart,

        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () =>  useContext(CartContext);