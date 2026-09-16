import { CheckCircle2, Package, IndianRupee, Clock3 } from "lucide-react";

const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const OrderStats = ({ totalOrders, pendingPayments, totalRevenue, deliveredOrders }) => {

    const stats = [
        {
            title: "Total Orders",
            value: totalOrders,
            icon: Package,
            className:
                "border-slate-100 bg-slate-50 text-slate-900"
        },
        {
            title: "Payment Review",
            value: pendingPayments,
            icon: Clock3,
            className:
                "border-orange-100 bg-orange-50 text-orange-700"
        },
        {
            title: "Verified Revenue",
            value: formatCurrency(totalRevenue),
            icon: IndianRupee,
            className:
                "border-green-100 bg-green-50 text-green-700"
        },
        {
            title: "Delivered",
            value: deliveredOrders,
            icon: CheckCircle2,
            className:
                "border-blue-100 bg-blue-50 text-blue-700"
        }
    ];

    return (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <div
                        key={stat.title}
                        className={`rounded-2xl border border-slate-200 shadow-lg p-5 ${stat.className}`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                                {stat.title}
                            </p>

                            <Icon size={20} />
                        </div>

                        <p className="mt-3 text-2xl font-extrabold">
                            {stat.value}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderStats;