'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch('/data/categories.json').then(response => response.json()).then(setCategories).catch(() => setCategories([]));
  }, []);
  return <>
<Header />
<main className="bg-white">
  <section className="section-pad pb-12">
    <div className="container-width">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c92532]">
                                Explore Our Collections
        </p>
      <h1 className="font-super mt-3 text-4xl leading-tight text-slate-900 md:text-6xl">
                                Products for Every Need
      </h1>
    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                                Explore a growing range of products for your home, work,
                                lifestyle, and everyday needs.
    </p>
</div>
<div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {categories.map((item, index) =>
  <Link key={item.slug} href={`/shop?category=${item.slug}`} className={`group relative overflow-hidden rounded-3xl bg-[#fff7f3] ${index === 0 || index === 3 ? 'lg:row-span-2' : ''}`}>
    <div className={`relative overflow-hidden ${index === 0 || index === 3 ? 'h-[520px]' : 'h-[360px]'}`}>
      <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                                        {item.count}+ Products
            </p>
          <h2 className="font-super mt-2 text-2xl text-white md:text-3xl">
                                                        {item.name}
          </h2>
      </div>
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg text-slate-900 transition duration-300 group-hover:bg-[#c92532] group-hover:text-white">
                                                    →
    </span>
</div>
<div className="mt-4 flex items-center gap-2 text-sm font-semibold text-white opacity-0 transition duration-300 group-hover:opacity-100">
                                                Explore Collection
  <span>→</span>
</div>
</div>
</div>
</Link>)}
</div>
</div>
</section>
<section className="border-y border-slate-100 bg-[#fffaf7] py-16">
  <div className="container-width">
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c92532]">
                                Need Inspiration?
      </p>
    <h2 className="font-super mt-3 text-3xl text-slate-900 md:text-4xl">
                                Not sure what to shop for?
    </h2>
  <p className="mt-4 text-sm leading-7 text-slate-500">
                                Explore our complete collection and find the right product
                                for your needs.
  </p>
<Link href="/shop" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#c92532] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#a91e29]">
                                Browse All Products
  <span>→</span>
</Link>
</div>
</div>
</section>
</main>
<Footer />
</>;
}
