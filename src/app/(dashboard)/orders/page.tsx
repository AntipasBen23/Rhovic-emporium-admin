"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type PendingPayment = {
  id: string;
  order_number: string;
  payment_reference: string;
  total_amount: number;
  currency: string;
  payment_status: string;
  customer_email: string;
  created_at: string;
};

type OrderDetails = {
  orderId: string;
  orderNumber: string;
  paymentReference: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  customer: {
    id: string;
    email: string;
  };
  vendors: Array<{
    vendorOrderId: string;
    vendorId: string;
    vendorName: string;
    subtotal: number;
    commissionAmount: number;
    vendorNetAmount: number;
    fulfillmentStatus: string;
    payoutStatus: string;
    items: Array<{
      productId: string;
      name: string;
      quantity: string;
      unitPrice: number;
      lineTotal: number;
    }>;
  }>;
  paymentProofs: Array<{
    id: string;
    fileUrl: string;
    reviewStatus: string;
    fileType: string;
  }>;
};

function formatMoney(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OrdersPage() {
  const [items, setItems] = useState<PendingPayment[]>([]);
  const [selected, setSelected] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("admin_token") || "";
      const res = await api.get("/admin/payments/pending?limit=100", token);
      setItems(Array.isArray(res?.items) ? res.items : []);
    } catch (err: any) {
      setError(err.message || "Failed to load pending payments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openDetails(orderID: string) {
    try {
      const token = localStorage.getItem("admin_token") || "";
      const data = await api.get(`/admin/orders/${orderID}`, token);
      setSelected(data);
    } catch (err: any) {
      setError(err.message || "Failed to load order details");
    }
  }

  async function approve(orderID: string) {
    try {
      setActionLoading(orderID + ":approve");
      const token = localStorage.getItem("admin_token") || "";
      await api.post(`/admin/orders/${orderID}/approve-payment`, {}, token);
      await load();
      if (selected?.orderId === orderID) setSelected(null);
    } catch (err: any) {
      setError(err.message || "Failed to approve payment");
    } finally {
      setActionLoading(null);
    }
  }

  async function reject(orderID: string) {
    try {
      setActionLoading(orderID + ":reject");
      const token = localStorage.getItem("admin_token") || "";
      await api.post(`/admin/orders/${orderID}/reject-payment`, { reason: "Payment proof rejected by admin" }, token);
      await load();
      if (selected?.orderId === orderID) setSelected(null);
    } catch (err: any) {
      setError(err.message || "Failed to reject payment");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-heading text-gray-950">Manual Payment Review</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">Approve or reject customer transfer proofs and unlock vendor fulfillment.</p>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

      <div className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
        {loading ? (
          <div className="p-6 text-sm text-gray-600">Loading pending payments...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No pending manual payments.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 text-xs font-black uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {items.map((order) => (
                <tr key={order.id} className="hover:bg-black/5">
                  <td className="px-6 py-4 font-bold text-gray-900">{order.order_number}</td>
                  <td className="px-6 py-4 text-gray-700">{order.customer_email || "-"}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">{order.payment_reference}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatMoney(order.total_amount, order.currency)}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800">{order.payment_status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openDetails(order.id)}
                        className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-black/5"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => reject(order.id)}
                        disabled={!!actionLoading}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => approve(order.id)}
                        disabled={!!actionLoading}
                        className="rounded-lg bg-green-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-900 disabled:opacity-60"
                      >
                        {actionLoading === order.id + ":approve" ? "Approving..." : "Approve"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-950">{selected.orderNumber}</h2>
              <p className="mt-1 text-sm text-gray-600">Ref: {selected.paymentReference}</p>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold">Close</button>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            Customer: <span className="font-bold">{selected.customer?.email || "-"}</span> · Payment status: <span className="font-bold">{selected.paymentStatus}</span> · Total: <span className="font-bold">{formatMoney(selected.totalAmount, selected.currency)}</span>
          </div>

          <div className="mt-5 space-y-3">
            {selected.vendors?.map((vendor) => (
              <div key={vendor.vendorOrderId} className="rounded-xl border border-black/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-black text-gray-900">{vendor.vendorName || vendor.vendorId}</div>
                  <div className="text-xs text-gray-600">
                    Subtotal: <span className="font-bold">{formatMoney(vendor.subtotal, selected.currency)}</span> · Commission: <span className="font-bold">{formatMoney(vendor.commissionAmount, selected.currency)}</span> · Net: <span className="font-bold">{formatMoney(vendor.vendorNetAmount, selected.currency)}</span>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {vendor.items?.map((item) => (
                    <div key={`${vendor.vendorOrderId}-${item.productId}-${item.name}`} className="flex items-center justify-between rounded-lg bg-black/5 px-3 py-2 text-xs">
                      <span className="font-semibold text-gray-700">{item.name} × {item.quantity}</span>
                      <span className="font-bold text-gray-900">{formatMoney(item.lineTotal, selected.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selected.paymentProofs?.length ? (
            <div className="mt-5">
              <div className="text-sm font-black text-gray-900">Payment proofs</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.paymentProofs.map((proof) => (
                  <a
                    key={proof.id}
                    href={`${process.env.NEXT_PUBLIC_API_URL || "https://rhovic-emporium-backend-production.up.railway.app"}${proof.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-black/10 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-black/5"
                  >
                    {proof.reviewStatus} · {proof.fileType}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

