"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SessionManager from "@/components/SessionManager";

const NAV_ITEMS = [
    { label: "Overview", href: "/", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg> },
    { label: "Products & Commissions", href: "/products", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg> },
    { label: "Users", href: "/users", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6" /><path d="M23 11h-6" /></svg> },
    { label: "Support", href: "/support", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10h10" /><path d="M7 14h6" /><path d="M12 21a9 9 0 1 0-9-9c0 1.6.4 3.1 1.1 4.4L3 21l4.6-1.1c1.3.7 2.8 1.1 4.4 1.1Z" /></svg> },
    { label: "Security", href: "/security", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg> },
    { label: "Vendors", href: "/vendors", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { label: "Orders & Payments", href: "/orders", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h14v18H3z" /><path d="M17 7h4v14H7v-4" /><path d="M7 7h6" /><path d="M7 11h6" /></svg> },
    { label: "Payouts", href: "/payouts", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                await api.get("/admin/metrics");
                sessionStorage.setItem("rhovic-admin-session", "1");
                if (active) setLoading(false);
            } catch {
                if (active) router.push("/login");
            }
        })();
        return () => {
            active = false;
        };
    }, [router]);

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SessionManager />
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 glass-panel border-r border-black/5 flex flex-col z-20">
                <div className="p-6 border-b border-black/5">
                    <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
                        <span className="text-xl font-black tracking-tighter text-green-900 font-heading">
                            RHOVIC <span className="text-yellow-500">ADMIN</span>
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                        ? "bg-green-800 text-white shadow-md shadow-green-900/20"
                                        : "text-gray-600 hover:bg-black/5 hover:text-gray-900"
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-black/5">
                    <button
                        onClick={async () => {
                            try {
                                await api.post("/auth/logout", {});
                            } catch {}
                            sessionStorage.removeItem("rhovic-admin-session");
                            router.push("/login");
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-900/5 blur-3xl rounded-full pointer-events-none" />
                <div className="max-w-6xl mx-auto space-y-8 animate-fade-up relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
