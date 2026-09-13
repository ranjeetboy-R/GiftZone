'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, Tag, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const FREE_SHIPPING = 999;
const SHIPPING_FEE = 79;

export default function CartPage() {
    const { items, updateQuantity, removeFromCart } = useCart();
    const [coupon, setCoupon] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [discount, setDiscount] = useState(0);
    const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [items]);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
    const total = Math.max(0, subtotal + shipping - discount);
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const applyCoupon = async () => {
        const code = coupon.trim().toUpperCase();
        if (!code) return;
        const coupons = await fetch('/data/coupons.json').then((response) => response.json());
        const found = coupons.find((item) => item.code === code && item.active);
        if (!found) { setDiscount(0); setCouponMessage('Invalid or inactive coupon.'); return; }
        if (subtotal < found.minOrder) { setDiscount(0); setCouponMessage(`Minimum order value is ₹${found.minOrder.toLocaleString('en-IN')}.`); return; }
        const value = found.type === 'percent' ? Math.min(subtotal * found.value / 100, found.maxDiscount || subtotal) : found.value;
        setDiscount(Math.round(value));
        setCouponMessage(`${found.code} applied. You saved ₹${Math.round(value).toLocaleString('en-IN')}.`);
    };

    return (
        <>
            <Header cartCount={cartCount} />
            <main className="section-pad">
                <div className="container-width">
                    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Your Selection</p><h1 className="mt-2 text-4xl font-extrabold">Shopping Cart</h1></div>
                    {!items.length ? <div className="py-24 text-center"><div className="text-7xl">🛒</div><h2 className="mt-5 text-2xl font-bold">Your cart is empty</h2><p className="mt-2 text-slate-500">Discover something special for someone special.</p><Link href="/shop" className="mt-6 inline-flex rounded-md bg-[#c92532] px-6 py-3 text-sm font-bold text-white">Continue Shopping</Link></div> : <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
                        <section className="grid gap-4">
                            {items.map((item) => { const image = item.images?.[0] || item.image || '/images/products/gift-hamper.svg'; return <div key={item.id || item._id} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"><img src={image} alt={item.name} className="h-28 w-28 rounded-lg bg-[#fff7f3] object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><Link href={`/product/${item.slug || item.id}`}><h3 className="font-bold hover:text-[#c92532]">{item.name}</h3></Link><p className="mt-1 text-sm text-slate-500">₹{Number(item.price).toLocaleString('en-IN')} each</p></div><button type="button" onClick={() => removeFromCart(item.id)} aria-label="Remove product" className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button></div><div className="mt-5 flex items-center justify-between"><div className="flex items-center rounded-md border"><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2"><Minus size={15} /></button><span className="w-10 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2"><Plus size={15} /></button></div><strong>₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</strong></div></div></div>; })}
                            <Link href="/shop" className="text-sm font-bold text-[#c92532]">← Continue Shopping</Link>
                        </section>
                        <aside className="h-fit rounded-xl border border-slate-200 p-6 lg:sticky lg:top-28"><h2 className="text-xl font-extrabold">Order Summary</h2><div className="mt-5 flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div><div className="mt-3 flex justify-between text-sm"><span>Shipping</span><span>{shipping ? `₹${shipping}` : 'Free'}</span></div><div className="mt-5 rounded-lg bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-bold"><Tag size={16} /> Coupon Code</div><div className="mt-3 flex gap-2"><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="WELCOME10" className="min-w-0 flex-1 rounded-md border px-3 py-2.5 text-sm" /><button type="button" onClick={applyCoupon} className="rounded-md bg-slate-900 px-4 py-2.5 text-xs font-bold text-white">Apply</button></div>{couponMessage && <p className="mt-2 text-xs font-semibold text-[#c92532]">{couponMessage}</p>}</div>{discount > 0 && <div className="mt-3 flex justify-between text-sm text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}<div className="my-5 border-t" /><div className="flex justify-between text-lg font-extrabold"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div><p className="mt-2 text-xs text-slate-400">Taxes are included in listed prices.</p><Link href="/checkout" className="mt-6 flex items-center justify-center gap-2 rounded-md bg-[#c92532] py-3.5 text-sm font-bold text-white">Proceed to Checkout <ArrowRight size={16} /></Link></aside>
                    </div>}
                </div>
            </main>
            <Footer />
        </>
    );
}
