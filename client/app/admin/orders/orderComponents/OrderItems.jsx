import { Package } from "lucide-react";

const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const OrderItems = ({ items = [] }) => {
    return (
        <div>
            <div className="mb-4 flex items-center gap-2">
                <Package
                    size={18}
                    className="text-[#c92532]"
                />

                <h3 className="font-extrabold text-slate-900">
                    Order Items
                </h3>
            </div>

            <div className="rounded-xl border border-slate-100">
                {items.map((item, index) => (
                    <div
                        key={
                            item.productId?._id ||
                            item.productId ||
                            `${item.name}-${index}`
                        }
                        className="flex gap-4 border-b border-slate-100 rounded-xl shadow-lg p-3 bg-slate-50 last:border-b-0"
                    >
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <Package
                                        size={22}
                                        className="text-slate-300"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900">
                                {item.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Quantity: {item.quantity}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {formatCurrency(item.price)} ×{" "}
                                {item.quantity}
                            </p>
                        </div>

                        <div className="shrink-0 hidden md:block text-right">
                            <p className="font-extrabold text-slate-900">
                                {formatCurrency(
                                    Number(item.price || 0) *
                                        Number(item.quantity || 0)
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderItems;