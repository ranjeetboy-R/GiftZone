import {
    IndianRupee,
    Package,
    ShoppingBag,
    Users
} from 'lucide-react';

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const DashboardStats = ({ products, orders, customers, revenue, pendingOrders, pendingPayments }) => {
    const stats = [
        {
            label: 'Total Products',
            value: products,
            icon: Package,
            description: 'Products in catalog'
        },
        {
            label: 'Total Orders',
            value: orders,
            icon: ShoppingBag,
            description: `${pendingOrders} pending orders`
        },
        {
            label: 'Customers',
            value: customers,
            icon: Users,
            description: 'Unique customers'
        },
        {
            label: 'Verified Revenue',
            value: formatCurrency(revenue),
            icon: IndianRupee,
            description: `${pendingPayments} payments to review`
        }
    ];

    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, description }) => (
                <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c92532]/10 text-[#c92532]">
                            <Icon size={21} />
                        </div>

                        <span className="text-xs font-semibold text-slate-400">Overview</span>
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">{description}</p>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;