'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Heart,
    Star,
    ShoppingCart,
    ArrowUpRight,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductCard({ product }) {
    const router = useRouter();

    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();

    const image =
        product.images?.[0] ||
        product.image;

    const slug = product.slug || product._id || product.id;

    const price = Number(product.price || 0);
    const compareAtPrice = Number(product.compareAtPrice || 0);

    const discount =
        compareAtPrice > price
            ? Math.round(
                ((compareAtPrice - price) / compareAtPrice) * 100
            )
            : 0;

    const isOutOfStock = Number(product.stock) === 0;
    const wishlisted = isWishlisted(product);

    const handleBuyNow = () => {
        if (isOutOfStock) return;
        router.push(`/product/${slug}`);
    };

    return (
        <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
            {/* Product Image */}
            <div className="relative overflow-hidden bg-[#fff8f4]">
                <Link
                    href={`/product/${slug}`}
                    className="relative block aspect-square w-full sm:aspect-4/3 lg:aspect-[1.08/1]"
                >
                    {
                        image && <Image
                            src={image}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            alt={product.name || 'Product'}
                            className="object-cover transition duration-700 ease-out group-hover:scale-105"
                        />
                    }

                    <div className="absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                </Link>

                {/* Badge */}
                {product.badge && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-[#c92532] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[10px]">
                        {product.badge}
                    </span>
                )}

                {/* Discount */}
                {discount > 0 && (
                    <span className="absolute bottom-2.5 left-2.5 rounded-full border border-white/70 bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-[#c92532] shadow-sm backdrop-blur-sm sm:bottom-3 sm:left-3 sm:text-[11px]">
                        {discount}% OFF
                    </span>
                )}

                {/* Wishlist */}
                <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    aria-label={
                        wishlisted
                            ? 'Remove from wishlist'
                            : 'Add to wishlist'
                    }
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white/95 text-[#c92532] shadow-sm backdrop-blur-sm transition duration-300 hover:scale-105 hover:bg-[#c92532] hover:text-white sm:right-3 sm:top-3 sm:h-9 sm:w-9"
                >
                    <Heart
                        size={15}
                        strokeWidth={2}
                        fill={wishlisted ? 'currentColor' : 'none'}
                    />
                </button>

                {/* Product Link */}
                <Link
                    href={`/product/${slug}`}
                    aria-label={`View ${product.name || 'product'}`}
                    className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 opacity-100 shadow-md transition-all duration-300 hover:bg-[#c92532] hover:text-white sm:bottom-3 sm:right-3 sm:h-9 sm:w-9 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
                >
                    <ArrowUpRight size={16} />
                </Link>
            </div>

            {/* Product Content */}
            <div className="flex flex-1 flex-col p-3.5 sm:p-4 md:p-5">
                {/* Category */}
                <p className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[10px] sm:tracking-[0.16em]">
                    {product.category}
                </p>

                {/* Product Name */}
                <Link href={`/product/${slug}`}>
                    <h3 className="mt-1.5 min-h-10 line-clamp-2 text-sm font-extrabold leading-5 tracking-tight text-slate-900 transition-colors duration-200 hover:text-[#c92532] sm:text-sm">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex min-w-0 items-center gap-1.5 mt-2">
                    <span className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-1 text-[10px] font-bold text-amber-600 sm:text-xs">
                        <Star
                            size={11}
                            fill="currentColor"
                            className="sm:h-3 sm:w-3"
                        />
                        {product.rating || 0}
                    </span>

                    <span className="truncate text-[10px] text-slate-400 sm:text-xs">
                        ({product.reviews || 0} reviews)
                    </span>
                </div>

                {/* Price */}
                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                    <p className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                        ₹{price.toLocaleString('en-IN')}
                    </p>

                    {compareAtPrice > price && (
                        <p className="text-[10px] font-medium text-slate-400 line-through sm:text-xs">
                            ₹{compareAtPrice.toLocaleString('en-IN')}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-auto grid md:grid-cols-2 grid-cols-3 gap-1.5 pt-3 sm:gap-2 sm:pt-4">
                    <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                        className="flex min-h-10 outline-none items-center justify-center col-span-1 gap-1 rounded-lg border border-[#c92532] bg-white px-2 py-2.5 text-[10px] font-bold text-[#c92532] transition-all duration-300 hover:bg-[#fff0ed] active:scale-[0.98] disabled:cursor-not-allowed! disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:gap-1.5 sm:rounded-xl sm:text-xs"
                    >
                        <ShoppingCart
                            size={14}
                            strokeWidth={2.2}
                            className="shrink-0 sm:h-4 sm:w-4"
                        />

                        <span className="truncate hidden md:block">
                            Add to Cart
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={isOutOfStock}
                        className="flex min-h-10 outline-none items-center justify-center gap-1 col-span-2 md:col-span-1 rounded-lg bg-[#c92532] px-2 py-2.5 text-[10px] font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#a91d29] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed! disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:gap-1.5 sm:rounded-xl sm:text-xs"
                    >
                        <Zap
                            size={14}
                            fill="currentColor"
                            strokeWidth={2.2}
                            className="shrink-0 sm:h-4 sm:w-4"
                        />

                        <span className="truncate">
                            {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                        </span>
                    </button>
                </div>
            </div>
        </article>
    );
}
