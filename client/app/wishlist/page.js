'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/context/WishlistContext';
export default function WishlistPage() {
  const {
    items
  } = useWishlist();
  return <>
    <Header />
    <main className="section-pad">
      <div className="container-width">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Saved for Later</p>
        <h1 className="mt-2 text-4xl font-extrabold">My Wishlist</h1>{items.length ? <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{items.map(item =>
          <ProductCard key={item.id || item._id || item.slug} product={item} />)}</div> : <div className="py-20 text-center">
          <div className="text-6xl">❤️</div>
          <h2 className="mt-4 text-xl font-bold">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-slate-500">Save products you love and come back later.</p>
          <Link href="/shop" className="mt-5 inline-block rounded-md bg-[#c92532] px-6 py-3 text-sm font-bold text-white">Explore Products</Link>
        </div>}</div>
    </main>
    <Footer />
  </>;
}
