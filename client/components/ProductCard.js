'use client';

import Link from 'next/link';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const image = product.images?.[0] || product.image || '/images/products/gift-hamper.svg';
    const slug = product.slug || product._id || product.id;
    const price = Number(product.price || 0);
    const compareAtPrice = Number(product.compareAtPrice || 0);
    const discount = compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

    return (
        <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#fff8f4]">
                <Link href={`/product/${slug}`} className="flex h-full w-full items-center justify-center">
                    <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </Link>
                {product.badge && <span className="absolute left-3 top-3 rounded-full bg-[#c92532] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{product.badge}</span>}
                {discount > 0 && <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#c92532] shadow">{discount}% OFF</span>}
                <button type="button" onClick={() => toggleWishlist(product)} aria-label={isWishlisted(product) ? 'Remove from wishlist' : 'Add to wishlist'} className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm transition hover:scale-105">
                    <Heart size={16} fill={isWishlisted(product) ? 'currentColor' : 'none'} className="text-[#c92532]" />
                </button>
            </div>
            <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{product.category}</p>
                <Link href={`/product/${slug}`}><h3 className="mt-1 min-h-10 text-sm font-bold leading-5 hover:text-[#c92532]">{product.name}</h3></Link>
                <div className="mt-2 flex items-center gap-1 text-xs">
                    <span className="flex items-center gap-1 text-amber-500"><Star size={13} fill="currentColor" /> {product.rating || 0}</span>
                    <span className="text-slate-400">({product.reviews || 0})</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <p className="text-lg font-extrabold">₹{price.toLocaleString('en-IN')}</p>
                    {compareAtPrice > price && <p className="text-xs text-slate-400 line-through">₹{compareAtPrice.toLocaleString('en-IN')}</p>}
                </div>
                <button type="button" onClick={() => addToCart(product)} disabled={Number(product.stock) === 0} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#c92532] py-2.5 text-sm font-bold text-white transition hover:bg-[#a91d29] disabled:cursor-not-allowed disabled:bg-slate-300">
                    <ShoppingCart size={16} />
                    {Number(product.stock) === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </article>
    );
}
