import Link from 'next/link';
import { BadgeCheck, Boxes, Clock3, Sparkles } from 'lucide-react';
export default function CorporateBanner() {
  return <section className="pb-16">
  <div className="container-width overflow-hidden rounded-xl bg-[#f7e9e3]">
    <div className="grid min-h-52 items-center md:grid-cols-[1.2fr_1fr_.8fr]">
      <div className="p-7 md:p-9">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Business & Bulk Shopping Made Easy</h2>
        <p className="mt-2 text-sm text-slate-600">Get product solutions for teams, workplaces, and larger orders.</p>
        <Link href="/shop?category=Corporate%20Gifts" className="mt-6 inline-flex rounded-md border border-[#c92532] px-5 py-2.5 text-sm font-bold text-[#c92532]">Explore Products →</Link>
      </div>
    <div className="hidden text-center text-8xl md:block">🎁</div>
    <div className="grid gap-3 p-7 text-xs font-semibold">
      <span className="flex items-center gap-2">
        <Boxes size={18} /> Bulk Orders</span>
      <span className="flex items-center gap-2">
        <Sparkles size={18} /> Custom Branding</span>
      <span className="flex items-center gap-2">
        <BadgeCheck size={18} /> Premium Quality</span>
      <span className="flex items-center gap-2">
        <Clock3 size={18} /> On-Time Delivery</span>
    </div>
</div>
</div>
</section>;
}
