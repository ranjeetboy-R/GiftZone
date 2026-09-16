import {
    CalendarDays,
    Copy,
    MapPin,
    Phone,
    User,
    X
} from "lucide-react";
import OrderItems from "./OrderItems";
import PaymentProof from "./PaymentProof";
import OrderStatusActions from "./OrderStatusActions";

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

const OrderDetails = ({
    order,
    actionLoading,
    onClose,
    onUpdate
}) => {
    const copyOrderId = async () => {
        try {
            await navigator.clipboard.writeText(
                order._id
            );
        } catch (error) {
            console.error(
                "Failed to copy order ID:",
                error
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 md:p-4">
            <div className="flex md:max-h-[92vh] h-screen w-full max-w-5xl flex-col overflow-hidden md:rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-slate-900">
                                Order Details
                            </h2>

                            <button
                                type="button"
                                onClick={
                                    copyOrderId
                                }
                                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                title="Copy order ID"
                            >
                                <Copy size={15} />
                            </button>
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                            #{order._id}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={actionLoading}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="overflow-y-auto scrollbar-none p-6">
                    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                        <div className="space-y-6">
                            <div className="rounded-xl border border-slate-100 shadow-lg bg-slate-50 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <User
                                        size={18}
                                        className="text-[#c92532]"
                                    />

                                    <h3 className="font-extrabold text-slate-900">
                                        Customer
                                    </h3>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Name
                                        </p>

                                        <p className="mt-1 font-bold text-slate-800 capitalize">
                                            {
                                                order
                                                    .customer
                                                    ?.name
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Email
                                        </p>

                                        <p className="mt-1 break-all font-semibold text-slate-700">
                                            {
                                                order
                                                    .customer
                                                    ?.email ||
                                                "-"
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Phone
                                        </p>

                                        <p className="mt-1 flex items-center gap-2 font-semibold text-slate-700">
                                            <Phone
                                                size={14}
                                            />

                                            {
                                                order
                                                    .customer
                                                    ?.phone
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Order Date
                                        </p>

                                        <p className="mt-1 flex items-center gap-2 font-semibold text-slate-700">
                                            <CalendarDays
                                                size={14}
                                            />

                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-100 shadow-lg bg-slate-50 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <MapPin
                                        size={18}
                                        className="text-[#c92532]"
                                    />

                                    <h3 className="font-extrabold text-slate-900">
                                        Delivery Address
                                    </h3>
                                </div>

                                <div className="rounded-xl px-4">
                                    <p className="font-bold text-slate-800 capitalize">
                                        {
                                            order
                                                .shippingAddress
                                                ?.name
                                        }
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {
                                            order
                                                .shippingAddress
                                                ?.address
                                        }
                                        <br />
                                        {
                                            order
                                                .shippingAddress
                                                ?.city
                                        }
                                        ,{" "}
                                        {
                                            order
                                                .shippingAddress
                                                ?.state
                                        }{" "}
                                        -{" "}
                                        {
                                            order
                                                .shippingAddress
                                                ?.pincode
                                        }
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-slate-600">
                                        Phone:{" "}
                                        {
                                            order
                                                .shippingAddress
                                                ?.phone
                                        }
                                    </p>
                                </div>
                            </div>

                            <OrderItems
                                items={
                                    order.items || []
                                }
                            />

                            <PaymentProof
                                order={order}
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border border-slate-100 shadow-lg bg-slate-50 p-5">
                                <h3 className="font-extrabold text-slate-900">
                                    Payment Summary
                                </h3>

                                <div className="mt-5 space-y-3 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Subtotal
                                        </span>

                                        <span className="font-bold">
                                            {formatCurrency(
                                                order.subtotal
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Shipping
                                        </span>

                                        <span className="font-bold">
                                            {order.shipping
                                                ? formatCurrency(
                                                      order.shipping
                                                  )
                                                : "Free"}
                                        </span>
                                    </div>

                                    <div className="border-t border-slate-200 pt-3">
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="font-extrabold">
                                                Total
                                            </span>

                                            <span className="text-lg font-extrabold text-[#c92532]">
                                                {formatCurrency(
                                                    order.total
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-100 shadow-lg bg-slate-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Payment Method
                                </p>

                                <p className="mt-2 font-extrabold capitalize text-slate-800">
                                    {(
                                        order.paymentMethod ||
                                        "manual_qr"
                                    ).replace(
                                        /_/g,
                                        " "
                                    )}
                                </p>

                                <div className="mt-5">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                        UTR
                                    </p>

                                    <p className="mt-2 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm font-bold text-slate-800">
                                        {order.utr ||
                                            "Not provided"}
                                    </p>
                                </div>
                            </div>

                            <OrderStatusActions
                                order={order}
                                actionLoading={
                                    actionLoading
                                }
                                onUpdate={onUpdate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;