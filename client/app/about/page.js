import Link from 'next/link';
import {
    ArrowRight,
    BadgeCheck,
    Headphones,
    PackageCheck,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Truck
} from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

const features = [
    {
        icon: ShoppingBag,
        title: 'Wide Product Selection',
        description:
            'Explore products across electronics, fashion, home, kitchen, beauty, office and more.'
    },
    {
        icon: ShieldCheck,
        title: 'Secure Shopping',
        description:
            'We focus on secure account access, protected transactions and a reliable shopping experience.'
    },
    {
        icon: PackageCheck,
        title: 'Quality Products',
        description:
            'Our goal is to offer useful, reliable and value-focused products for everyday needs.'
    },
    {
        icon: Truck,
        title: 'Reliable Delivery',
        description:
            'We work to make order processing and delivery simple, clear and convenient.'
    },
    {
        icon: Headphones,
        title: 'Customer Support',
        description:
            'Need help with an order or product? Our support process is designed to assist you.'
    },
    {
        icon: BadgeCheck,
        title: 'Customer First',
        description:
            'We continuously improve our store based on customer needs and shopping experience.'
    }
];

const categories = [
    'Electronics & Gadgets',
    'Home & Living',
    'Office & Work',
    'Fashion & Accessories',
    'Kitchen & Dining',
    'Beauty & Personal Care'
];

export default function Page() {
    return (
        <>
            <Header />

            <main className="bg-white">
                <section className="relative overflow-hidden bg-[#fff8f8]">
                    <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-red-100/60 blur-3xl" />
                    <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-orange-100/60 blur-3xl" />

                    <div className="section-pad relative">
                        <div className="container-width">
                            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#c92532] shadow-sm">
                                        <Sparkles size={14} />
                                        About Gift Zone
                                    </div>

                                    <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                        Everything you need,
                                        <span className="block text-[#c92532]">
                                            all in one place.
                                        </span>
                                    </h1>

                                    <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                                        Gift Zone is a modern online shopping
                                        destination created to make everyday
                                        shopping simple, convenient and enjoyable.
                                        From electronics and fashion to home,
                                        kitchen, beauty and office essentials,
                                        discover products for different needs in
                                        one place.
                                    </p>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <Link
                                            href="/shop"
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#c92532] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-100 transition hover:bg-[#b8202c] hover:shadow-xl"
                                        >
                                            Explore Products
                                            <ArrowRight size={17} />
                                        </Link>

                                        <Link
                                            href="/contact"
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            Contact Us
                                        </Link>
                                    </div>
                                </div>

                                <div className="relative mx-auto w-full max-w-md">
                                    <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-[0_25px_80px_rgba(15,23,42,0.10)]">
                                        <div className="rounded-2xl bg-[#0d1a2a] p-7 text-white">
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200">
                                                Gift Zone
                                            </p>

                                            <h2 className="mt-4 text-3xl font-extrabold leading-tight">
                                                Shop smarter.
                                                <br />
                                                Live better.
                                            </h2>

                                            <p className="mt-4 text-sm leading-6 text-slate-300">
                                                A growing collection of products
                                                designed around modern everyday
                                                shopping.
                                            </p>

                                            <div className="mt-7 grid grid-cols-2 gap-3">
                                                {categories.slice(0, 4).map(
                                                    (category) => (
                                                        <div
                                                            key={category}
                                                            className="rounded-xl border border-white/10 bg-white/5 p-3"
                                                        >
                                                            <p className="text-xs font-semibold leading-5 text-slate-200">
                                                                {category}
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-4 -right-4 hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl sm:block">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#c92532]">
                                                <ShieldCheck size={20} />
                                            </div>

                                            <div>
                                                <p className="text-sm font-extrabold text-slate-900">
                                                    Customer focused
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    Built for easy shopping
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-pad">
                    <div className="container-width">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">
                                What We Offer
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Built around your shopping needs
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                                We are building Gift Zone around variety,
                                convenience, product discovery and a smooth
                                shopping experience.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.title}
                                        className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#c92532]">
                                            <Icon size={22} />
                                        </div>

                                        <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                                            {feature.title}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="border-y border-slate-200 bg-slate-50">
                    <div className="section-pad">
                        <div className="container-width">
                            <div className="grid items-center gap-10 lg:grid-cols-2">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">
                                        Our Mission
                                    </p>

                                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                        Making online shopping simpler.
                                    </h2>

                                    <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                                        Our mission is to create a convenient
                                        online store where customers can discover
                                        products from multiple everyday categories
                                        without unnecessary complexity.
                                    </p>

                                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                                        We aim to combine a clean shopping
                                        experience with useful product information,
                                        straightforward ordering and dependable
                                        customer support.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {categories.map((category, index) => (
                                        <div
                                            key={category}
                                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                        >
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm font-extrabold text-[#c92532]">
                                                {String(index + 1).padStart(
                                                    2,
                                                    '0'
                                                )}
                                            </span>

                                            <span className="text-sm font-bold text-slate-700">
                                                {category}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section-pad">
                    <div className="container-width">
                        <div className="rounded-3xl bg-[#0d1a2a] px-6 py-10 text-center sm:px-10 sm:py-14">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200">
                                Start Shopping
                            </p>

                            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Discover products for every part of your life.
                            </h2>

                            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
                                Browse our growing collection and find products
                                that fit your needs, lifestyle and budget.
                            </p>

                            <Link
                                href="/shop"
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-slate-900 transition hover:bg-slate-100"
                            >
                                Visit Shop
                                <ArrowRight size={17} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}