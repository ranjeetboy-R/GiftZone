'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, Gift, ShieldCheck, Headphones, MoveRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { hero } from "@/public/data/site.json";
const icons = {
  Heart,
  Gift,
  ShieldCheck,
  Headphones
};
export default function HomePage() {
  const {
    items
  } = useCart();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    Promise.all([fetch('/data/site.json').then(response => response.json()), fetch('/data/products.json').then(response => response.json())]).then(([site, productData]) => {
      setData(site);
      setProducts(productData.products || []);
    });
  }, []);
  if (!data) return <div className="min-h-screen bg-white" />;
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const best = products.filter(item => item.badge === 'Best Seller').slice(0, 4);
  const newest = products.filter(item => item.badge === 'New Arrival').slice(0, 4);
  return <>
<Header cartCount={cartCount} />
<main>
  <section className="bg-[#fff7f3] md:p-0 p-3">
    <div className="md:min-h-142.5 md:mt-0 mt-45 container-width gap-5 relative">
      <div className="flex flex-col md:absolute top-1/2 -translate-y-1/2 left-0 z-10 justify-center">
        <span className="bg-rose-100 px-5 py-2 rounded-full w-fit text-xs font-semibold">{hero.eyebrow}</span>
        <h1 className="mt-10 text-5xl md:text-7xl font-semibold font-super">
          <p className=''>Make Every Moment</p>
          <p className='text-rose-500'>More Special</p>
        </h1>
      <p className='max-w-lg w-full mt-5 text-slate-700'>{hero.description}</p>
      <div className="flex mt-5 items-center gap-5">
        <Link href='/shop' className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all w-fit text-sm font-semibold">
                                    {hero.primaryCta} <MoveRight size={18} />
        </Link>
      <Link href='/categories' className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 hover:bg-zinc-100 transition-all w-fit text-sm font-semibold">
                                    {hero.secondaryCta}
      </Link>
  </div>
</div>

                        {/* Image section  */}
<div className="max-w-180 w-full aspect-video md:absolute top-1/2 -translate-y-1/2 right-0">
  <Image src='/images/hero.png' fill alt='Hero banner' className='select-none' />
</div>
</div>
</section>
<section className="section-pad">
  <div className="container-width">
    <SectionHeading eyebrow="Shop by Category" title="Find Products for Every Need" description="Browse popular categories and discover what you need." />
    <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            {data.categories.map(item =>
      <Link key={item.slug} href={`/shop?category=${item.slug}`} className="group rounded-xl border border-slate-200 bg-white p-4 text-center hover:-translate-y-1 hover:border-[#c92532] hover:shadow-lg transition-all duration-300">
        <div className="mx-auto flex h-28 items-center justify-center overflow-hidden rounded-lg bg-[#fff7f3]">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        </div>
      <h3 className="mt-4 text-sm font-bold">{item.name}</h3>
      <p className="mt-1 text-xs text-slate-400">{item.count}+ products</p>
    </Link>)}
</div>
</div>
</section>
<section className="bg-slate-50 section-pad">
  <div className="container-width">
    <SectionHeading eyebrow="Customer Favorites" title="Best Sellers" description="Products our customers keep coming back for." action="View All" href="/shop?best=true" />
    <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{best.map(product =>
      <ProductCard key={product.id} product={product} />)}</div>
  </div>
</section>
<section className="section-pad">
  <div className="container-width">
    <div className="grid overflow-hidden rounded-2xl bg-[#0d1a2a] text-white lg:grid-cols-2">
      <div className="p-8 md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4b8bd]">Business & Bulk Orders</p>
        <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Product solutions for every business need.</h2>
        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">Order in bulk, explore workplace essentials, and get help from our team for larger requirements.</p>
        <Link href="/contact?subject=bulk" className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-[#0d1a2a]">Talk to our team <ArrowRight size={16} />
        </Link>
    </div>
  <div className="grid grid-cols-2 gap-4 p-5 md:p-8">{products.slice(8, 12).map(item =>
    <img key={item.id} src={item.image} alt="Featured products" className="h-40 w-full rounded-xl object-cover" />)}</div>
</div>
</div>
</section>
<section className="section-pad bg-[#fff7f3]">
  <div className="container-width">
    <SectionHeading eyebrow="Just Added" title="New Arrivals" description="Fresh products added to our store." action="Explore New" href="/shop?new=true" />
    <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{newest.map(product =>
      <ProductCard key={product.id} product={product} />)}</div>
  </div>
</section>
<section className="section-pad">
  <div className="container-width">
    <SectionHeading eyebrow="Why Gift Zone" title="A Better Way to Shop" />
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{data.why.map(item => {
              const Icon = icons[item.icon] || Gift;
              return <div key={item.title} className="rounded-xl border border-slate-200 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0ed] text-[#c92532]">
          <Icon size={21} />
        </div>
      <h3 className="mt-5 font-bold">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
    </div>;
            })}</div>
</div>
</section>
<section className="bg-slate-50 section-pad">
  <div className="container-width">
    <SectionHeading eyebrow="Loved by Customers" title="What Our Customers Say" />
    <div className="mt-10 grid gap-5 md:grid-cols-3">{data.testimonials.map(item =>
      <div key={item.name} className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <img src={item.image} alt={item.name} className="h-12 w-12 rounded-full" />
          <div>
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-xs text-slate-400">{item.city}</p>
          </div>
      </div>
    <div className="mt-4 text-sm text-amber-500">★★★★★</div>
    <p className="mt-3 text-sm leading-6 text-slate-600">“{item.text}”</p>
  </div>)}</div>
</div>
</section>
</main>
<Footer />
</>;
}
