'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FAQPage() {
    const [faqs, setFaqs] = useState([]);
    const [open, setOpen] = useState(0);
    useEffect(() => { fetch('/data/faqs.json').then((response) => response.json()).then(setFaqs); }, []);
    return <><Header /><main className="section-pad"><div className="container-width max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Help Center</p><h1 className="mt-2 text-4xl font-extrabold">Frequently Asked Questions</h1><div className="mt-10 divide-y rounded-xl border">{faqs.map((faq,index) => <div key={faq.q} className="p-5"><button type="button" onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-5 text-left font-bold">{faq.q}<span>{open === index ? '−' : '+'}</span></button>{open === index && <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{faq.a}</p>}</div>)}</div></div></main><Footer /></>
}
