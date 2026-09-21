import Header from '@/components/Header';
import Footer from '@/components/Footer';

const paragraphs = ["Orders are generally dispatched within 1–2 business days. Delivery usually takes 3–7 business days depending on destination.", "Orders above ₹999 receive free standard shipping in this. Other orders use a ₹0 standard shipping fee.", "Remote areas and festive periods may require additional time."];

export default function Page() {

  return <>
    <Header />

    <main className="section-pad">
      <div className="container-width max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Gift Zone</p>
        <h1 className="mt-2 text-4xl font-extrabold">Shipping Policy</h1>
        <div className="mt-8 grid gap-5">
          {paragraphs.map((text, index) =>
            <section key={index} className="rounded-xl border p-6">
              <p className="text-sm leading-7 text-slate-600">{text}</p>
            </section>)}
        </div>
      </div>
    </main>

    <Footer />
  </>;
}
