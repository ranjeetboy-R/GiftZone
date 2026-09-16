import Link from 'next/link';
import { AlertTriangle, ArrowRight, PackageX } from 'lucide-react';

const InventoryAlerts = ({ lowStockProducts, outOfStockProducts }) => {
    const hasAlerts = lowStockProducts.length || outOfStockProducts.length;

    return (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-extrabold text-slate-900">Inventory Alerts</h2>
                    <p className="mt-1 text-xs text-slate-400">Products that need attention</p>
                </div>

                <Link href="/admin/products" className="text-xs font-bold text-[#c92532] hover:underline">
                    Manage
                </Link>
            </div>

            {!hasAlerts ? (
                <div className="mt-6 rounded-xl bg-green-50 p-5 text-center">
                    <p className="text-sm font-bold text-green-700">Inventory looks good</p>
                    <p className="mt-1 text-xs text-green-600">No low-stock products need attention.</p>
                </div>
            ) : (
                <div className="mt-5 space-y-3">
                    {outOfStockProducts.slice(0, 4).map((product) => (
                        <div key={product._id} className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-red-500">
                                <PackageX size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-800">{product.name}</p>
                                <p className="mt-1 text-xs font-semibold text-red-600">Out of stock</p>
                            </div>
                        </div>
                    ))}

                    {lowStockProducts.slice(0, 4).map((product) => (
                        <div key={product._id} className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 p-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-orange-500">
                                <AlertTriangle size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-800">{product.name}</p>
                                <p className="mt-1 text-xs font-semibold text-orange-600">{product.stock} item(s) left</p>
                            </div>
                        </div>
                    ))}

                    <Link href="/admin/products" className="flex items-center justify-center gap-1 pt-2 text-xs font-bold text-slate-500 hover:text-[#c92532]">
                        View inventory
                        <ArrowRight size={13} />
                    </Link>
                </div>
            )}
        </section>
    );
};

export default InventoryAlerts;