'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductPage() {
    const { slug } = useParams();
    const { items, addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '' });
    const [reviewMessage, setReviewMessage] = useState('');

    useEffect(() => {
        Promise.all([fetch('/data/products.json').then((response) => response.json()), fetch('/data/reviews.json').then((response) => response.json())])
            .then(([productData, reviewData]) => {
                const list = productData.products || [];
                setProducts(list);
                setReviews(reviewData || []);
                const found = list.find((item) => item.slug === slug || item.id === slug);
                setProduct(found || null);
                setActiveImage(found?.images?.[0] || found?.image || '');
            });
    }, [slug]);

    const related = useMemo(() => product ? products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4) : [], [product, products]);
    const productReviews = reviews.filter((item) => item.productId === product?.id);
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const submitReview = (event) => {
        event.preventDefault();
        if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
            setReviewMessage('Please enter your name and review.');
            return;
        }
        setReviewMessage('Thank you! Your demo review has been submitted for moderation.');
        setReviewForm({ name: '', rating: 5, text: '' });
    };

    if (!product) return <><Header cartCount={cartCount} /><main className="container-width section-pad"><div className="py-20 text-center"><h1 className="text-3xl font-extrabold">Product not found</h1><Link href="/shop" className="mt-5 inline-block text-[#c92532] font-bold">Back to shop</Link></div></main><Footer /></>;

    return (
        <>
            <Header cartCount={cartCount} />
            <main className="section-pad">
                <div className="container-width">
                    <div className="text-sm text-slate-400"><Link href="/shop">Shop</Link> / <span>{product.category}</span> / <span className="text-slate-600">{product.name}</span></div>
                    <div className="mt-7 grid gap-10 lg:grid-cols-2">
                        <div>
                            <div className="relative overflow-hidden rounded-2xl bg-[#fff7f3]"><img src={activeImage} alt={product.name} className="h-[480px] w-full object-cover" /></div>
                            <div className="mt-4 grid grid-cols-4 gap-3">{(product.images?.length ? product.images : [product.image]).map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(image)} className={`overflow-hidden rounded-lg border-2 ${activeImage === image ? 'border-[#c92532]' : 'border-transparent'}`}><img src={image} alt={`${product.name} ${index + 1}`} className="h-24 w-full object-cover" /></button>)}</div>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">{product.category}</p>
                            <h1 className="mt-2 text-4xl font-extrabold leading-tight">{product.name}</h1>
                            <div className="mt-4 flex items-center gap-3"><span className="flex items-center gap-1 text-amber-500"><Star size={16} fill="currentColor" /> {product.rating}</span><span className="text-sm text-slate-400">{product.reviews} reviews</span></div>
                            <div className="mt-6 flex items-end gap-3"><span className="text-3xl font-extrabold">₹{product.price.toLocaleString('en-IN')}</span><span className="text-base text-slate-400 line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span></div>
                            <p className="mt-5 text-sm leading-7 text-slate-600">{product.description}</p>
                            <ul className="mt-5 grid gap-2 text-sm text-slate-600">{product.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
                            <div className="mt-7 flex flex-wrap items-center gap-3"><div className="flex items-center rounded-md border"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3"><Minus size={16} /></button><span className="w-10 text-center font-bold">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} className="p-3"><Plus size={16} /></button></div><button type="button" onClick={() => addToCart(product, quantity)} className="flex-1 rounded-md bg-[#c92532] px-6 py-3.5 text-sm font-bold text-white">Add to Cart</button><button type="button" onClick={() => toggleWishlist(product)} className="rounded-md border p-3.5 text-[#c92532]"><Heart size={20} fill={isWishlisted(product) ? 'currentColor' : 'none'} /></button></div>
                            <p className="mt-3 text-xs font-semibold text-slate-500">{product.stock > 0 ? `${product.stock} pieces available` : 'Out of stock'}</p>
                            <div className="mt-8 grid gap-3 border-t pt-6 sm:grid-cols-3"><div className="flex gap-2"><Truck size={18} /><span className="text-xs">Fast dispatch</span></div><div className="flex gap-2"><ShieldCheck size={18} /><span className="text-xs">Secure payment</span></div><div className="flex gap-2"><RotateCcw size={18} /><span className="text-xs">7-day support</span></div></div>
                        </div>
                    </div>

                    <section className="mt-16 border-t pt-12">
                        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Customer Reviews</p><h2 className="mt-2 text-3xl font-extrabold">What buyers say</h2></div><div className="text-right"><p className="text-3xl font-extrabold">{product.rating}</p><p className="text-sm text-amber-500">★★★★★</p></div></div>
                        <div className="mt-8 grid gap-4 md:grid-cols-2">{productReviews.map((review) => <div key={review.id} className="rounded-xl border p-5"><div className="flex justify-between"><div><p className="font-bold">{review.name}</p><p className="text-xs text-slate-400">{review.date}</p></div><span className="text-amber-500">{'★'.repeat(review.rating)}</span></div><h3 className="mt-4 font-bold">{review.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{review.text}</p></div>)}{!productReviews.length && <p className="text-sm text-slate-500">No reviews yet. Be the first to review this product.</p>}</div>
                        <form onSubmit={submitReview} className="mt-8 max-w-2xl rounded-xl bg-slate-50 p-6"><h3 className="font-bold">Write a review</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><input value={reviewForm.name} onChange={(event) => setReviewForm({ ...reviewForm, name: event.target.value })} placeholder="Your name" className="rounded-md border bg-white px-3 py-3" /><select value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })} className="rounded-md border bg-white px-3 py-3"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></div><textarea value={reviewForm.text} onChange={(event) => setReviewForm({ ...reviewForm, text: event.target.value })} placeholder="Share your experience" className="mt-4 min-h-28 w-full rounded-md border bg-white px-3 py-3" /><button className="mt-4 rounded-md bg-[#c92532] px-5 py-3 text-sm font-bold text-white">Submit Review</button>{reviewMessage && <p className="mt-3 text-sm text-[#c92532]">{reviewMessage}</p>}</form>
                    </section>

                    {related.length > 0 && <section className="mt-16 border-t pt-12"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">You May Also Like</p><h2 className="mt-2 text-3xl font-extrabold">Related Gifts</h2><div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
                </div>
            </main>
            <Footer />
        </>
    );
}
