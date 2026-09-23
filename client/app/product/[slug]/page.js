'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    Heart,
    Minus,
    Plus,
    ShieldCheck,
    Truck,
    RotateCcw,
    Star,
    Zap,
    ShoppingCart
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { apiFetch } from '@/lib/api';
import ProductSkeleton from './ProductSkeleton';
import ProductImageGallery from '@/components/ProductImageGallery';

export default function ProductPage({ params }) {
    const { items, addToCart, buyNow } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { slug: routeSlug } = useParams();

    const [slug, setSlug] = useState('');
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [reviewMessage, setReviewMessage] = useState('');
    const [getProductLoading, setGetProductLoading] = useState(false);
    const [selectedSize, setSelectedSize] = useState('m');

    const router = useRouter();

    const [reviewForm, setReviewForm] = useState({
        name: '',
        rating: 5,
        text: ''
    });

    useEffect(() => {
        if (routeSlug) {
            setSlug(
                Array.isArray(routeSlug)
                    ? routeSlug[0]
                    : routeSlug
            );

            return;
        }

        const getSlug = async () => {
            const { slug } = await params;

            setSlug(
                Array.isArray(slug)
                    ? slug[0]
                    : slug || ''
            );
        };

        getSlug();
    }, [params, routeSlug]);

    useEffect(() => {
        if (!slug) { return; }

        const getProduct = async () => {
            try {
                setGetProductLoading(true);
                const productData = await apiFetch(
                    `/api/products/${encodeURIComponent(slug)}`
                );

                const found = productData.product || null;

                setProduct(found);

                setActiveImage(
                    found?.images?.[0] ||
                    found?.image ||
                    ''
                );

                if (!found) {
                    setProducts([]);
                    setReviews([]);
                    return;
                }

                const relatedData = await apiFetch(
                    `/api/products/related/${encodeURIComponent(found.category)}?exclude=${found._id}&limit=12`
                );

                setProducts(
                    relatedData.products || []
                );

                const reviewResponse = await fetch(
                    '/data/reviews.json'
                );

                const reviewData =
                    await reviewResponse.json();

                setReviews(reviewData || []);
            } catch (error) {
                console.error('Failed to fetch product:', error);
                setProduct(null);
                setProducts([]);
                setReviews([]);
                setActiveImage('');
            }
            finally {
                setGetProductLoading(false);
            }
        };

        getProduct();
    }, [slug]);

    const related = products;

    const productReviews = reviews.filter(
        item =>
            item.productId === product?.id ||
            item.productId === product?._id
    );

    const cartCount = items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const productImages =
        product?.images?.length
            ? product.images
            : product?.image
                ? [product.image]
                : [];

    const submitReview = event => {
        event.preventDefault();

        if (
            !reviewForm.name.trim() ||
            !reviewForm.text.trim()
        ) {
            setReviewMessage(
                'Please enter your name and review.'
            );

            return;
        }

        setReviewMessage(
            'Thank you! Your review has been submitted for moderation.'
        );

        setReviewForm({
            name: '',
            rating: 5,
            text: ''
        });
    };

    const handleAddToCart = () => {
        if (!product || product.stock <= 0) {
            return;
        }

        addToCart(product, quantity);
    };

    const handleBuyNow = () => {
        buyNow(
            product,
            quantity,
            selectedSize
        );
        router.push('/checkout');
    };

    return (
        <>
            <Header cartCount={cartCount} />

            {
                getProductLoading && <ProductSkeleton />
            }

            {product ? (
                <main className="section-pad">
                    <div className="container-width">
                        <div className="text-sm text-slate-400">
                            <Link href="/shop">
                                Shop
                            </Link>

                            {' / '}

                            <span>
                                {product.category}
                            </span>

                            {' / '}

                            <span className="text-slate-600">
                                {product.name}
                            </span>
                        </div>

                        <div className="mt-7 grid gap-10 lg:grid-cols-2">
                            {/* Images */}
                            <div className="h-[80vh]">
                                <ProductImageGallery
                                    images={productImages}
                                    productName={product.name}
                                />
                            </div>

                            {/* Details content */}
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">
                                    {product.category}
                                </p>

                                <h1 className="mt-2 text-2xl font-extrabold leading-tight">
                                    {product.name}
                                </h1>

                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    {product.description}
                                </p>

                                <div className="mt-6 flex items-end gap-3">
                                    <span className="text-2xl font-extrabold">
                                        ₹
                                        {Number(
                                            product.price || 0
                                        ).toLocaleString(
                                            'en-IN'
                                        )}
                                    </span>

                                    {product.compareAtPrice >
                                        product.price && (
                                            <span className="text-base text-slate-400 line-through">
                                                ₹
                                                {Number(
                                                    product.compareAtPrice ||
                                                    0
                                                ).toLocaleString(
                                                    'en-IN'
                                                )}
                                            </span>
                                        )}
                                </div>

                                {/* Sizes  */}
                                {
                                    product.sizes?.length > 0 && (
                                        <div className="mt-5 flex flex-wrap items-center gap-3">
                                            {product.sizes.map((size, index) => (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedSize(size)}
                                                    key={index}
                                                    className={`
                                                            w-fit py-2 px-2 min-w-10 text-sm
                                                            uppercase font-semibold border border-slate-400 rounded-md
                                                            transition-all duration-200
                                                            ${size === selectedSize
                                                            ? 'bg-stone-800 text-white border-stone-800'
                                                            : 'hover:bg-stone-100 hover:border-stone-800'
                                                        }
                                                        `}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    )
                                }

                                <div className="mt-5 flex items-center gap-3">
                                    <span className="flex items-center gap-1 text-amber-500">
                                        <Star
                                            size={16}
                                            fill="currentColor"
                                        />

                                        {product.rating || 0}
                                    </span>

                                    <span className="text-sm text-slate-400">
                                        {product.reviews || 0}{' '}
                                        reviews
                                    </span>
                                </div>

                                {product.features?.length > 0 && (
                                    <ul className="mt-5 grid gap-2 text-sm text-slate-600">
                                        {product.features.map(
                                            feature => (
                                                <li
                                                    key={feature}
                                                >
                                                    ✓ {feature}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}

                                <div className="mt-5 flex md:flex-row flex-col md:items-center gap-5">
                                    <div className="flex items-center gap-5">
                                        <div className="flex items-center rounded-md border">
                                            <button
                                                type="button"
                                                disabled={
                                                    quantity <= 1 ||
                                                    product.stock <=
                                                    0
                                                }
                                                onClick={() =>
                                                    setQuantity(
                                                        value =>
                                                            Math.max(
                                                                1,
                                                                value -
                                                                1
                                                            )
                                                    )
                                                }
                                                className="p-3 disabled:cursor-not-allowed! disabled:opacity-40"
                                            >
                                                <Minus size={16} />
                                            </button>

                                            <span className="w-10 text-center font-bold">
                                                {quantity}
                                            </span>

                                            <button
                                                type="button"
                                                disabled={
                                                    quantity >=
                                                    product.stock ||
                                                    product.stock <=
                                                    0
                                                }
                                                onClick={() =>
                                                    setQuantity(
                                                        value =>
                                                            Math.min(
                                                                product.stock,
                                                                value +
                                                                1
                                                            )
                                                    )
                                                }
                                                className="p-3 disabled:cursor-not-allowed! disabled:opacity-40"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleWishlist(
                                                    product
                                                )
                                            }
                                            className="rounded-md md:hidden border p-2.5 text-[#c92532]"
                                        >
                                            <Heart
                                                size={20}
                                                fill={
                                                    isWishlisted(
                                                        product
                                                    )
                                                        ? 'currentColor'
                                                        : 'none'
                                                }
                                            />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1 flex-1 text-sm font-bold text-white">
                                        <button
                                            type="button"
                                            disabled={
                                                product.stock <= 0
                                            }
                                            onClick={
                                                handleAddToCart
                                            }
                                            className="py-3 flex items-center justify-center rounded-md gap-2 transition-all bg-[#c92532] hover:bg-rose-600 disabled:cursor-not-allowed! disabled:opacity-50"
                                        >
                                            <ShoppingCart
                                                size={14}
                                                fill="currentColor"
                                                strokeWidth={2.2}
                                                className="shrink-0 sm:h-4 sm:w-4"
                                            />
                                            {product.stock > 0
                                                ? 'Add to Cart'
                                                : 'Out of Stock'}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={product.stock == 0}
                                            onClick={handleBuyNow}
                                            className="py-3 flex items-center justify-center rounded-md gap-2 transition-all bg-[#c92532] hover:bg-rose-600 disabled:cursor-not-allowed! disabled:opacity-50"
                                        >
                                            <Zap
                                                size={14}
                                                fill="currentColor"
                                                strokeWidth={2.2}
                                                className="shrink-0 sm:h-4 sm:w-4"
                                            /> Buy Now
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleWishlist(
                                                product
                                            )
                                        }
                                        className="rounded-md hidden md:block border p-3 text-[#c92532]"
                                    >
                                        <Heart
                                            size={20}
                                            fill={
                                                isWishlisted(
                                                    product
                                                )
                                                    ? 'currentColor'
                                                    : 'none'
                                            }
                                        />
                                    </button>
                                </div>

                                <p className="mt-3 text-xs font-semibold text-slate-500">
                                    {product.stock > 0
                                        ? `${product.stock} pieces available`
                                        : 'Out of stock'}
                                </p>

                                <div className="mt-8 grid gap-3 border-t border-slate-300 pt-6 sm:grid-cols-3">
                                    <div className="flex gap-2">
                                        <Truck size={18} />

                                        <span className="text-xs">
                                            Fast dispatch
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <ShieldCheck size={18} />

                                        <span className="text-xs">
                                            Secure payment
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <RotateCcw size={18} />

                                        <span className="text-xs">
                                            7-day support
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <section className="mt-16 border-t border-slate-300 pt-12">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">
                                        Customer Reviews
                                    </p>

                                    <h2 className="mt-2 text-3xl font-extrabold">
                                        What buyers say
                                    </h2>
                                </div>

                                <div className="text-right">
                                    <p className="text-3xl font-extrabold">
                                        {product.rating || 0}
                                    </p>

                                    <p className="text-sm text-amber-500">
                                        ★★★★★
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-4 md:grid-cols-2">
                                {productReviews.map(
                                    review => (
                                        <div
                                            key={
                                                review.id ||
                                                review._id
                                            }
                                            className="rounded-xl border p-5"
                                        >
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="font-bold">
                                                        {
                                                            review.name
                                                        }
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {
                                                            review.date
                                                        }
                                                    </p>
                                                </div>

                                                <span className="text-amber-500">
                                                    {'★'.repeat(
                                                        review.rating
                                                    )}
                                                </span>
                                            </div>

                                            <h3 className="mt-4 font-bold">
                                                {
                                                    review.title
                                                }
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {review.text}
                                            </p>
                                        </div>
                                    )
                                )}

                                {!productReviews.length && (
                                    <p className="text-sm text-slate-500">
                                        No reviews yet. Be
                                        the first to
                                        review this
                                        product.
                                    </p>
                                )}
                            </div>

                            {/* Review form */}
                            <form
                                onSubmit={submitReview}
                                className="mt-8 max-w-2xl rounded-xl bg-slate-50 p-6"
                            >
                                <h3 className="font-bold">
                                    Write a review
                                </h3>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <input
                                        value={
                                            reviewForm.name
                                        }
                                        onChange={event =>
                                            setReviewForm(
                                                current => ({
                                                    ...current,
                                                    name: event
                                                        .target
                                                        .value
                                                })
                                            )
                                        }
                                        placeholder="Your name"
                                        className="rounded-md border border-slate-400 bg-white px-3 py-3"
                                    />

                                    <select
                                        value={
                                            reviewForm.rating
                                        }
                                        onChange={event =>
                                            setReviewForm(
                                                current => ({
                                                    ...current,
                                                    rating: Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                })
                                            )
                                        }
                                        className="rounded-md border border-slate-400 bg-white px-3 py-3"
                                    >
                                        <option value="5">
                                            5 stars
                                        </option>

                                        <option value="4">
                                            4 stars
                                        </option>

                                        <option value="3">
                                            3 stars
                                        </option>

                                        <option value="2">
                                            2 stars
                                        </option>

                                        <option value="1">
                                            1 star
                                        </option>
                                    </select>
                                </div>

                                <textarea
                                    value={
                                        reviewForm.text
                                    }
                                    onChange={event =>
                                        setReviewForm(
                                            current => ({
                                                ...current,
                                                text: event
                                                    .target
                                                    .value
                                            })
                                        )
                                    }
                                    placeholder="Share your experience"
                                    className="mt-4 min-h-28 w-full rounded-md border border-slate-400 bg-white px-3 py-3"
                                />

                                <button
                                    type="submit"
                                    className="mt-4 rounded-md bg-[#c92532] px-5 py-3 text-sm font-bold text-white"
                                >
                                    Submit Review
                                </button>

                                {reviewMessage && (
                                    <p className="mt-3 text-sm text-[#c92532]">
                                        {reviewMessage}
                                    </p>
                                )}
                            </form>
                        </section>

                        {/* Related products */}
                        {related.length > 0 && (
                            <section className="mt-16 border-t pt-12">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">
                                    You May Also Like
                                </p>

                                <h2 className="mt-2 text-3xl font-extrabold">
                                    Related Products
                                </h2>

                                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {related.map(item => (
                                        <ProductCard
                                            key={
                                                item._id ||
                                                item.id ||
                                                item.slug
                                            }
                                            product={item}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            ) : (
                <main className="container-width section-pad">
                    <div className="py-20 text-center">
                        <h1 className="text-3xl font-extrabold">
                            Product not found
                        </h1>

                        <Link
                            href="/shop"
                            className="mt-5 inline-block font-bold text-[#c92532]"
                        >
                            Back to shop
                        </Link>
                    </div>
                </main>
            )}

            <Footer />
        </>
    );
}
