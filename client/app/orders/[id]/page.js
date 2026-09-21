'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
const steps = ['confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailsPage({ params }) {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    const getId = async () => {
      const { id } = await params;
      setId(id || "");
    }
    getId();
  }, [])  

  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) { return; }
    const getOrder = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const data = await apiFetch(`/api/orders/mine/${id}`, { token });
        setOrder(data.order || null);
      }
      catch (error) {
        console.error('Failed to fetch order:', error);
        setOrder(null);
      }
      finally {
        setLoading(false);
      }
    };
    getOrder();
  }, [id]);

  if (!order)
    return <>

      <Header />

      <main className="container-width section-pad">
        <div className="py-20 text-center">
          <h1 className="text-3xl font-extrabold">Order not found</h1>
          <p className="mt-2 text-slate-500">This order may have been cleared from this browser.</p>
          <Link href="/shop" className="mt-5 inline-block font-bold text-[#c92532]">Continue Shopping</Link>
        </div>
      </main>

      <Footer />
    </>;

  const current = steps.indexOf(order.orderStatus);  

  return <>
    <Header />

    <main className="section-pad">
      <div className="container-width">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Order Confirmation</p>
            <h1 className="mt-2 text-4xl font-extrabold">Order #{order.id}</h1>
          </div>
          <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">Payment {order.paymentStatus}</span>
        </div>
        <section className="mt-8 rounded-xl border border-slate-300 bg-slate-50 p-6 md:p-8">
          <h2 className="text-xl font-bold">Order Status</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {steps.map((step, index) =>
              <div key={step} className="md:block flex flex-col gap-4">
                <div className={`relative md:block flex items-center gap-3 ${index <= current ? 'text-green-500' : 'text-slate-300'}`}>
                  <div className={`${index <= current ? 'bg-green-400 text-white' : 'bg-white'} flex h-12 w-12 items-center justify-center rounded-full border-2 border-current`}>
                    <CheckCircle2 size={21} />
                  </div>

                  <p className="md:mt-3 text-sm font-bold capitalize">{step}</p>

                  {
                    index < steps.length - 1 &&
                    <div className={`absolute left-14 top-6 hidden md:block h-0.5 w-[calc(100%-48px)] ${index < current ? 'bg-green-500' : 'bg-slate-200'}`} />
                  }
                </div>

                {
                  index < steps.length - 1 &&
                  <div className={`md:hidden ml-5.5 h-10 w-1 ${index < current ? 'bg-green-500' : 'bg-slate-200'}`} />
                }
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="rounded-xl border border-slate-300 bg-slate-50 p-6">
            <h2 className="text-xl font-bold">Items</h2>
            <div className="mt-5 grid gap-4">{order.items.map(item =>
              <div key={item._id} className="flex gap-4 border-b pb-4">
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
                </div>
                <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
              </div>)}</div>
            <h2 className="mt-8 text-xl font-bold">Delivery Address</h2>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              <p className='font-semibold'>{order.customer.name?.toUpperCase()}</p>
              {order.customer.email} <br />
              {order.customer.phone}
              {order.customer.address} <br />
              {order.customer.city && `${order.customer.city} ,`} 
              {order.customer.state && `${order.customer.state} - `} {order.customer.pincode} <br />
            </div>
          </section>

          <aside className="h-fit rounded-xl border border-slate-300 bg-slate-50 p-6">
            <h2 className="text-xl font-bold">Payment Summary</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="my-2 border-t" />
              <div className="flex justify-between text-lg font-extrabold">
                <span>Total</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-3 text-xs text-slate-500">UTR: <strong>{order.utr}</strong>
              </div>
              <Link href={order.paymentProofUrl} className="text-xs overflow-hidden w-full whitespace-nowrap hover:text-blue-500 text-slate-500">Proof: {order.paymentProofUrl?.slice(0, 40)}...</Link>
            </div>
            <Link href="/shop" className="mt-6 block rounded-md bg-[#c92532] py-3 text-center text-sm font-bold text-white">Continue Shopping</Link>
          </aside>
        </div>
      </div>
    </main>

    <Footer />
  </>;
}
