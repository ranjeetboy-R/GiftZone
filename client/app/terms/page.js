import Header from '@/components/Header';
import Footer from '@/components/Footer';

const paragraphs = [
    "Products, prices, availability and promotions may change without notice.",
    "Orders are confirmed after payment proof review. A submitted UTR or screenshot does not by itself guarantee verification.",
    "By placing an order, customers agree to provide accurate delivery and contact information."
];

export default function Page() {
    return (
        <>
            <Header />
            <main className="section-pad">
                <div className="container-width max-w-4xl">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">Gift Zone</p>
                    <h1 className="mt-2 text-4xl font-extrabold">Terms & Conditions</h1>
                    <div className="mt-8 grid gap-5">
                        {paragraphs.map((text, index) => (
                            <section key={index} className="rounded-xl border p-6">
                                <p className="text-sm leading-7 text-slate-600">{text}</p>
                            </section>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
