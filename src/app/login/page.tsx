"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const GREEN = "rgb(18,77,52)";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data: any = await api.post("/auth/login", { email, password });

            // The backend returns only { access_token, refresh_token }. Decode role from the JWT.
            const payload = JSON.parse(atob(data.access_token.split(".")[1]));

            if (!["super_admin", "ops_admin", "finance_admin"].includes(payload.role)) {
                throw new Error("Unauthorized access. Admin privileges required.");
            }

            localStorage.setItem("admin_token", data.access_token);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Invalid credentials or unauthorized.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary opacity-[0.03] blur-3xl pointer-events-none" />
            <div className="absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-accent opacity-[0.05] blur-3xl pointer-events-none" />

            <div className="w-full max-w-md space-y-8 glass-panel shadow-premium rounded-[2rem] p-10 z-10 animate-fade-up">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <h1 className="font-heading text-3xl font-black tracking-tight text-gray-950">
                        Admin Portal
                    </h1>
                    <p className="text-sm font-medium text-gray-500">
                        Sign in with an authorized RHOVIC staff account.
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600 shadow-sm animate-fade-up">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                            placeholder="admin@rhovic.store"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-sm tracking-widest disabled:opacity-50"
                            style={{ background: GREEN }}
                        >
                            {loading ? "Authenticating..." : "SECURE LOGIN"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
