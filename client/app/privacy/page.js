import Header from '@/components/Header';
import Footer from '@/components/Footer';
const paragraphs = ["We respect your privacy and only use information needed to process orders, provide support and improve the shopping experience.", "Account authentication is handled by Clerk when configured. Payment proof is used only for manual order verification.", "This demo project stores sample customer and order information locally in the browser. Replace this demo policy with your legal policy before launch."];
export default function Page() {
  return <>
<Header />
<main className="section-pad">
  <div className="container-width max-w-4xl">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Gift Zone</p>
    <h1 className="mt-2 text-4xl font-extrabold">Privacy Policy</h1>
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
