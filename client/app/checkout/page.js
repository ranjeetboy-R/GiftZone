'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';

const FREE_SHIPPING = 999;
const SHIPPING_FEE = 79;
const MAX_PROOF_SIZE = 5 * 1024 * 1024;

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [payment, setPayment] = useState({});
  const [proof, setProof] = useState(null);
  const [utr, setUtr] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Math.max(Number(item.quantity) || 0, 0);

    return sum + price * quantity;
  }, 0);

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING
    ? 0
    : SHIPPING_FEE;

  const total = subtotal + shipping;

  const cartCount = items.reduce(
    (sum, item) => sum + Math.max(Number(item.quantity) || 0, 0),
    0
  );

  useEffect(() => {
    const loadPaymentDetails = async () => {
      try {
        setPaymentLoading(true);

        const response = await fetch('/data/payment.json');

        if (!response.ok) {
          throw new Error('Failed to load payment details.');
        }

        const data = await response.json();

        setPayment(data || {});
      } catch (error) {
        console.error('Failed to load payment details:', error);
        setPayment({});
      } finally {
        setPaymentLoading(false);
      }
    };

    loadPaymentDetails();
  }, []);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem('gift-zone-address') || 'null'
    );

    setForm(current => ({
      ...current,
      ...(saved || {}),
      name: user?.fullName || user?.firstName || saved?.name || '',
      email: user?.primaryEmailAddress?.emailAddress || saved?.email || ''
    }));
  }, [user]);

  const update = (key, value) => {
    setForm(current => ({
      ...current,
      [key]: value
    }));
  };

  const handleProofChange = event => {
    const file = event.target.files?.[0] || null;

    setMessage('');

    if (!file) {
      setProof(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setProof(null);
      setMessage('Payment proof must be an image.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PROOF_SIZE) {
      setProof(null);
      setMessage('Payment proof must be an image up to 5 MB.');
      event.target.value = '';
      return;
    }

    setProof(file);
  };

  const validateForm = () => {
    if (!isSignedIn) {
      return 'Please login before checkout.';
    }

    if (!items.length) {
      return 'Your cart is empty.';
    }

    if (!form.name.trim()) {
      return 'Please enter your full name.';
    }

    if (!form.email.trim()) {
      return 'Please enter your email address.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Enter a valid email address.';
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      return 'Enter a valid 10-digit Indian mobile number.';
    }

    if (!form.address.trim()) {
      return 'Please enter your full delivery address.';
    }

    if (!form.city.trim()) {
      return 'Please enter your city.';
    }

    if (!form.state.trim()) {
      return 'Please enter your state.';
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      return 'Enter a valid 6-digit pincode.';
    }

    if (utr.trim().length < 6) {
      return 'Enter a valid UTR / transaction ID.';
    }

    if (!proof) {
      return 'Payment screenshot is required.';
    }

    if (!proof.type.startsWith('image/') || proof.size > MAX_PROOF_SIZE) {
      return 'Payment proof must be an image up to 5 MB.';
    }

    return '';
  };

  // Place order 
  const placeOrder = async () => {
    setMessage('');
    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    if (!proof) {
      setMessage('Payment screenshot is required.');
      return;
    }

    try {
      setLoading(true);

      localStorage.setItem(
        'gift-zone-address',
        JSON.stringify(form)
      );

      const orderData = {
        customer: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim()
        },

        shippingAddress: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim()
        },

        items: items.map(item => ({
          productId: item.id || item._id,
          slug: item.slug,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.images?.[0] || item.image || ''
        })),

        utr: utr.trim()
      };


      const formData = new FormData();
      formData.append('order', JSON.stringify(orderData));
      formData.append('paymentProof', proof);
      const token = await getToken();

      console.log('testing............');
      const data = await apiFetch('/api/orders', {
        method: 'POST',
        body: formData,
        token
      });

      if (!data?.order) {
        throw new Error('Order could not be created.');
      }

      clearCart();
      router.push(`/orders/${data.order?._id}`);
    } catch (error) {
      console.error('Failed to place order:', error);

      setMessage(
        error.message ||
        'Unable to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header cartCount={cartCount} />

      <main className="section-pad">
        <div className="container-width">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">
                Secure Checkout
              </p>

              <h1 className="mt-2 text-4xl font-extrabold">
                Complete Your Order
              </h1>
            </div>

            <Link
              href="/cart"
              className="text-sm font-bold text-[#c92532]"
            >
              ← Back to cart
            </Link>
          </div>

          {!isSignedIn && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
              Please login before placing your order.
            </div>
          )}

          {!items.length ? (
            <div className="py-20 text-center">
              <h2 className="text-2xl font-bold">
                Your cart is empty
              </h2>

              <Link
                href="/shop"
                className="mt-5 inline-block font-bold text-[#c92532]"
              >
                Shop products
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
              <section className="rounded-xl border p-6 md:p-8">
                <h2 className="text-xl font-bold">
                  1. Delivery Details
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {[
                    ['name', 'Full Name'],
                    ['email', 'Email Address'],
                    ['phone', 'Mobile Number'],
                    ['city', 'City'],
                    ['state', 'State'],
                    ['pincode', 'Pincode']
                  ].map(([key, label]) => (
                    <input
                      key={key}
                      type={
                        key === 'email'
                          ? 'email'
                          : key === 'phone' || key === 'pincode'
                            ? 'tel'
                            : 'text'
                      }
                      value={form[key]}
                      onChange={event => update(key, event.target.value)}
                      placeholder={label}
                      autoComplete={
                        key === 'name'
                          ? 'name'
                          : key === 'email'
                            ? 'email'
                            : key === 'phone'
                              ? 'tel'
                              : 'off'
                      }
                      className="rounded-md border px-3 py-3 text-sm outline-none focus:border-[#c92532]"
                    />
                  ))}

                  <textarea
                    value={form.address}
                    onChange={event => update('address', event.target.value)}
                    placeholder="Full Delivery Address"
                    autoComplete="street-address"
                    className="min-h-28 rounded-md border px-3 py-3 text-sm outline-none focus:border-[#c92532] md:col-span-2"
                  />
                </div>

                <h2 className="mt-10 text-xl font-bold">
                  2. Manual Payment
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Pay exactly{' '}
                  <strong className="text-slate-800">
                    ₹{total.toLocaleString('en-IN')}
                  </strong>{' '}
                  using the QR/bank details below. Then submit
                  your UTR and payment screenshot.
                </p>

                {paymentLoading ? (
                  <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                    Loading payment details...
                  </div>
                ) : (
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl bg-[#fff7f3] p-5 text-center">
                      {payment.qrImage ? (
                        <img
                          src={payment.qrImage}
                          alt="Gift Zone payment QR"
                          className="mx-auto h-56 w-56 object-contain"
                        />
                      ) : (
                        <div className="flex h-56 items-center justify-center text-sm text-slate-500">
                          Payment QR unavailable
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl bg-slate-50 p-5 text-sm">
                      <h3 className="font-bold">
                        Bank Details
                      </h3>

                      <div className="mt-4 grid gap-2">
                        <span>
                          Account Name: {payment.accountName || '—'}
                        </span>

                        <span>
                          Bank: {payment.bankName || '—'}
                        </span>

                        <span>
                          Account: {payment.accountNumber || '—'}
                        </span>

                        <span>
                          IFSC: {payment.ifsc || '—'}
                        </span>

                        <span>
                          UPI: {payment.upi || '—'}
                        </span>
                      </div>

                      {payment.note && (
                        <p className="mt-4 text-xs text-amber-700">
                          {payment.note}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-7 grid gap-4">
                  <input
                    value={utr}
                    onChange={event => {
                      setUtr(event.target.value);
                      setMessage('');
                    }}
                    placeholder="UTR / Transaction ID"
                    autoComplete="off"
                    className="rounded-md border px-3 py-3 text-sm outline-none focus:border-[#c92532]"
                  />

                  <div>
                    <label className="text-sm font-bold">
                      Payment Screenshot
                    </label>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleProofChange}
                      className="mt-2 w-full rounded-md border p-3 text-sm"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      {proof
                        ? proof.name
                        : 'JPG, PNG or WebP, maximum 5 MB.'}
                    </p>
                  </div>

                  {message && (
                    <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-[#c92532]">
                      {message}
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={loading || paymentLoading || !isSignedIn}
                    onClick={placeOrder}
                    className="rounded-md bg-[#c92532] py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? 'Creating Order...'
                      : 'Place Order'}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    Your order will be confirmed after payment
                    verification.
                  </p>
                </div>
              </section>

              <aside className="h-fit rounded-xl border p-6 lg:sticky lg:top-28">
                <h2 className="text-xl font-bold">
                  Order Summary
                </h2>

                <div className="mt-5 grid gap-3">
                  {items.map(item => {
                    const itemId = item.id || item._id || item.slug;
                    const price = Number(item.price) || 0;
                    const quantity = Number(item.quantity) || 0;

                    return (
                      <div
                        key={itemId}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <span>
                          {item.name} × {quantity}
                        </span>

                        <span>
                          ₹{(price * quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="my-5 border-t" />

                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>

                  <span>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span>Shipping</span>

                  <span>
                    {shipping
                      ? `₹${shipping.toLocaleString('en-IN')}`
                      : 'Free'}
                  </span>
                </div>

                <div className="my-5 border-t" />

                <div className="flex justify-between text-lg font-extrabold">
                  <span>Total</span>

                  <span>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-5 rounded-lg bg-green-50 p-3 text-xs leading-5 text-green-700">
                  Free shipping on orders above ₹
                  {FREE_SHIPPING.toLocaleString('en-IN')}.
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
