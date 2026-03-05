"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Vendor = {
    ID: string;
    FirstName: string;
    LastName: string;
    BusinessName: string;
    Status: string;
    CreatedAt: string;
};

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    async function load() {
        try {
            const token = localStorage.getItem("admin_token");
            const { items } = await api.get("/admin/vendors?limit=100", token || "");
            setVendors(items || []);
        } catch (err: any) {
            setError(err.message || "Failed to load vendors");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleAction(id: string, action: "approve" | "reject") {
        try {
            setError("");
            setActionLoading(id + ":" + action);
            const token = localStorage.getItem("admin_token");
            await api.patch(`/admin/vendors/${id}/${action}`, {}, token || "");
            await load();
        } catch (err: any) {
            setError(err.message || `Failed to ${action} vendor`);
        } finally {
            setActionLoading(null);
        }
    }

    if (loading) return <div className="animate-pulse bg-gray-200 h-96 w-full flex rounded-2xl" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black font-heading text-gray-950">Vendors Directory</h1>
                    <p className="text-gray-500 mt-1 font-medium">View and manage all registered marketplace vendors.</p>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 font-bold border border-red-200 rounded-xl">{error}</div>}

            <div className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/5 text-xs font-black uppercase tracking-widest text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Vendor ID</th>
                            <th className="px-6 py-4">Business / Shop Name</th>
                            <th className="px-6 py-4">Owner Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Join Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {vendors.map((v) => (
                            <tr key={v.ID} className="transition-colors hover:bg-black/5">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{v.ID.substring(0, 12)}...</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{v.BusinessName}</td>
                                <td className="px-6 py-4 text-gray-700">{v.FirstName} {v.LastName}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${v.Status === "approved" ? "bg-green-100 text-green-800" :
                                            v.Status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                "bg-red-100 text-red-800"
                                        }`}>
                                        {v.Status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(v.CreatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {v.Status === "pending" ? (
                                        <div className="flex justify-end gap-2">
                                            {actionLoading === `${v.ID}:approve` || actionLoading === `${v.ID}:reject` ? (
                                                <span className="text-xs font-bold text-gray-500">Processing...</span>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(v.ID, "reject")}
                                                        className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(v.ID, "approve")}
                                                        className="text-xs font-bold text-white bg-green-800 hover:bg-green-900 px-3 py-1.5 rounded-lg"
                                                    >
                                                        Approve
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-400">No actions</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {vendors.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-sm font-medium text-gray-500">
                                    No vendors registered yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
