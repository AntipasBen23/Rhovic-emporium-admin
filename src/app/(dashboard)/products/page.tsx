"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Product = {
    ID: string;
    VendorID: string;
    Name: string;
    Price: number;
    Status: string;
    AdminCommissionRate: number | null;
    CreatedAt: string;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editRate, setEditRate] = useState<string>("");
    const [error, setError] = useState("");

    const load = async () => {
        try {
            const token = localStorage.getItem("admin_token");
            const { items } = await api.get("/admin/products?limit=100", token || "");
            setProducts(items || []);
        } catch (err: any) {
            setError(err.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleUpdate = async (id: string) => {
        try {
            setError("");
            const token = localStorage.getItem("admin_token");
            const rateNum = parseFloat(editRate) / 100; // convert percentage back to decimal
            if (isNaN(rateNum) || rateNum < 0 || rateNum > 1) {
                throw new Error("Invalid commission rate (must be 0-100%)");
            }

            await api.patch(`/admin/products/${id}/commission`, { rate: rateNum }, token || "");
            setEditingId(null);
            await load();
        } catch (err: any) {
            setError(err.message || "Failed to update commission");
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
                    <h1 className="text-3xl font-black font-heading text-gray-950">Products & Commissions</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage visibility and adjust platform commission rates per product.</p>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 font-bold border border-red-200 rounded-xl">{error}</div>}

            <div className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/5 text-xs font-black uppercase tracking-widest text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Product Name</th>
                            <th className="px-6 py-4">Vendor ID</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Commission %</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {products.map((p) => {
                            const currentRatePct = p.AdminCommissionRate != null ? (p.AdminCommissionRate * 100).toFixed(1) : "Default (10.0)";
                            const isEditing = editingId === p.ID;

                            return (
                                <tr key={p.ID} className="transition-colors hover:bg-black/5">
                                    <td className="px-6 py-4 font-bold text-gray-900">{p.Name}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.VendorID.substring(0, 8)}...</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(p.Price)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${p.Status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                            {p.Status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    value={editRate}
                                                    onChange={(e) => setEditRate(e.target.value)}
                                                    className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-green-800"
                                                    placeholder="%"
                                                />
                                                <span className="text-gray-500">%</span>
                                            </div>
                                        ) : (
                                            <span className="font-bold text-gray-900">{currentRatePct}{p.AdminCommissionRate != null && "%"}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingId(null)} className="text-xs font-bold text-gray-500 hover:text-gray-900">Cancel</button>
                                                <button onClick={() => handleUpdate(p.ID)} className="rounded-md bg-green-800 px-3 py-1 text-xs font-bold text-white hover:bg-green-900">Save</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingId(p.ID);
                                                    setEditRate(p.AdminCommissionRate != null ? (p.AdminCommissionRate * 100).toString() : "10");
                                                }}
                                                className="text-xs font-bold text-green-800 hover:text-green-900 underline underline-offset-2"
                                            >
                                                Edit Rate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-sm font-medium text-gray-500">
                                    No products found on the marketplace yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
