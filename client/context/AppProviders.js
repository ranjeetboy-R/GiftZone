'use client';

import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

export default function AppProviders({ children }) {
    return (
        <CartProvider>
            <WishlistProvider>
                {children}
            </WishlistProvider>
        </CartProvider>
    );
}
