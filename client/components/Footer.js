import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#0d1a2a] text-white">
            <div className="container-width grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
                <div><div className="text-2xl font-extrabold">🎁 Gift <span className="text-[#f08b93]">Zone</span></div><p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">Thoughtful gifts for birthdays, anniversaries, weddings, festivals and every moment worth celebrating.</p></div>
                <div><h3 className="font-bold">Shop</h3><div className="mt-4 grid gap-3 text-sm text-slate-300"><Link href="/shop">All Gifts</Link><Link href="/categories">Categories</Link><Link href="/deals">Special Deals</Link><Link href="/shop?new=true">New Arrivals</Link></div></div>
                <div><h3 className="font-bold">Help</h3><div className="mt-4 grid gap-3 text-sm text-slate-300"><Link href="/orders">Track Order</Link><Link href="/shipping">Shipping Policy</Link><Link href="/returns">Returns & Replacement</Link><Link href="/faq">FAQs</Link><Link href="/contact">Contact Us</Link></div></div>
                <div><h3 className="font-bold">Company</h3><div className="mt-4 grid gap-3 text-sm text-slate-300"><Link href="/about">About Gift Zone</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms & Conditions</Link><Link href="/contact?subject=corporate">Corporate Gifting</Link></div></div>
            </div>
            <div className="border-t border-white/10"><div className="container-width flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:justify-between"><span>© 2026 Gift Zone. All rights reserved.</span><span>Made for gifting moments with care.</span></div></div>
        </footer>
    );
}
