import Header from '@/components/Header';
import Footer from '@/components/Footer';
export default function AboutPage() {
  return <>
    <Header />
    <main>
      <section className="bg-[#fff7f3] section-pad">
        <div className="container-width max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Our Story</p>
          <h1 className="mt-3 text-5xl font-extrabold">Shopping for everyday needs should be simple.</h1>
          <p className="mt-6 text-base leading-8 text-slate-600">Gift Zone is a modern online store built around easy product discovery, quality choices, and a simple checkout experience.</p>
        </div>
      </section>
      <section className="section-pad">
        <div className="container-width grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border p-6">
            <h2 className="font-bold">Wide Selection</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">A growing catalog helps you find products for every need.</p>
          </div>
          <div className="rounded-xl border p-6">
            <h2 className="font-bold">Convenient</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Browse categories, compare products, and shop with confidence.</p>
          </div>
          <div className="rounded-xl border p-6">
            <h2 className="font-bold">Helpful</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Support before and after purchase keeps shopping stress-free.</p>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
