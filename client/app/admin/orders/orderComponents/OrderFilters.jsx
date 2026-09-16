import {
    ChevronDown,
    Loader2,
    Search
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

const OrderFilters = ({
    search,
    setSearch,
    paymentFilter,
    setPaymentFilter,
    orderFilter,
    setOrderFilter,
    onRefresh,
    loading
}) => {
    return (
        <div className="mt-6 flex md:flex-row flex-col md:items-center md:gap-5 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 hover:border-amber-500 w-full md:w-lg bg-white px-4">
                <Search
                    size={18}
                    className="text-slate-400"
                />

                <input
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search order, customer, phone or UTR..."
                    className="w-full py-3.5 text-sm outline-none"
                />
            </div>

            <div className="grid grid-cols-2 md:gap-5 gap-3">
                <div className="relative">
                    <select
                        value={paymentFilter}
                        onChange={(event) =>
                            setPaymentFilter(
                                event.target.value
                            )
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 hover:border-amber-500 bg-white px-4 py-3.5 pr-10 text-sm font-semibold capitalize outline-none focus:border-[#c92532]"
                    >
                        <option value="all">
                            All Payments
                        </option>

                        {paymentStatuses.map((status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>
                        ))}
                    </select>

                    <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                </div>

                <div className="relative">
                    <select
                        value={orderFilter}
                        onChange={(event) =>
                            setOrderFilter(
                                event.target.value
                            )
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 hover:border-amber-500 bg-white px-4 py-3.5 pr-10 text-sm font-semibold capitalize outline-none focus:border-[#c92532]"
                    >
                        <option value="all">
                            All Order Status
                        </option>

                        {orderStatuses.map((status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>
                        ))}
                    </select>

                    <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl border w-fit border-slate-200 hover:border-amber-500 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
                <Loader2
                    size={16}
                    className={
                        loading
                            ? "animate-spin"
                            : ""
                    }
                />
                Refresh
            </button>
        </div>
    );
};

export default OrderFilters;