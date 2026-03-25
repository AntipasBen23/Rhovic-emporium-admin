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
    today_page_views: number;
    today_unique_visitors: number;
    recent_security_events: number;
    recent_login_failures: number;
    recent_lockouts: number;
    daily_visits: Array<{
        day: string;
        page_views: number;
        unique_visitors: number;
    }>;
    top_locations: Array<{
        country: string;
        region: string;
        state: string;
        page_views: number;
    }>;
    recent_security: Array<{
        event_type: string;
        principal: string;
        ip_address: string;
        created_at: string;
    }>;
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
                <MetricCard title="Today's Page Views" value={metrics.today_page_views} label="views" />
                <MetricCard title="Today's Unique Visitors" value={metrics.today_unique_visitors} label="visitors" />
                <MetricCard title="Security Events (24h)" value={metrics.recent_security_events} label="events" />
                <MetricCard title="Failed Logins (24h)" value={metrics.recent_login_failures} label="attempts" />
                <MetricCard title="Login Lockouts (24h)" value={metrics.recent_lockouts} label="alerts" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-black/5 shadow-premium">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-black font-heading text-gray-950">Daily Visitor Trend</h2>
                            <p className="text-sm text-gray-500 font-medium">Page views and unique visitors for the last 7 days.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {metrics.daily_visits?.length ? metrics.daily_visits.map((item) => {
                            const maxViews = Math.max(...metrics.daily_visits.map((entry) => entry.page_views), 1);
                            const width = `${Math.max((item.page_views / maxViews) * 100, item.page_views > 0 ? 8 : 0)}%`;
                            return (
                                <div key={item.day} className="space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="text-sm font-bold text-gray-700">{item.day}</div>
                                        <div className="text-sm text-gray-500 font-semibold">
                                            {item.page_views} views • {item.unique_visitors} visitors
                                        </div>
                                    </div>
                                    <div className="h-3 rounded-full bg-black/5 overflow-hidden">
                                        <div className="h-full rounded-full bg-emerald-600" style={{ width }} />
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-gray-500 font-medium">No visit records yet.</p>
                        )}
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-black/5 shadow-premium">
                    <div className="mb-5">
                        <h2 className="text-lg font-black font-heading text-gray-950">Visitor Location Breakdown</h2>
                        <p className="text-sm text-gray-500 font-medium">Top countries, regions, and states generating visits today.</p>
                    </div>
                    <div className="space-y-3">
                        {metrics.top_locations?.length ? metrics.top_locations.map((item, index) => (
                            <div key={`${item.country}-${item.region}-${item.state}-${index}`} className="rounded-xl border border-black/5 bg-black/[0.03] px-4 py-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="font-bold text-gray-950">{item.country}</div>
                                        <div className="text-sm text-gray-500 font-medium">{item.region} • {item.state}</div>
                                    </div>
                                    <div className="text-sm font-black text-emerald-700">{item.page_views} views</div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 font-medium">No geo visit data yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-black/5 p-6 border border-black/10">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-950 mb-4">System Alerts</h2>
                {metrics.pending_vendors > 0 || metrics.failed_payments > 0 || metrics.recent_lockouts > 0 || metrics.recent_login_failures > 0 ? (
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
                        {metrics.recent_login_failures > 0 && (
                            <li className="flex items-center gap-3 text-sm font-medium text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <span className="flex h-2 w-2 rounded-full bg-orange-500" />
                                {metrics.recent_login_failures} failed login attempts recorded in the last 24 hours.
                            </li>
                        )}
                        {metrics.recent_lockouts > 0 && (
                            <li className="flex items-center gap-3 text-sm font-medium text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                {metrics.recent_lockouts} temporary login lockouts were triggered in the last 24 hours.
                            </li>
                        )}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 font-medium">No critical alerts at this time. All systems green.</p>
                )}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-black/5 shadow-premium">
                <div className="mb-5">
                    <h2 className="text-lg font-black font-heading text-gray-950">Recent Security Activity</h2>
                    <p className="text-sm text-gray-500 font-medium">Newest security events captured by the auth protection layer.</p>
                </div>
                <div className="space-y-3">
                    {metrics.recent_security?.length ? metrics.recent_security.map((item, index) => (
                        <div key={`${item.event_type}-${item.created_at}-${index}`} className="rounded-xl border border-black/5 bg-black/[0.03] px-4 py-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="font-bold text-gray-950">{item.event_type}</div>
                                    <div className="text-sm text-gray-500 font-medium">{item.principal} • {item.ip_address}</div>
                                </div>
                                <div className="text-sm font-semibold text-gray-500">
                                    {new Date(item.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500 font-medium">No recent security events recorded.</p>
                    )}
                </div>
            </div>
        </>
    );
}
