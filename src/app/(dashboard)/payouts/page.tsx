"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Payout = {
    ID: string;
    VendorID: string;
    Amount: number; // kobo
    Status: string;
    CreatedAt: string;
};

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const load = async () => {
        try {
            const token = localStorage.getItem("admin_token");
            const { items } = await api.get("/admin/payouts?limit=100", token || "");
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

    const handleAction = async (id: string, action: "approve" | "reject") => {
        try {
            setError("");
            setActionLoading(id);
            const token = localStorage.getItem("admin_token");
            await api.patch(`/admin/payouts/${id}/${action}`, action === "reject" ? { reason: "Admin rejected" } : {}, token || "");
            await load(); // Reload list
        } catch (err: any) {
            setError(err.message || `Failed to ${action} payout`);
        } finally {
            setActionLoading(null);
        }
    };

    const formatCurrency = (kobo: number) => {
        return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(kobo / 100);
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
                            <th className="px-6 py-4">Vendor ID</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Request Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {payouts.map((p) => (
                            <tr key={p.ID} className="transition-colors hover:bg-black/5">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.ID.substring(0, 12)}...</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.VendorID.substring(0, 8)}...</td>
                                <td className="px-6 py-4 font-black tracking-tight text-gray-900">{formatCurrency(p.Amount)}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${p.Status === "approved" ? "bg-green-100 text-green-800" :
                                            p.Status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                "bg-red-100 text-red-800"
                                        }`}>
                                        {p.Status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(p.CreatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {p.Status === "pending" && (
                                        <div className="flex justify-end gap-2">
                                            {actionLoading === p.ID ? (
                                                <span className="text-xs font-bold text-gray-500">Processing...</span>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleAction(p.ID, "reject")} className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">Reject</button>
                                                    <button onClick={() => handleAction(p.ID, "approve")} className="text-xs font-bold text-white bg-green-800 hover:bg-green-900 px-3 py-1.5 rounded-lg">Approve</button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {p.Status !== "pending" && (
                                        <span className="text-xs font-bold text-gray-400">No actions available</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {payouts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-sm font-medium text-gray-500">
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
