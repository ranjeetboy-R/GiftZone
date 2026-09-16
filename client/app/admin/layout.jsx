'use client';

import {
    usePathname,
    useRouter
} from 'next/navigation';

import Link from 'next/link';

import {
    LogOut,
    Menu,
    X
} from 'lucide-react';

import { apiFetch } from '@/lib/api';

import {
    useEffect,
    useState
} from 'react';

const navLinks = [
    {
        title: 'Dashboard',
        href: '/admin'
    },
    {
        title: 'orders',
        href: '/admin/orders'
    },
    {
        title: 'products',
        href: '/admin/products'
    }
];

export default function layout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    useEffect(() => {
        const checkAdminSession = async () => {
            try {
                await apiFetch(
                    '/api/admin/verify-admin'
                );
            } catch {
                router.replace('/adminLogin');
            }
        };

        checkAdminSession();
    }, [router]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const logout = async () => {
        const data = await apiFetch(
            '/api/admin/logout'
        );

        if (data?.success) {
            window.location.reload();
        }
    };

    return (
        <main className="min-h-screen bg-slate-100">
            <div className="flex min-h-screen">

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center justify-between fixed top-0 z-10 px-5 h-15 bg-white w-full shadow">
                    <p className='font-bold text-slate-600 capitalize'>{pathname?.split('/admin/')?.[1] || 'Dashboard'}</p>

                    <button
                        type="button"
                        onClick={() =>
                            setMobileMenuOpen(
                                !mobileMenuOpen
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 shadow-lg md:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X size={18} />
                        ) : (
                            <Menu size={18} />
                        )}
                    </button>
                </div>

                {/* Mobile Overlay */}

                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 md:hidden"
                        onClick={() =>
                            setMobileMenuOpen(false)
                        }
                    />
                )}

                {/* Mobile Sidebar */}

                <aside className={`fixed bottom-0 left-0 top-0 z-40 w-64 bg-[#0d1a2a] p-5 text-white shadow-2xl transition-transform duration-300 md:hidden ${mobileMenuOpen
                        ? 'translate-x-0'
                        : '-translate-x-full'
                    }`}
                >
                    <div className="text-2xl font-extrabold">
                        🎁 Gift Zone
                    </div>

                    <p className="mt-10 text-xs text-slate-400">
                        Admin Console
                    </p>

                    <div className="mt-10 flex flex-col gap-3">
                        {navLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() =>
                                    setMobileMenuOpen(
                                        false
                                    )
                                }
                                className={`font-semibold border-l-3 hover:bg-slate-800 px-3 py-2 rounded-r-lg ${pathname ===
                                        item.href
                                        ? 'text-white border-amber-500'
                                        : 'text-slate-300 border-transparent'
                                    }`}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-lg bg-slate-800 p-3 text-sm transition-all hover:scale-105"
                    >
                        <LogOut size={15} />

                        Logout
                    </button>
                </aside>

                {/* Desktop Sidebar */}

                <aside className="hidden relative w-64 shrink-0 bg-[#0d1a2a] p-5 text-white md:block">
                    <div className="text-2xl font-extrabold">
                        🎁 Gift Zone
                    </div>

                    <p className="mt-10 text-xs text-slate-400">
                        Admin Console
                    </p>

                    <div className="mt-10 flex flex-col gap-3">
                        {
                            navLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`font-semibold border-l-3 hover:bg-slate-800 px-3 py-2 rounded-r-lg ${pathname ===
                                            item.href
                                            ? 'text-white border-amber-500'
                                            : 'text-slate-300 border-transparent'
                                        }`}
                                >
                                    {item.title}
                                </Link>
                            ))
                        }
                    </div>

                    <button
                        onClick={logout}
                        className="absolute bottom-5 left-5 right-5 flex items-center gap-2 justify-center p-3 text-sm rounded-lg bg-slate-800 hover:scale-105 transition-all"
                    >
                        <LogOut size={15} />

                        Logout
                    </button>
                </aside>

                <div className="flex-1 h-screen overflow-y-auto pt-18 md:pt-5 p-3 md:p-5">
                    {children}
                </div>
            </div>
        </main>
    );
}