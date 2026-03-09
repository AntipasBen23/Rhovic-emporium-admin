"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Payout = {
    id: string;
    vendor_id: string;
    vendor_name: string;
    order_id: string;
    vendor_order_id: string;
    gross_amount: number;
    commission_amount: number;
    net_amount: number;
    status: string;
    paid_at?: string | null;
    reference?: string;
    created_at: string;
};

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const load = async () => {
        try {
            const { items } = await api.get("/admin/vendor-payouts?limit=100");
            setPayouts(items || []);
        } catch (err: any) {
            setError(err.message || "Failed to load payouts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleMarkPaid = async (id: string) => {
        try {
            setError("");
            setActionLoading(id);
            await api.post(`/admin/vendor-payouts/${id}/mark-paid`, { reference: `PAYOUT-${Date.now()}` });
            await load(); // Reload list
        } catch (err: any) {
            setError(err.message || "Failed to mark payout as paid");
        } finally {
            setActionLoading(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
    };

    if (loading) return <div className="animate-pulse bg-gray-200 h-96 w-full flex rounded-2xl" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black font-heading text-gray-950">Payout Requests</h1>
                    <p className="text-gray-500 mt-1 font-medium">Review, approve, or reject vendor payout withdrawal requests.</p>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 font-bold border border-red-200 rounded-xl">{error}</div>}

            <div className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/5 text-xs font-black uppercase tracking-widest text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Payout ID</th>
                            <th className="px-6 py-4">Vendor</th>
                            <th className="px-6 py-4">Gross</th>
                            <th className="px-6 py-4">Commission</th>
                            <th className="px-6 py-4">Net</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Request Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {payouts.map((p) => (
                            <tr key={p.id} className="transition-colors hover:bg-black/5">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.id.substring(0, 12)}...</td>
                                <td className="px-6 py-4 text-xs text-gray-700">{p.vendor_name || p.vendor_id}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(p.gross_amount)}</td>
                                <td className="px-6 py-4 font-bold text-gray-700">{formatCurrency(p.commission_amount)}</td>
                                <td className="px-6 py-4 font-black tracking-tight text-gray-900">{formatCurrency(p.net_amount)}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${p.status === "paid" ? "bg-green-100 text-green-800" :
                                            p.status === "queued" ? "bg-yellow-100 text-yellow-800" :
                                                "bg-gray-100 text-gray-800"
                                        }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(p.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {p.status !== "paid" && (
                                        <div className="flex justify-end gap-2">
                                            {actionLoading === p.id ? (
                                                <span className="text-xs font-bold text-gray-500">Processing...</span>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleMarkPaid(p.id)} className="text-xs font-bold text-white bg-green-800 hover:bg-green-900 px-3 py-1.5 rounded-lg">Mark paid</button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {p.status === "paid" && (
                                        <span className="text-xs font-bold text-gray-400">No actions available</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {payouts.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-sm font-medium text-gray-500">
                                    No payout requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
