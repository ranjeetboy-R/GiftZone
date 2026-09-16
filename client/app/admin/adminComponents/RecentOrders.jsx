import Link from 'next/link';
import { ArrowRight, Eye, ShoppingBag } from 'lucide-react';

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const paymentStyles = {
    verified: 'bg-green-50 text-green-700',
    submitted: 'bg-orange-50 text-orange-700',
    rejected: 'bg-red-50 text-red-700',
    pending: 'bg-slate-100 text-slate-600'
};

const orderStyles = {
    pending: 'bg-orange-50 text-orange-700',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-purple-50 text-purple-700',
    shipped: 'bg-indigo-50 text-indigo-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700'
};

const StatusBadge = ({ status, styles }) => (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status || 'unknown'}
    </span>
);

const RecentOrders = ({ orders }) => {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                    <h2 className="font-extrabold text-slate-900">Recent Orders</h2>
                    <p className="mt-1 text-xs text-slate-400">Latest customer orders</p>
                </div>

                <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold text-[#c92532] hover:underline">
                    View all
                    <ArrowRight size={14} />
                </Link>
            </div>

            {orders.length ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Customer</th>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3">Payment</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                    <td className="px-5 py-4">
                                        <p className="max-w-[130px] truncate text-xs font-extrabold text-slate-800">#{order._id}</p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="max-w-[150px] truncate text-sm font-bold text-slate-800 capitalize">{order.customer?.name || '-'}</p>
                                        <p className="mt-1 max-w-[150px] truncate text-[11px] text-slate-400">{order.customer?.email || '-'}</p>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-extrabold text-slate-800">{formatCurrency(order.total)}</td>

                                    <td className="px-5 py-4">
                                        <StatusBadge status={order.paymentStatus} styles={paymentStyles} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <StatusBadge status={order.orderStatus} styles={orderStyles} />
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-500">{formatDate(order.createdAt)}</td>

                                    <td className="px-5 py-4">
                                        <Link href="/admin/orders" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-[#c92532] hover:text-[#c92532]">
                                            <Eye size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <ShoppingBag size={25} />
                    </div>

                    <h3 className="mt-4 font-bold text-slate-700">No orders yet</h3>
                    <p className="mt-1 text-sm text-slate-400">New customer orders will appear here.</p>
                </div>
            )}
        </section>
    );
};

export default RecentOrders;