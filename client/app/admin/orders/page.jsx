"use client";

import { apiFetch } from "@/lib/api";
import React, { useEffect, useMemo, useState } from "react";
import OrderStats from "./orderComponents/OrderStats";
import OrderFilters from "./orderComponents/OrderFilters";
import OrdersTable from "./orderComponents/OrdersTable";
import OrderDetails from "./orderComponents/OrderDetails";
import toast from "react-hot-toast";

const page = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] =
        useState("all");
    const [orderFilter, setOrderFilter] =
        useState("all");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] =
        useState(false);
    const [showDetails, setShowDetails] =
        useState(false);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(
                "/api/orders"
            );

            setOrders(data.orders || []);
        } catch (error) {
            console.error(
                "Failed to load orders:",
                error
            );

            toast.error(
                error.message ||
                "Failed to load orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const query = search.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesSearch =
                !query ||
                order._id
                    ?.toLowerCase()
                    .includes(query) ||
                order.customer?.name
                    ?.toLowerCase()
                    .includes(query) ||
                order.customer?.email
                    ?.toLowerCase()
                    .includes(query) ||
                order.customer?.phone
                    ?.toLowerCase()
                    .includes(query) ||
                order.utr
                    ?.toLowerCase()
                    .includes(query);

            const matchesPayment =
                paymentFilter === "all" ||
                order.paymentStatus ===
                paymentFilter;

            const matchesOrder =
                orderFilter === "all" ||
                order.orderStatus === orderFilter;

            return (
                matchesSearch &&
                matchesPayment &&
                matchesOrder
            );
        });
    }, [
        orders,
        search,
        paymentFilter,
        orderFilter
    ]);

    const openDetails = (order) => {
        setSelectedOrder(order);
        setShowDetails(true);
    };

    const closeDetails = () => {
        if (actionLoading) {
            return;
        }

        setShowDetails(false);
        setSelectedOrder(null);
    };

    const updateOrder = async (orderId, updates) => {
        try {
            setActionLoading(true);
            const data = await apiFetch(
                `/api/orders/${orderId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(
                        updates
                    )
                }
            );

            setOrders((current) =>
                current.map((order) =>
                    order._id ===
                        data.order._id
                        ? data.order
                        : order
                )
            );

            setSelectedOrder(data.order);
            toast("Order updated successfully.");
        } catch (error) {
            console.error("Failed to update order:", error);

            toast.error(
                error.message ||
                "Failed to update order."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const totalRevenue = useMemo(() => {
        return orders
            .filter(
                (order) =>
                    order.paymentStatus ===
                    "verified"
            )
            .reduce(
                (total, order) =>
                    total +
                    Number(order.total || 0),
                0
            );
    }, [orders]);

    const pendingPayments = orders.filter(
        (order) =>
            order.paymentStatus === "submitted"
    ).length;

    const deliveredOrders = orders.filter(
        (order) =>
            order.orderStatus === "delivered"
    ).length;

    return (
        <section className="pb-20">
            <OrderStats
                totalOrders={orders?.length}
                pendingPayments={pendingPayments}
                totalRevenue={totalRevenue}
                deliveredOrders={deliveredOrders}
            />

            <OrderFilters
                search={search}
                setSearch={setSearch}
                paymentFilter={paymentFilter}
                setPaymentFilter={setPaymentFilter}
                orderFilter={orderFilter}
                setOrderFilter={setOrderFilter}
                onRefresh={loadOrders}
                loading={loading}
            />

            <OrdersTable
                orders={filteredOrders}
                loading={loading}
                onView={openDetails}
            />

            {showDetails &&
                selectedOrder && (
                    <OrderDetails
                        order={selectedOrder}
                        actionLoading={actionLoading}
                        onClose={closeDetails}
                        onUpdate={updateOrder}
                    />
                )}
        </section>
    );
};

export default page;