'use client';

import { useEffect, useState } from 'react';
import { Heart, Search, ShoppingCart, Truck, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Show, SignInButton, UserButton } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
export default function Header({
  cartCount = 0
}) {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    setMenu(false);
  }, [pathname]);
  const submitSearch = event => {
    event.preventDefault();
    const value = search.trim();
    router.push(value ? `/shop?search=${encodeURIComponent(value)}` : '/shop');
  };
  return <>
    <div className="bg-[#0d1a2a] text-white text-xs">
      <div className="container-width flex min-h-9 items-center justify-between gap-4">
        <span className="flex items-center gap-2">
          <Truck size={13} />
          Free Shipping on Orders Above ₹999
        </span>
        <span className="hidden sm:block">Welcome to Gift Zone – Your one-stop shop for everyday essentials and more.</span>
        <div className="flex items-center gap-5">
          <Link href="/orders" className='hidden md:block'>Track Order</Link>
          <Show when="signed-in">
            <Link href="/orders">My Orders</Link>
          </Show>
        </div>
      </div>
    </div>
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
      <div className="container-width flex min-h-18 items-center">
        <Link href="/" className="shrink-0">
          <div className="flex flex-col gap-1">
            <div className="md:text-[27px] text-xl font-extrabold tracking-tight">
              Gift <span className="text-[#c92532]">Zone</span>
            </div>
            <div className="-mt-1 text-[10px] text-slate-500">Everything You Need, All in One Place</div>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {[['Home', '/'], ['Shop', '/shop'], ['Categories', '/categories'], ['Best Sellers', '/shop?best=true'], ['About', '/about']].map(([label, href]) =>
            <Link key={label} className={`text-sm font-semibold transition hover:text-[#c92532] ${pathname === href ? 'text-[#c92532]' : ''}`} href={href}>
              {label}
            </Link>)}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <form onSubmit={submitSearch} className="hidden h-10 w-48 items-center rounded-full border border-slate-200 px-4 md:flex">
            <input value={search} onChange={event => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search products..." aria-label="Search products" />
            <button type="submit" aria-label="Search">
              <Search size={18} className="text-slate-500" />
            </button>
          </form>
          <Link href="/wishlist" aria-label="Wishlist" className="hidden sm:block">
            <Heart size={21} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c92532] px-1 text-[10px] font-bold text-white">{cartCount}</span>}
          </Link>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="rounded-full border border-slate-200 px-4 py-1.5 bg-rose-50 text-sm font-semibold">Login</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <button type="button" onClick={() => setMenu(!menu)} className="lg:hidden" aria-label="Toggle menu">
            {menu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      <div className={`${menu ? 'translate-y-18' : '-translate-y-150'} transition-all duration-500 fixed top-0 border-t border-slate-100 bg-white w-full px-4 py-8 lg:hidden shadow-lg rounded-b-3xl`}>
        <div className="container-width grid gap-6 text-sm font-semibold">
          <form onSubmit={submitSearch} className="flex items-center rounded-md border border-slate-300 p-3">
            <input value={search} onChange={event => setSearch(event.target.value)} className="w-full outline-none" placeholder="Search products..." />
            <Search size={18} />
          </form>

          <div className="flex flex-col gap-2">
            <Link className='border px-3 py-2 rounded-lg border-slate-200 hover:bg-slate-50' href="/" onClick={() => setMenu(false)}>Home</Link>
            <Link className='border px-3 py-2 rounded-lg border-slate-200 hover:bg-slate-50' href="/shop">Shop & Categories</Link>
            <Link className='border px-3 py-2 rounded-lg border-slate-200 hover:bg-slate-50' href="/shop?best=true">Best Sellers</Link>
            <Link className='border px-3 py-2 rounded-lg border-slate-200 hover:bg-slate-50' href="/wishlist">Wishlist</Link>
            <Link className='border px-3 py-2 rounded-lg border-slate-200 hover:bg-slate-50' href="/orders">My Orders</Link>
            <Link className='border px-3 py-2 rounded-lg border-slate-200 hover:bg-slate-50' href="/about">About</Link>
            <Link className='border px-3 py-2 rounded-lg border-slate-200 hover:bg-slate-50' href="/orders">My Orders</Link>
          </div>
        </div>
      </div>
    </header>
  </>;
}
