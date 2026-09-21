'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = event => {
    event.preventDefault();
    setSent(true);
  };
  return <>
    <Header />
    <main className="section-pad">
      <div className="container-width grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">We’re Here to Help</p>
          <h1 className="mt-2 text-4xl font-extrabold">Contact Gift Zone</h1>
          <p className="mt-4 max-w-xl leading-7 text-slate-600">Need help finding a product, tracking an order, or placing a bulk order? Send us a message.</p>
          <div className="mt-8 grid gap-4">
            <div className="rounded-xl bg-[#fff7f3] p-5">
              <p className="text-xs font-bold uppercase text-slate-400">Phone</p>
              <p className="mt-1 font-bold">+91 7079459758</p>
            </div>
            <div className="rounded-xl bg-[#fff7f3] p-5">
              <p className="text-xs font-bold uppercase text-slate-400">Email</p>
              <p className="mt-1 font-bold">giftzone.support@gmail.com</p>
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-xl border p-6 md:p-8">
          <h2 className="text-xl font-bold">Send a Message</h2>
          <div className="mt-5 grid gap-4">
            <input required placeholder="Full Name" className="rounded-md border px-3 py-3" />
            <input required type="email" placeholder="Email Address" className="rounded-md border px-3 py-3" />
            <select className="rounded-md border px-3 py-3">
              <option>General Support</option>
              <option>Order Support</option>
              <option>Business & Bulk Orders</option>
            </select>
            <textarea required placeholder="How can we help?" className="min-h-32 rounded-md border px-3 py-3" />
            <button className="rounded-md bg-[#c92532] py-3 font-bold text-white">Send Message</button>{sent && <p className="text-sm font-semibold text-green-600">Thanks! Your message has been received.</p>}</div>
        </form>
      </div>
    </main>
    <Footer />
  </>;
}
