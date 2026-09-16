'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { Show, SignInButton, useAuth } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiFetch } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const {getToken} = useAuth();

  useEffect(() => {
    const getOrders = async () => {
      try {
        const token = await getToken();
        const data = await apiFetch('/api/orders/mine', {
          token
        });

        setOrders(data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      }
    };

    getOrders();
  }, []);  

  return <>
    <Header />
    <main className="section-pad">
      <div className="container-width">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Your Account</p>
          <h1 className="mt-2 text-4xl font-extrabold">My Orders</h1>
        </div>
        <Show when="signed-out">
          <div className="mt-10 rounded-xl border p-8 text-center">
            <Package className="mx-auto" size={40} />
            <p className="mt-4 font-bold">Login to view your orders</p>
            <SignInButton mode="modal">
              <button className="mt-4 rounded-md bg-[#c92532] px-6 py-3 text-sm font-bold text-white">Login</button>
            </SignInButton>
          </div>
        </Show>
        <Show when="signed-in">{orders.length ? <div className="mt-8 grid gap-4">
          {orders.map(order =>
          <Link key={order._id} href={`/orders/${order._id}`} className="rounded-xl border border-slate-300 bg-slate-50 p-5 transition hover:shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">Order #{order.id}</p>
                <h1 className='font-semibold'>{order.items?.[0]?.name}</h1>
                <h2 className="mt-1 text-xs text-slate-500">{order.items?.length || 0} items · ₹{order.total?.toLocaleString('en-IN')}</h2>
                <p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">{order.orderStatus}</span>
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>)}</div> : <div className="mt-10 rounded-xl border p-10 text-center">
          <div className="text-6xl">📦</div>
          <h2 className="mt-4 text-xl font-bold">No orders yet</h2>
          <p className="mt-2 text-sm text-slate-500">Your completed demo orders will appear here.</p>
          <Link href="/shop" className="mt-5 inline-block text-sm font-bold text-[#c92532]">Start Shopping</Link>
        </div>}</Show>
      </div>
    </main>
    <Footer />
  </>;
}
