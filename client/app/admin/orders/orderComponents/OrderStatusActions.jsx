import {
    CheckCircle2,
    ChevronDown,
    Loader2
} from "lucide-react";

const paymentStatuses = [
    "pending",
    "submitted",
    "verified",
    "rejected"
];

const orderStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
];

const OrderStatusActions = ({
    order,
    actionLoading,
    onUpdate
}) => {
    const handlePaymentChange = (event) => {
        const paymentStatus = event.target.value;

        if (paymentStatus === order.paymentStatus) {
            return;
        }

        onUpdate(order._id, {
            paymentStatus
        });
    };

    const handleOrderChange = (event) => {
        const orderStatus = event.target.value;

        if (orderStatus === order.orderStatus) {
            return;
        }

        onUpdate(order._id, {
            orderStatus
        });
    };

    return (
        <div className="rounded-xl shadow-lg border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center gap-2">
                <CheckCircle2
                    size={18}
                    className="text-[#c92532]"
                />

                <h3 className="font-extrabold text-slate-900">
                    Order Actions
                </h3>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Payment Status
                    </label>

                    <div className="relative">
                        <select
                            value={
                                order.paymentStatus ||
                                "pending"
                            }
                            onChange={
                                handlePaymentChange
                            }
                            disabled={actionLoading}
                            className="w-full appearance-none rounded-xl border border-slate-200 hover:border-rose-500 transition-all cursor-pointer bg-white px-4 py-3 pr-10 text-sm font-semibold capitalize outline-none focus:border-[#c92532] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {paymentStatuses.map(
                                (status) => (
                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {status}
                                    </option>
                                )
                            )}
                        </select>

                        <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Order Status
                    </label>

                    <div className="relative">
                        <select
                            value={
                                order.orderStatus ||
                                "pending"
                            }
                            onChange={
                                handleOrderChange
                            }
                            disabled={actionLoading}
                            className="w-full appearance-none rounded-xl border border-slate-200 hover:border-rose-500 transition-all cursor-pointer bg-white px-4 py-3 pr-10 text-sm font-semibold capitalize outline-none focus:border-[#c92532] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {orderStatuses.map(
                                (status) => (
                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {status}
                                    </option>
                                )
                            )}
                        </select>

                        <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {actionLoading && (
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Loader2
                        size={14}
                        className="animate-spin"
                    />

                    Updating order...
                </div>
            )}
        </div>
    );
};

export default OrderStatusActions;