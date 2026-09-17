'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import SectionHeading from './SectionHeading';
import { apiFetch } from '@/lib/api';
export default function BestSellers() {
  const [products, setProducts] = useState();
  useEffect(() => {
    apiFetch('/api/products?featured=true').then(data => {
      if (data.products?.length) setProducts(data.products.slice(0, 8));
    }).catch(() => {});
  }, []);
  return <section className="section-pad">
  <SectionHeading eyebrow="Customer Favorites" title="Best Sellers" text="Popular products chosen by customers again and again." />
  <div className="container-width grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{products.map(product =>
    <ProductCard key={product._id || product.id || product.slug || product.name} product={product} />)}</div>
</section>;
}
