'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Clipboard,
    CreditCard,
    FileImage,
    IndianRupee,
    LockKeyhole,
    MapPin,
    PackageCheck,
    QrCode,
    ShieldCheck,
    ShoppingBag,
    Trash2,
    Upload,
    UserRound,
    WalletCards,
    X
} from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';
import { payment } from '@/public/data/site.json';
import toast from 'react-hot-toast';

const FREE_SHIPPING = 999;
const SHIPPING_FEE = 79;
const MAX_PROOF_SIZE = 5 * 1024 * 1024;

export default function CheckoutPage() {
    const { items, clearCart, removeFromCart, getBuyNowItem, clearBuyNow, cartCount: checkCartCount } = useCart();
    const { isSignedIn, getToken } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [proof, setProof] = useState(null);
    const [utr, setUtr] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [buyNowItem, setBuyNowItem] = useState(null);
    const [buyNowChecked, setBuyNowChecked] = useState(false);

    const searchParams = useSearchParams();
    const cart = searchParams.get('cart');

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    useEffect(()=> {
        if (cart) {
            clearBuyNow();
        }
    }, [cart])

    useEffect(() => {
        try {
            const item = getBuyNowItem?.();

            if (item) {
                setBuyNowItem(item);
            }
        } catch (error) {
            console.error('Buy Now item error:', error);
        } finally {
            setBuyNowChecked(true);
        }
    }, []);

    const checkoutItem = buyNowItem ? [buyNowItem] : items;

    const subtotal = checkoutItem.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Math.max(Number(item.quantity) || 0, 0);

        return sum + price * quantity;
    }, 0);

    // const shipping =
    //     subtotal === 0 || subtotal >= FREE_SHIPPING
    //         ? 0
    //         : SHIPPING_FEE;

    const total = subtotal;

    const cartCount = checkoutItem.reduce(
        (sum, item) =>
            sum + Math.max(Number(item.quantity) || 0, 0),
        0
    );

    useEffect(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem('gift-zone-address') || 'null'
            );

            setForm(current => ({
                ...current,
                ...(saved || {}),
                name:
                    user?.fullName ||
                    user?.firstName ||
                    saved?.name ||
                    '',
                email:
                    user?.primaryEmailAddress?.emailAddress ||
                    saved?.email ||
                    ''
            }));
        } catch (error) {
            console.error('Failed to load saved address:', error);

            setForm(current => ({
                ...current,
                name:
                    user?.fullName ||
                    user?.firstName ||
                    '',
                email:
                    user?.primaryEmailAddress?.emailAddress ||
                    ''
            }));
        }
    }, [user]);

    useEffect(() => {
        setPaymentLoading(true);

        const timer = setTimeout(() => {
            setPaymentLoading(false);
        }, 250);

        return () => clearTimeout(timer);
    }, []);

    const update = (key, value) => {
        setForm(current => ({
            ...current,
            [key]: value
        }));

        setMessage('');
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
            setMessage(
                'Payment proof must be an image up to 5 MB.'
            );
            event.target.value = '';
            return;
        }

        setProof(file);
    };

    const removeProof = event => {
        event.preventDefault();
        event.stopPropagation();

        setProof(null);
        setMessage('');

        const input = document.getElementById(
            'payment-proof'
        );

        if (input) {
            input.value = '';
        }
    };

    const copyPaymentValue = async value => {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
            setMessage('Payment detail copied successfully.');

            setTimeout(() => {
                setMessage('');
            }, 1800);
        } catch (error) {
            console.error('Failed to copy payment detail:', error);
        }
    };

    const validateForm = () => {
        if (!isSignedIn) {
            return 'Please login before checkout.';
        }

        if (!checkoutItem.length) {
            return 'Your cart is empty.';
        }

        if (!form.name.trim()) {
            return 'Please enter your full name.';
        }

        if (!form.email.trim()) {
            return 'Please enter your email address.';
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                form.email.trim()
            )
        ) {
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

        if (
            !proof.type.startsWith('image/') ||
            proof.size > MAX_PROOF_SIZE
        ) {
            return 'Payment proof must be an image up to 5 MB.';
        }

        return '';
    };

    const placeOrder = async () => {
        setMessage('');
        if (subtotal < 299) {
            toast.error("Minimum Order Value: ₹299 Sorry, orders below ₹299 cannot be placed. Please add items worth ₹299 or more to continue with your order.")
            return;
        }

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

                items: checkoutItem.map(item => ({
                    productId: item.id || item._id,
                    slug: item.slug,
                    name: item.name,
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 1,
                    image:
                        item.images?.[0] ||
                        item.image ||
                        ''
                })),

                utr: utr.trim()
            };

            const formData = new FormData();

            formData.append(
                'order',
                JSON.stringify(orderData)
            );

            formData.append(
                'paymentProof',
                proof
            );

            const token = await getToken();

            const data = await apiFetch('/api/orders', {
                method: 'POST',
                body: formData,
                token
            });

            if (!data?.order) {
                throw new Error(
                    'Order could not be created.'
                );
            }

            clearCart();

            router.push(
                `/orders/${data.order?._id}`
            );
        } catch (error) {
            console.error(
                'Failed to place order:',
                error
            );

            setMessage(
                error.message ||
                'Unable to place order. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c92532] focus:ring-4 focus:ring-[#c92532]/10';

    const detailRows = [
        {
            label: 'Account Name',
            value: payment.accountName
        },
        {
            label: 'Bank',
            value: payment.bankName
        },
        {
            label: 'UPI ID',
            value: payment.upi,
            copy: true
        }
    ];

    return (
        <>
            <Header cartCount={checkCartCount} />

            <main className="min-h-screen bg-[#fafafa]">
                <div className="border-b border-slate-200 bg-white">
                    <div className="container-width">
                        <div className="flex items-center justify-between gap-4 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c92532]/10 text-[#c92532]">
                                    <LockKeyhole size={18} />
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c92532]">
                                        Secure Checkout
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Safe & simple order placement
                                    </p>
                                </div>
                            </div>

                            <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex">
                                <ShieldCheck
                                    size={16}
                                    className="text-emerald-600"
                                />
                                Secure payment verification
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-width py-8 md:py-12">
                    <div className="flex flex-wrap items-end justify-between gap-5">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c92532]">
                                Checkout
                            </p>

                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                                Complete Your Order
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Add your delivery details and verify your payment to place your order.
                            </p>
                        </div>

                        <Link
                            href="/shop"
                            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#c92532]/30 hover:text-[#c92532]"
                        >
                            <ArrowLeft
                                size={16}
                                className="transition-transform group-hover:-translate-x-1"
                            />
                            Back to shop
                        </Link>
                    </div>

                    {!isSignedIn && (
                        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <ShieldCheck
                                size={19}
                                className="mt-0.5 shrink-0"
                            />

                            <div>
                                <p className="font-bold">
                                    Login required
                                </p>

                                <p className="mt-1 text-xs leading-5 text-amber-700">
                                    Please login before placing your order.
                                </p>
                            </div>
                        </div>
                    )}

                    {!buyNowChecked ? (
                        <div className="mx-auto max-w-lg py-24 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#c92532]/10 text-[#c92532]">
                                <ShoppingBag size={32} />
                            </div>

                            <h2 className="mt-6 text-2xl font-extrabold text-slate-950">
                                Your cart is empty
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Add some products to your cart before continuing to checkout.
                            </p>

                            <Link
                                href="/shop"
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#c92532] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#c92532]/20 transition hover:-translate-y-0.5 hover:bg-[#ae1f2b]"
                            >
                                Shop Products
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
                            <section className="space-y-7">
                                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-100 px-6 py-5 md:px-8">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c92532] text-white shadow-lg shadow-[#c92532]/20">
                                                <MapPin size={20} />
                                            </div>

                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c92532]">
                                                    Step 01
                                                </p>

                                                <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                                                    Delivery Details
                                                </h2>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {[
                                                ['name', 'Full Name', 'name'],
                                                ['email', 'Email Address', 'email'],
                                                ['phone', 'Mobile Number', 'tel'],
                                                ['city', 'City', 'text'],
                                                ['state', 'State', 'text'],
                                                ['pincode', 'Pincode', 'tel']
                                            ].map(([key, label, type]) => (
                                                <div
                                                    key={key}
                                                    className="relative"
                                                >
                                                    <label
                                                        htmlFor={key}
                                                        className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
                                                    >
                                                        {label}
                                                    </label>

                                                    <input
                                                        id={key}
                                                        type={type}
                                                        value={form[key]}
                                                        onChange={event =>
                                                            update(
                                                                key,
                                                                event.target.value
                                                            )
                                                        }
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
                                                        className={inputClass}
                                                    />
                                                </div>
                                            ))}

                                            <div className="md:col-span-2">
                                                <label
                                                    htmlFor="address"
                                                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
                                                >
                                                    Full Delivery Address
                                                </label>

                                                <textarea
                                                    id="address"
                                                    value={form.address}
                                                    onChange={event =>
                                                        update(
                                                            'address',
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="House no., street, landmark..."
                                                    autoComplete="street-address"
                                                    className="min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c92532] focus:ring-4 focus:ring-[#c92532]/10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-100 px-6 py-5 md:px-8">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c92532] text-white shadow-lg shadow-[#c92532]/20">
                                                    <CreditCard size={20} />
                                                </div>

                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c92532]">
                                                        Step 02
                                                    </p>

                                                    <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                                                        Manual Payment
                                                    </h2>
                                                </div>
                                            </div>

                                            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:flex">
                                                <ShieldCheck size={14} />
                                                Secure Verification
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8">
                                        <div className="rounded-2xl border border-[#c92532]/10 bg-[#fff7f3] p-4 md:p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c92532] text-white">
                                                    <WalletCards size={17} />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        Complete your payment
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                                        Pay exactly{' '}
                                                        <strong className="text-[#c92532]">
                                                            ₹{total.toLocaleString('en-IN')}
                                                        </strong>{' '}
                                                        using the QR code or bank details below. Then submit your UTR and payment screenshot.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col border border-slate-200 md:hidden rounded-2xl p-5 bg-slate-50 mt-5">
                                            <p className='font-medium'>Pay Securely via UPI</p>
                                            <button
                                                type="button"
                                                className="group relative w-full mt-5 overflow-hidden rounded-2xl
                                                        bg-linear-to-r from-amber-400 via-yellow-300 to-amber-400
                                                        px-6 py-3.5
                                                        font-bold text-gray-900
                                                        shadow-[0_8px_30px_rgba(245,158,11,0.25)]
                                                        transition-all duration-300
                                                        hover:-translate-y-0.5
                                                        hover:shadow-[0_12px_35px_rgba(245,158,11,0.45)]
                                                        active:scale-[0.97] "
                                                onClick={() => {
                                                    window.location.href =
                                                        `upi://pay?pa=pandeyvisu995-3@okaxis&pn=SellZone&am=${subtotal}&cu=INR`;
                                                }}
                                            >
                                                {/* Shine effect */}
                                                <span
                                                    className=" absolute inset-0 -translate-x-full
                                                            bg-linear-to-r from-transparent via-white/50 to-transparent
                                                            transition-transform duration-700
                                                            group-hover:translate-x-full  "
                                                />

                                                {/* Button content */}
                                                <span className="relative flex items-center justify-center gap-2">
                                                    <IndianRupee size={15} />
                                                    {subtotal}
                                                    <span>Pay Now</span>

                                                    <svg
                                                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M5 12h14" />
                                                        <path d="m13 6 6 6-6 6" />
                                                    </svg>
                                                </span>
                                            </button>

                                            <p className='text-xs mt-5 text-slate-400 text-center'>Having trouble with payment? Please try another UPI app like Google Pay, PhonePe, or Paytm.</p>
                                        </div>

                                        <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                                            Scan & Pay
                                                        </p>

                                                        <h3 className="mt-1 font-extrabold text-slate-900">
                                                            Payment QR
                                                        </h3>
                                                    </div>

                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#c92532] shadow-sm">
                                                        <QrCode size={18} />
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex min-h-65 items-center justify-center rounded-2xl border border-slate-200 bg-white p-5">
                                                    {paymentLoading ? (
                                                        <div className="h-52 w-52 animate-pulse rounded-xl bg-slate-100" />
                                                    ) : payment.qrImage ? (
                                                        <img
                                                            src={payment.qrImage}
                                                            alt="Gift Zone payment QR"
                                                            className="h-52 w-52 rounded-xl object-contain"
                                                        />
                                                    ) : (
                                                        <div className="text-center">
                                                            <QrCode
                                                                size={42}
                                                                className="mx-auto text-slate-300"
                                                            />

                                                            <p className="mt-3 text-sm font-semibold text-slate-500">
                                                                Payment QR unavailable
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                                                    Scan the QR code with your preferred UPI app.
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                                            Direct Transfer
                                                        </p>

                                                        <h3 className="mt-1 font-extrabold text-slate-900">
                                                            Bank Details
                                                        </h3>
                                                    </div>

                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c92532]/10 text-[#c92532]">
                                                        <CreditCard size={18} />
                                                    </div>
                                                </div>

                                                <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
                                                    {detailRows.map(row => (
                                                        <div
                                                            key={row.label}
                                                            className="flex items-center justify-between gap-4 bg-slate-50/70 px-4 py-3.5"
                                                        >
                                                            <span className="text-xs font-semibold text-slate-500">
                                                                {row.label}
                                                            </span>

                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <span className="truncate text-right text-sm font-bold text-slate-900">
                                                                    {row.value || '—'}
                                                                </span>

                                                                {row.copy && row.value && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            copyPaymentValue(
                                                                                row.value
                                                                            )
                                                                        }
                                                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 transition hover:bg-[#c92532] hover:text-white"
                                                                        aria-label={`Copy ${row.label}`}
                                                                    >
                                                                        <Clipboard size={13} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {payment.note && (
                                                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
                                                        <ShieldCheck
                                                            size={15}
                                                            className="mt-0.5 shrink-0"
                                                        />

                                                        <span>
                                                            {payment.note}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-7 grid gap-5">
                                            <div>
                                                <label
                                                    htmlFor="utr"
                                                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
                                                >
                                                    UTR / Transaction ID
                                                </label>

                                                <div className="relative">
                                                    <WalletCards
                                                        size={17}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                                    />

                                                    <input
                                                        id="utr"
                                                        value={utr}
                                                        onChange={event => {
                                                            setUtr(
                                                                event.target.value
                                                            );
                                                            setMessage('');
                                                        }}
                                                        placeholder="Enter your transaction ID"
                                                        autoComplete="off"
                                                        className={`${inputClass} pl-11`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="payment-proof"
                                                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
                                                >
                                                    Payment Screenshot
                                                </label>

                                                <label
                                                    htmlFor="payment-proof"
                                                    className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-5 transition ${proof
                                                        ? 'border-emerald-300 bg-emerald-50/50'
                                                        : 'border-slate-200 bg-slate-50 hover:border-[#c92532]/40 hover:bg-[#fff7f3]'
                                                        }`}
                                                >
                                                    <input
                                                        id="payment-proof"
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        onChange={handleProofChange}
                                                        className="sr-only"
                                                    />

                                                    <div
                                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${proof
                                                            ? 'bg-emerald-100 text-emerald-600'
                                                            : 'bg-white text-[#c92532] shadow-sm'
                                                            }`}
                                                    >
                                                        {proof ? (
                                                            <FileImage size={21} />
                                                        ) : (
                                                            <Upload size={21} />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-bold text-slate-900">
                                                            {proof
                                                                ? proof.name
                                                                : 'Upload payment screenshot'}
                                                        </p>

                                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                                            {proof
                                                                ? `${(
                                                                    proof.size /
                                                                    1024 /
                                                                    1024
                                                                ).toFixed(2)} MB • Image ready for upload`
                                                                : 'JPG, PNG or WebP • Maximum 5 MB'}
                                                        </p>
                                                    </div>

                                                    {proof ? (
                                                        <button
                                                            type="button"
                                                            onClick={removeProof}
                                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-500"
                                                            aria-label="Remove payment screenshot"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    ) : (
                                                        <span className="hidden rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm sm:block">
                                                            Browse
                                                        </span>
                                                    )}
                                                </label>
                                            </div>

                                            {message && (
                                                <div
                                                    className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold ${message.includes(
                                                        'copied successfully'
                                                    )
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-red-50 text-[#c92532]'
                                                        }`}
                                                >
                                                    {message.includes(
                                                        'copied successfully'
                                                    ) ? (
                                                        <CheckCircle2
                                                            size={18}
                                                            className="mt-0.5 shrink-0"
                                                        />
                                                    ) : (
                                                        <X
                                                            size={18}
                                                            className="mt-0.5 shrink-0"
                                                        />
                                                    )}

                                                    <p>{message}</p>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                disabled={
                                                    loading ||
                                                    !isSignedIn
                                                }
                                                onClick={placeOrder}
                                                className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#c92532] px-6 text-sm font-extrabold text-white shadow-xl shadow-[#c92532]/20 transition hover:-translate-y-0.5 hover:bg-[#ae1f2b] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                        Creating Order...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={19} />
                                                        Place Order
                                                        <ArrowRight
                                                            size={18}
                                                            className="transition-transform group-hover:translate-x-1"
                                                        />
                                                    </>
                                                )}
                                            </button>

                                            <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                                                <LockKeyhole size={13} />
                                                Your order will be confirmed after payment verification.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <aside className="h-fit lg:sticky lg:top-24">
                                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                    <div className="bg-slate-950 px-6 py-5 text-white">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                                                    Your Cart
                                                </p>

                                                <h2 className="mt-1 text-lg font-extrabold">
                                                    Order Summary
                                                </h2>
                                            </div>

                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                                <ShoppingBag size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="max-h-85 space-y-4 overflow-y-auto pr-1">
                                            {checkoutItem.map(item => {
                                                const itemId = item.id || item._id || item.slug;
                                                const price = Number(item.price) || 0;
                                                const quantity = Number(item.quantity) || 0;
                                                const image = item.images?.[0] || item.image || '';

                                                return (
                                                    <div
                                                        key={itemId}
                                                        className="flex gap-3"
                                                    >
                                                        <div className="h-16 aspect-square shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                                            {image ? (
                                                                <img
                                                                    src={image}
                                                                    alt={item.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-slate-300">
                                                                    <PackageCheck
                                                                        size={20}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">
                                                                {item.name}
                                                            </p>

                                                            <p className="mt-1 text-xs font-medium text-slate-400">
                                                                Qty: {quantity}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col">
                                                            <p className="shrink-0 text-sm font-extrabold text-slate-900">
                                                                ₹
                                                                {(
                                                                    price *
                                                                    quantity
                                                                ).toLocaleString(
                                                                    'en-IN'
                                                                )}
                                                            </p>

                                                            {
                                                                cartCount > 1 &&
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFromCart(itemId)}
                                                                    aria-label={`Remove ${item.name || 'product'} from cart`}
                                                                    className="text-slate-400 hover:text-red-600 p-2"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            }
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="my-6 border-t border-slate-100" />

                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center justify-between gap-4 text-slate-500">
                                                <span>Subtotal</span>

                                                <span className="font-semibold text-slate-900">
                                                    ₹
                                                    {subtotal.toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 text-slate-500">
                                                <span>Shipping</span>

                                                <span>Free</span>
                                            </div>
                                        </div>

                                        <div className="my-5 border-t border-slate-100" />

                                        <div className="flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                                                    Total
                                                </p>

                                                <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                                                    ₹
                                                    {total.toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-[#c92532]/10 px-3 py-2 text-xs font-bold text-[#c92532]">
                                                {cartCount}{' '}
                                                {cartCount === 1
                                                    ? 'Item'
                                                    : 'Items'}
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                                <Check size={16} />
                                            </div>

                                            <div>
                                                <p className="text-xs font-extrabold text-emerald-800">
                                                    Free shipping
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-emerald-700">
                                                    Orders above ₹299 qualify for free delivery.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                                            <ShieldCheck size={14} />
                                            Secure order verification
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c92532]/10 text-[#c92532]">
                                            <UserRound size={16} />
                                        </div>

                                        <p className="mt-3 text-xs font-bold text-slate-900">
                                            Verified Account
                                        </p>

                                        <p className="mt-1 text-[11px] leading-4 text-slate-400">
                                            Secure checkout
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                            <PackageCheck size={16} />
                                        </div>

                                        <p className="mt-3 text-xs font-bold text-slate-900">
                                            Order Tracking
                                        </p>

                                        <p className="mt-1 text-[11px] leading-4 text-slate-400">
                                            Track after confirmation
                                        </p>
                                    </div>
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