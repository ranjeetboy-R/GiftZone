'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import LoadingGrid from '@/components/LoadingGrid';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';

export default function ShopPage() {
    const { items } = useCart();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [catalog, setCatalog] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [wishlistOnly, setWishlistOnly] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/data/products.json').then((response) => response.json()),
            fetch('/data/categories.json').then((response) => response.json())
        ])
            .then(([productData, categoryData]) => {
                setCatalog(productData.products || []);
                setCategories(categoryData || []);
            })
            .catch(() => setError('Unable to load demo catalog.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setSearch(searchParams.get('search') || '');
        setCategory(searchParams.get('category') || '');
        setSort(searchParams.get('sort') || (searchParams.get('best') === 'true' ? 'rating' : 'newest'));
        setPage(Number(searchParams.get('page')) || 1);
    }, [searchParams]);

    const filtered = useMemo(() => {
        let result = [...catalog];
        const query = search.trim().toLowerCase();
        if (query) result = result.filter((item) => `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query));
        if (category) result = result.filter((item) => item.category.toLowerCase().replaceAll(' ', '-') === category || item.category === category);
        if (searchParams.get('new') === 'true') result = result.filter((item) => item.badge === 'New Arrival');
        if (searchParams.get('best') === 'true') result = result.filter((item) => item.badge === 'Best Seller');
        if (wishlistOnly) {
            try {
                const saved = JSON.parse(localStorage.getItem('gift-zone-wishlist') || '[]');
                const ids = new Set(saved.map((item) => item.id || item._id || item.slug));
                result = result.filter((item) => ids.has(item.id || item.slug));
            } catch {}
        }
        if (sort === 'price-low') result.sort((a, b) => a.price - b.price);
        if (sort === 'price-high') result.sort((a, b) => b.price - a.price);
        if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
        if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
        return result;
    }, [catalog, search, category, sort, wishlistOnly, searchParams]);

    const pageSize = 8;
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, pages);
    const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const updateUrl = (changes) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(changes).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
        params.delete('page');
        router.push(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
    };

    return (
        <>
            <Header cartCount={cartCount} />
            <main className="section-pad">
                <div className="container-width">
                    <div className="rounded-2xl bg-[#fff7f3] p-7 md:p-10">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c92532]">Gift Collection</p>
                        <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">Shop Gifts</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Find thoughtful gifts for every occasion, budget and relationship.</p>
                    </div>

                    <div className="mt-7 grid gap-6 lg:grid-cols-[240px_1fr]">
                        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-28">
                            <h2 className="font-bold">Filters</h2>
                            <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">Search</label>
                            <input value={search} onChange={(event) => updateUrl({ search: event.target.value })} placeholder="Search gifts" className="mt-2 w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-[#c92532]" />
                            <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">Category</label>
                            <div className="mt-2 grid gap-2">
                                <button type="button" onClick={() => updateUrl({ category: '' })} className={`text-left text-sm ${!category ? 'font-bold text-[#c92532]' : ''}`}>All Categories</button>
                                {categories.map((item) => <button key={item.slug} type="button" onClick={() => updateUrl({ category: item.slug })} className={`text-left text-sm ${category === item.slug ? 'font-bold text-[#c92532]' : ''}`}>{item.name} <span className="text-slate-400">({item.count})</span></button>)}
                            </div>
                            <label className="mt-5 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={wishlistOnly} onChange={(event) => setWishlistOnly(event.target.checked)} /> Wishlist only</label>
                        </aside>

                        <section>
                            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                                <p className="text-sm text-slate-500"><strong className="text-slate-800">{filtered.length}</strong> products found</p>
                                <select value={sort} onChange={(event) => updateUrl({ sort: event.target.value === 'newest' ? '' : event.target.value })} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold outline-none">
                                    <option value="newest">Newest</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                    <option value="name">Name: A to Z</option>
                                </select>
                            </div>
                            {error ? <div className="mt-6"><ErrorState message={error} /></div> : loading ? <div className="mt-6"><LoadingGrid count={8} /></div> : visible.length ? (
                                <>
                                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                                    <div className="mt-8 flex items-center justify-center gap-2">
                                        <button disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)} className="rounded-md border px-4 py-2 text-sm disabled:opacity-40">Previous</button>
                                        {Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button key={number} onClick={() => setPage(number)} className={`h-9 w-9 rounded-md text-sm font-bold ${number === currentPage ? 'bg-[#c92532] text-white' : 'border'}`}>{number}</button>)}
                                        <button disabled={currentPage === pages} onClick={() => setPage((value) => value + 1)} className="rounded-md border px-4 py-2 text-sm disabled:opacity-40">Next</button>
                                    </div>
                                </>
                            ) : <EmptyState title="No gifts found" message="Try another search or category." action="View All Gifts" href="/shop" />}
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
