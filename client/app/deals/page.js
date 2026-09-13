
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function DealsPage() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('/data/products.json')
            .then((response) => response.json())
            .then((data) => setProducts((data.products || []).filter((item) => item.compareAtPrice > item.price)));
    }, []);

    return (
        <>
            <Header />
            <main className="section-pad">
                <div className="container-width">
                    <div className="rounded-2xl bg-[#0d1a2a] p-8 text-white md:p-12">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4b8bd]">Gift Zone Offers</p>
                        <h1 className="mt-2 text-4xl font-extrabold">Special Deals</h1>
                        <p className="mt-3 max-w-xl text-sm text-slate-300">Save more on thoughtful gifts with our rotating demo offers and coupons.</p>
                    </div>
                    <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {products.map((item) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
