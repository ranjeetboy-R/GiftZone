import Link from 'next/link';
import { ArrowRight, PackagePlus, ShoppingBag } from 'lucide-react';

const QuickActions = () => {
    return (
        <section className="mt-6">
            <div className="mb-4">
                <h2 className="font-extrabold text-slate-900">Quick Actions</h2>
                <p className="mt-1 text-xs text-slate-400">Manage your store quickly</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/admin/products" className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c92532]/20 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c92532]/10 text-[#c92532]">
                            <PackagePlus size={21} />
                        </div>

                        <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#c92532]" />
                    </div>

                    <h3 className="mt-5 font-extrabold text-slate-900">Manage Products</h3>
                    <p className="mt-1 text-sm text-slate-500">Add, edit or remove products from your catalog.</p>
                </Link>

                <Link href="/admin/orders" className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c92532]/20 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c92532]/10 text-[#c92532]">
                            <ShoppingBag size={21} />
                        </div>

                        <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#c92532]" />
                    </div>

                    <h3 className="mt-5 font-extrabold text-slate-900">Manage Orders</h3>
                    <p className="mt-1 text-sm text-slate-500">Review payments and update customer orders.</p>
                </Link>
            </div>
        </section>
    );
};

export default QuickActions;