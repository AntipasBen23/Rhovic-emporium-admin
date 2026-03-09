"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Metrics = {
    total_vendors: number;
    pending_vendors: number;
    total_products: number;
    published_products: number;
    total_orders: number;
    monthly_gmv: number;
    total_commission: number;
    pending_payout_amount: number;
    failed_payments: number;
};

function MetricCard({ title, value, label }: { title: string; value: string | number; label?: string }) {
    return (
        <div className="glass-panel p-6 rounded-2xl border border-black/5 shadow-premium hover-lift">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{title}</h3>
            <div className="flex items-end gap-2">
                <div className="text-4xl font-black tracking-tight font-heading text-gray-950">{value}</div>
                {label && <div className="text-sm font-bold text-gray-400 mb-1">{label}</div>}
            </div>
        </div>
    );
}

export default function OverviewPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
    };

    useEffect(() => {
        async function load() {
            try {
                const data = await api.get("/admin/metrics");
                setMetrics(data);
            } catch (err: any) {
                setError(err.message || "Failed to load metrics");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="animate-pulse flex gap-4"><div className="h-32 w-full bg-gray-200 rounded-2xl" /></div>;
    if (error) return <div className="text-red-500 font-bold p-4 bg-red-50 rounded-xl">{error}</div>;
    if (!metrics) return null;

    return (
        <>
            <div>
                <h1 className="text-3xl font-black font-heading text-gray-950">Overview Analytics</h1>
                <p className="text-gray-500 mt-1 font-medium">Real-time marketplace performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard title="Monthly GMV" value={formatCurrency(metrics.monthly_gmv)} />
                <MetricCard title="Total Platform Commission" value={formatCurrency(metrics.total_commission)} />
                <MetricCard title="Total Orders" value={metrics.total_orders} label="orders" />

                <MetricCard title="Registered Vendors" value={metrics.total_vendors} label={`(${metrics.pending_vendors} pending)`} />
                <MetricCard title="Listed Products" value={metrics.total_products} label={`(${metrics.published_products} live)`} />
                <MetricCard title="Pending Payouts" value={formatCurrency(metrics.pending_payout_amount)} />
            </div>

            <div className="rounded-2xl bg-black/5 p-6 border border-black/10">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-950 mb-4">System Alerts</h2>
                {metrics.pending_vendors > 0 || metrics.failed_payments > 0 ? (
                    <ul className="space-y-3">
                        {metrics.pending_vendors > 0 && (
                            <li className="flex items-center gap-3 text-sm font-medium text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <span className="flex h-2 w-2 rounded-full bg-yellow-500" />
                                You have {metrics.pending_vendors} vendor applications pending approval.
                            </li>
                        )}
                        {metrics.failed_payments > 0 && (
                            <li className="flex items-center gap-3 text-sm font-medium text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                Warning: {metrics.failed_payments} failed payment attempts recorded.
                            </li>
                        )}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 font-medium">No critical alerts at this time. All systems green.</p>
                )}
            </div>
        </>
    );
}
