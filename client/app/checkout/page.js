'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const FREE_SHIPPING = 999;
const SHIPPING_FEE = 79;

export default function CheckoutPage() {
    const { items, clearCart } = useCart();
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [payment, setPayment] = useState({});
    const [proof, setProof] = useState(null);
    const [utr, setUtr] = useState('');
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        fetch('/data/payment.json').then((response) => response.json()).then(setPayment);
        const saved = JSON.parse(localStorage.getItem('gift-zone-address') || 'null');
        setForm((current) => ({ ...current, ...(saved || {}), name: user?.fullName || user?.firstName || saved?.name || '', email: user?.primaryEmailAddress?.emailAddress || saved?.email || '' }));
    }, [user]);

    const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const placeDemoOrder = async () => {
        setMessage('');
        if (!isSignedIn) { setMessage('Please login before checkout.'); return; }
        if (!items.length) { setMessage('Your cart is empty.'); return; }
        if (!Object.values(form).every((value) => String(value).trim())) { setMessage('Please complete all delivery details.'); return; }
        if (!/^[6-9]\d{9}$/.test(form.phone)) { setMessage('Enter a valid 10-digit Indian mobile number.'); return; }
        if (!/^\d{6}$/.test(form.pincode)) { setMessage('Enter a valid 6-digit pincode.'); return; }
        if (utr.trim().length < 6) { setMessage('Enter a valid UTR / transaction ID.'); return; }
        if (!proof) { setMessage('Payment screenshot is required.'); return; }
        if (!proof.type.startsWith('image/') || proof.size > 5 * 1024 * 1024) { setMessage('Payment proof must be an image up to 5 MB.'); return; }
        setLoading(true);
        localStorage.setItem('gift-zone-address', JSON.stringify(form));
        const demoOrder = { id: `GZ-${Date.now().toString().slice(-8)}`, createdAt: new Date().toISOString(), customer: form, items, subtotal, shipping, total, utr: utr.trim(), paymentStatus: 'submitted', orderStatus: 'confirmed', proofName: proof.name };
        const orders = JSON.parse(localStorage.getItem('gift-zone-demo-orders') || '[]');
        localStorage.setItem('gift-zone-demo-orders', JSON.stringify([demoOrder, ...orders]));
        clearCart();
        router.push(`/orders/${demoOrder.id}`);
    };

    return (
        <>
            <Header cartCount={cartCount} />
            <main className="section-pad">
                <div className="container-width"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Secure Checkout</p><h1 className="mt-2 text-4xl font-extrabold">Complete Your Order</h1></div><Link href="/cart" className="text-sm font-bold text-[#c92532]">← Back to cart</Link></div>
                    {!items.length ? <div className="py-20 text-center"><h2 className="text-2xl font-bold">Your cart is empty</h2><Link href="/shop" className="mt-5 inline-block text-[#c92532] font-bold">Shop gifts</Link></div> : <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
                        <section className="rounded-xl border p-6 md:p-8">
                            <h2 className="text-xl font-bold">1. Delivery Details</h2>
                            <div className="mt-5 grid gap-4 md:grid-cols-2">{[['name','Full Name'],['email','Email Address'],['phone','Mobile Number'],['city','City'],['state','State'],['pincode','Pincode']].map(([key,label]) => <input key={key} value={form[key]} onChange={(event) => update(key,event.target.value)} placeholder={label} className="rounded-md border px-3 py-3 text-sm outline-none focus:border-[#c92532]" />)}<textarea value={form.address} onChange={(event) => update('address',event.target.value)} placeholder="Full Delivery Address" className="min-h-28 rounded-md border px-3 py-3 text-sm outline-none focus:border-[#c92532] md:col-span-2" /></div>
                            <h2 className="mt-10 text-xl font-bold">2. Manual Payment</h2><p className="mt-2 text-sm leading-6 text-slate-500">Pay exactly <strong className="text-slate-800">₹{total.toLocaleString('en-IN')}</strong> using the demo QR/bank details below. Then submit your UTR and payment screenshot.</p>
                            <div className="mt-6 grid gap-6 md:grid-cols-2"><div className="rounded-xl bg-[#fff7f3] p-5 text-center"><img src={payment.qrImage} alt="Gift Zone payment QR" className="mx-auto h-56 w-56 object-contain" /></div><div className="rounded-xl bg-slate-50 p-5 text-sm"><h3 className="font-bold">Bank Details</h3><div className="mt-4 grid gap-2"><span>Account Name: {payment.accountName}</span><span>Bank: {payment.bankName}</span><span>Account: {payment.accountNumber}</span><span>IFSC: {payment.ifsc}</span><span>UPI: {payment.upi}</span></div><p className="mt-4 text-xs text-amber-700">{payment.note}</p></div></div>
                            <div className="mt-7 grid gap-4"><input value={utr} onChange={(event) => setUtr(event.target.value)} placeholder="UTR / Transaction ID" className="rounded-md border px-3 py-3 text-sm" /><div><label className="text-sm font-bold">Payment Screenshot</label><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProof(event.target.files?.[0] || null)} className="mt-2 w-full rounded-md border p-3 text-sm" /><p className="mt-2 text-xs text-slate-400">{proof ? proof.name : 'JPG, PNG or WebP, maximum 5 MB.'}</p></div>{message && <p className="text-sm font-semibold text-[#c92532]">{message}</p>}<button type="button" disabled={loading} onClick={placeDemoOrder} className="rounded-md bg-[#c92532] py-3.5 text-sm font-bold text-white disabled:opacity-50">{loading ? 'Creating Order...' : 'Place Order'}</button></div>
                        </section>
                        <aside className="h-fit rounded-xl border p-6 lg:sticky lg:top-28"><h2 className="text-xl font-bold">Order Summary</h2><div className="mt-5 grid gap-3">{items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.name} × {item.quantity}</span><span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span></div>)}</div><div className="my-5 border-t"/><div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div><div className="mt-2 flex justify-between text-sm"><span>Shipping</span><span>{shipping ? `₹${shipping}` : 'Free'}</span></div><div className="my-5 border-t"/><div className="flex justify-between text-lg font-extrabold"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div></aside>
                    </div>}
                </div>
            </main><Footer />
        </>
    );
}
