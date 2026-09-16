import {
    Eye,
    Loader2,
    Package
} from "lucide-react";

const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
};

const PaymentStatus = ({ status }) => {
    const styles = {
        verified:
            "bg-green-50 text-green-700",
        rejected:
            "bg-red-50 text-red-700",
        submitted:
            "bg-orange-50 text-orange-700",
        pending:
            "bg-slate-100 text-slate-600"
    };

    return (
        <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${styles[status] ||
                "bg-slate-100 text-slate-600"
                }`}
        >
            {status}
        </span>
    );
};

const OrderStatus = ({ status }) => {
    const styles = {
        pending:
            "bg-orange-50 text-orange-700",
        confirmed:
            "bg-blue-50 text-blue-700",
        processing:
            "bg-purple-50 text-purple-700",
        shipped:
            "bg-indigo-50 text-indigo-700",
        delivered:
            "bg-green-50 text-green-700",
        cancelled:
            "bg-red-50 text-red-700"
    };

    return (
        <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${styles[status] ||
                "bg-slate-100 text-slate-600"
                }`}
        >
            {status}
        </span>
    );
};

const OrdersTable = ({ orders, loading, onView }) => {
    if (loading) {
        return (
            <div className="mt-6 flex min-h-87.5 items-center justify-center rounded-2xl bg-white">
                <div className="text-center">
                    <Loader2
                        size={32}
                        className="mx-auto animate-spin text-[#c92532]"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-500">
                        Loading orders...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-262.5 text-left">
                    <thead>
                        <tr className="border-b bg-slate-600 text-xs uppercase tracking-wide text-white">
                            <th className="px-5 py-4">
                                Order
                            </th>

                            <th className="px-5 py-4">
                                Customer
                            </th>

                            <th className="px-5 py-4">
                                Items
                            </th>

                            <th className="px-5 py-4">
                                Amount
                            </th>

                            <th className="px-5 py-4">
                                Payment
                            </th>

                            <th className="px-5 py-4">
                                Status
                            </th>

                            <th className="px-5 py-4">
                                Date
                            </th>

                            <th className="px-5 py-4 text-right">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order._id}
                                className="border-b border-slate-50 hover:bg-slate-50"
                            >
                                <td className="px-5 py-4">
                                    <p className="max-w-37.5 truncate font-bold">
                                        #{order._id}
                                    </p>
                                </td>

                                <td className="px-5 py-4">
                                    <p className="font-bold capitalize">
                                        {
                                            order.customer
                                                ?.name
                                        }
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {
                                            order.customer
                                                ?.phone
                                        }
                                    </p>
                                </td>

                                <td className="px-5 py-4 text-sm font-semibold">
                                    {order.items?.length || 0}{" "}
                                    items
                                </td>

                                <td className="px-5 py-4 font-extrabold">
                                    {formatCurrency(
                                        order.total
                                    )}
                                </td>

                                <td className="px-5 py-4">
                                    <PaymentStatus
                                        status={
                                            order.paymentStatus
                                        }
                                    />
                                </td>

                                <td className="px-5 py-4">
                                    <OrderStatus
                                        status={
                                            order.orderStatus
                                        }
                                    />
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                                    {formatDate(
                                        order.createdAt
                                    )}
                                </td>

                                <td className="px-5 py-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onView(order)
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:border-[#c92532] hover:text-[#c92532]"
                                    >
                                        <Eye size={15} />
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!orders.length && (
                <div className="py-20 text-center">
                    <Package
                        size={42}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 font-bold text-slate-700">
                        No orders found
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                        Try changing your search or filters.
                    </p>
                </div>
            )}
        </div>
    );
};

export default OrdersTable;