'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiFetch, apiFetchStream } from '@/lib/api';
import DashboardStats from './adminComponents/DashboardStats';
import RecentOrders from './adminComponents/RecentOrders';
import InventoryAlerts from './adminComponents/InventoryAlerts';
import QuickActions from './adminComponents/QuickActions';

export default function AdminPage() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [totalProducts, setTotalProducts] = useState(0);

    const loadDashboard = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError('');
            setProducts([]);

            const productsPromise = apiFetchStream(
                '/api/products/stream?all=true',
                {
                    onMeta: pagination => {
                        setTotalProducts(
                            Number(pagination?.total) || 0
                        );
                    },

                    onProducts: products => {
                        setProducts(currentProducts => {
                            const mergedProducts = [
                                ...currentProducts,
                                ...products
                            ];

                            return Array.from(
                                new Map(
                                    mergedProducts.map(product => [
                                        product._id,
                                        product
                                    ])
                                ).values()
                            );
                        });
                    }
                }
            );

            const ordersPromise = apiFetch(
                '/api/orders'
            );

            await Promise.all([
                productsPromise,
                ordersPromise.then(ordersData => {
                    setOrders(
                        ordersData?.orders || []
                    );
                })
            ]);
        } catch (error) {
            console.error(
                'Failed to load dashboard:',
                error
            );

            setError(
                error.message ||
                'Failed to load dashboard.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const revenue = orders
        .filter((order) => order.paymentStatus === 'verified')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const customers = new Set(
        orders
            .map((order) => order.customer?.email)
            .filter(Boolean)
    ).size;

    const pendingOrders = orders.filter(
        (order) => order.orderStatus === 'pending'
    ).length;

    const pendingPayments = orders.filter(
        (order) => order.paymentStatus === 'submitted'
    ).length;

    const lowStockProducts = products.filter(
        (product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5
    );

    const outOfStockProducts = products.filter(
        (product) => Number(product.stock || 0) <= 0
    );

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    if (loading) {
        return (
            <main className="min-h-[calc(100vh-40px)]">
                <div className="flex min-h-125 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#c92532]" />
                        <p className="mt-4 text-sm font-semibold text-slate-500">Loading dashboard...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className='w-full'>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-[#c92532]">Gift Zone Admin</p>
                            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Dashboard</h1>
                        </div>
                        <button
                            type="button"
                            onClick={() => loadDashboard(true)}
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">Overview of your store performance and activity.</p>
                </div>
            </div>

            {error && (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {error}
                </div>
            )}

            <DashboardStats
                products={totalProducts}
                orders={orders.length}
                customers={customers}
                revenue={revenue}
                pendingOrders={pendingOrders}
                pendingPayments={pendingPayments}
            />

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
                <RecentOrders orders={recentOrders} />
                <InventoryAlerts
                    lowStockProducts={lowStockProducts}
                    outOfStockProducts={outOfStockProducts}
                />
            </div>

            <QuickActions />
        </main>
    );
}
