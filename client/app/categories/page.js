'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, FolderOpen, RefreshCw, Sparkles } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiFetch } from '@/lib/api';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await apiFetch('/api/products/categories');

            if (!data || !Array.isArray(data.categories)) {
                throw new Error('Invalid category data.');
            }

            setCategories(data.categories);
        } catch (error) {
            console.error('Failed to load categories:', error);
            setCategories([]);
            setError('Unable to load categories right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    return (
        <>
            <Header />

            <main className="bg-white">
                <section className="section-pad pb-12">
                    <div className="container-width">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c92532]">
                                Explore Our Collections
                            </p>

                            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
                                Products for Every Need
                            </h1>

                            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                                Discover products across electronics, home,
                                fashion, kitchen, beauty, office and more.
                                Find everything you need in one place.
                            </p>
                        </div>

                        {loading && (
                            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <div
                                        key={item}
                                        className="h-90 animate-pulse rounded-3xl bg-slate-100"
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && error && (
                            <div className="mx-auto mt-14 max-w-md rounded-2xl border border-red-100 bg-red-50 p-7 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#c92532] shadow-sm">
                                    <RefreshCw size={21} />
                                </div>

                                <h2 className="mt-4 text-lg font-extrabold text-slate-900">
                                    Categories unavailable
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={loadCategories}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c92532] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a91e29]"
                                >
                                    <RefreshCw size={16} />
                                    Try Again
                                </button>
                            </div>
                        )}

                        {!loading && !error && categories.length === 0 && (
                            <div className="mx-auto mt-14 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                                    <FolderOpen size={24} />
                                </div>

                                <h2 className="mt-4 text-lg font-extrabold text-slate-900">
                                    No categories available
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    We are currently updating our product
                                    collections. Please check again soon.
                                </p>

                                <Link
                                    href="/shop"
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c92532] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a91e29]"
                                >
                                    Browse Products
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        )}

                        {!loading && !error && categories.length > 0 && (
                            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {categories.map((item, index) => {
                                    const productCount =
                                        Number(item.count) || 0;

                                    return (
                                        <Link
                                            key={item.slug}
                                            href={`/shop?category=${encodeURIComponent(item.slug)}`}
                                            aria-label={`Explore ${item.name}`}
                                            className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c92532]/20 hover:shadow-xl md:p-7"
                                        >
                                            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#c92532]/5 transition-transform duration-500 group-hover:scale-150" />

                                            <div className="relative">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c92532]/10 text-[#c92532] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#c92532] group-hover:text-white">
                                                        <Sparkles size={25} strokeWidth={1.8} />
                                                    </div>

                                                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all duration-300 group-hover:border-[#c92532] group-hover:bg-[#c92532] group-hover:text-white">
                                                        <ArrowUpRight
                                                            size={18}
                                                            className="transition-transform duration-300 group-hover:rotate-45"
                                                        />
                                                    </span>
                                                </div>

                                                <div className="mt-8">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c92532]">
                                                        {productCount > 0
                                                            ? `${productCount}+ Products`
                                                            : 'Explore Products'}
                                                    </p>

                                                    <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
                                                        {item.name}
                                                    </h2>

                                                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors duration-300 group-hover:text-[#c92532]">
                                                        Explore Collection
                                                        <ArrowRight
                                                            size={16}
                                                            className="transition-transform duration-300 group-hover:translate-x-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                <section className="border-y border-slate-100 bg-[#fffaf7]">
                    <div className="section-pad">
                        <div className="container-width">
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c92532]">
                                    Need Inspiration?
                                </p>

                                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                                    Not sure what to shop for?
                                </h2>

                                <p className="mt-4 text-sm leading-7 text-slate-500">
                                    Browse our complete collection and discover
                                    products for your home, lifestyle, work and
                                    everyday needs.
                                </p>

                                <Link
                                    href="/shop"
                                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#c92532] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#a91e29]"
                                >
                                    Browse All Products
                                    <ArrowRight size={17} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
