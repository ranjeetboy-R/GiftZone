'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import SectionHeading from './SectionHeading';
import { apiFetch } from '@/lib/api';
import { demoProducts as fallbackProducts } from '@/data/site';

export default function NewArrivals() {
    const [products, setProducts] = useState(fallbackProducts.slice(0, 4));

    useEffect(() => {
        apiFetch('/api/products?new=true&limit=8')
            .then(data => {
                if (data.products?.length) {
                    setProducts(data.products.slice(0, 8));
                }
            })
            .catch(() => {});
    }, []);

    return (
        <section className="section-pad bg-[#fffaf7]">
            <SectionHeading
                eyebrow="Fresh Picks"
                title="New Arrivals"
                text="Discover the latest gifts added to Gift Zone."
                link="View All →"
                href="/shop?sort=newest"
            />
            <div className="container-width grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map(product => (
                    <ProductCard
                        key={product._id || product.id || product.slug || product.name}
                        product={product}
                    />
                ))}
            </div>
        </section>
    );
}
