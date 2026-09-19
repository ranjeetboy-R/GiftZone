import Header from '@/components/Header';
import Footer from '@/components/Footer';
const paragraphs = ["Eligible products can be reported for damage, wrong item or major quality issue within 7 days of delivery.", "Please keep the original packaging and share clear photos when requesting a replacement.", "Personalized products may have additional restrictions. Replace this policy with your final business policy before launch."];
export default function Page() {
  return <>
<Header />
<main className="section-pad">
  <div className="container-width max-w-4xl">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Gift Zone</p>
    <h1 className="mt-2 text-4xl font-extrabold">Returns & Replacement</h1>
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
