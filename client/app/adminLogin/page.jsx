"use client";

import { apiFetch } from "@/lib/api";
import {
    Eye,
    EyeOff,
    Loader2,
    LockKeyhole,
    Mail,
    ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const SAVED_EMAIL_KEY = "gift-zone-admin-email";

const page = () => {
    const [loginLoading, setLoginLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);

        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        const checkAdminSession = async () => {
            try {
                await apiFetch("/api/admin/verify-admin");
                router.replace("/admin");
            } catch {
                // Not logged in, stay on login page
            }
        };

        checkAdminSession();
    }, [router]);

    const login = async (event) => {
        event.preventDefault();

        try {
            setLoginLoading(true);
            setError("");

            if (rememberMe) {
                localStorage.setItem(
                    SAVED_EMAIL_KEY,
                    email.trim()
                );
            } else {
                localStorage.removeItem(SAVED_EMAIL_KEY);
            }

            const data = await apiFetch("/api/admin/login", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (data?.success) {
                router.replace("/admin");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <main className="relative flex h-screen items-center justify-center overflow-hidden bg-[#f8f9fc] px-5 py-10">
            <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-red-100/70 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-orange-100/70 blur-3xl" />

            <div className="absolute left-10 top-20 hidden h-2 w-2 rounded-full bg-[#c92532]/30 md:block" />
            <div className="absolute bottom-24 left-24 hidden h-3 w-3 rounded-full bg-orange-300/40 md:block" />
            <div className="absolute right-20 top-28 hidden h-3 w-3 rounded-full bg-[#c92532]/20 md:block" />

            <form
                onSubmit={login}
                className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_20px_70px_rgba(15,23,42,0.10)] sm:p-9"
            >
                <div className="mt-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Gift Zone
                        </h1>

                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#c92532]">
                            Admin
                        </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Sign in to securely manage your store.
                    </p>
                </div>

                {error && (
                    <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium leading-5 text-red-600">
                        {error}
                    </div>
                )}

                <div className="mt-6 grid gap-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-bold text-slate-700"
                        >
                            Admin Email
                        </label>

                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                id="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c92532] focus:bg-white focus:ring-4 focus:ring-red-50"
                                placeholder="Enter admin email"
                                type="email"
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-bold text-slate-700"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <LockKeyhole
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                id="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c92532] focus:bg-white focus:ring-4 focus:ring-red-50"
                                placeholder="Enter your password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((value) => !value)
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(event) =>
                                    setRememberMe(event.target.checked)
                                }
                                className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#c92532]"
                            />

                            <span>Remember me</span>
                        </label>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <ShieldCheck size={14} />
                            Secure login
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loginLoading}
                        className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#c92532] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-100 transition hover:bg-[#b8202c] hover:shadow-xl hover:shadow-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loginLoading && (
                            <Loader2
                                size={18}
                                className="animate-spin"
                            />
                        )}

                        {loginLoading
                            ? "Signing In..."
                            : "Sign In to Dashboard"}
                    </button>
                </div>

                <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-6">
                    <LockKeyhole
                        size={14}
                        className="text-slate-400"
                    />

                    <p className="text-xs text-slate-400">
                        Your administrator session is securely protected.
                    </p>
                </div>
            </form>
        </main>
    );
};

export default page;