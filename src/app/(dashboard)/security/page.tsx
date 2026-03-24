"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type SecurityEvent = {
  id: string;
  event_type: string;
  principal_key: string;
  email: string;
  user_id: string;
  ip_address: string;
  path: string;
  details_json: string;
  created_at: string;
};

const PAGE_SIZE = 25;

export default function SecurityPage() {
  const [items, setItems] = useState<SecurityEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [eventType, setEventType] = useState("");
  const [page, setPage] = useState(1);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const query = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String((page - 1) * PAGE_SIZE),
        });
        if (search) query.set("search", search);
        if (eventType) query.set("event_type", eventType);
        const data = await api.get(`/admin/security-events?${query.toString()}`);
        setItems(data.items || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        setError(err.message || "Failed to load security events");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [page, search, eventType]);

  if (loading) return <div className="animate-pulse bg-gray-200 h-96 w-full flex rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-heading text-gray-950">Security Events</h1>
        <p className="text-gray-500 mt-1 font-medium">Review login abuse, rate-limit hits, CAPTCHA failures, and temporary lockouts.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <div className="glass-panel rounded-2xl border border-black/5 shadow-premium p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.9fr] gap-3">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by email, principal key, or IP"
            className="rounded-xl border border-black/10 px-4 py-3 text-sm font-medium text-gray-800 focus:border-green-700 focus:outline-none"
          />
          <select
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-black/10 px-4 py-3 text-sm font-medium text-gray-800 focus:border-green-700 focus:outline-none"
          >
            <option value="">All event types</option>
            <option value="login_failed">login_failed</option>
            <option value="login_locked">login_locked</option>
            <option value="login_blocked">login_blocked</option>
            <option value="login_captcha_failed">login_captcha_failed</option>
            <option value="register_captcha_failed">register_captcha_failed</option>
            <option value="forgot_password_captcha_failed">forgot_password_captcha_failed</option>
            <option value="login_rate_limited">login_rate_limited</option>
            <option value="register_rate_limited">register_rate_limited</option>
            <option value="forgot_password_rate_limited">forgot_password_rate_limited</option>
          </select>
        </div>
        <p className="text-sm font-semibold text-gray-500">
          Showing {items.length} events on this page ({total} total)
        </p>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-xs font-black uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-6 py-4">Event</th>
              <th className="px-6 py-4">Principal</th>
              <th className="px-6 py-4">IP / Path</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-black/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-950">{item.event_type}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.user_id || "anonymous"}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800">{item.email || item.principal_key || "unknown"}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-mono text-xs text-gray-700">{item.ip_address || "-"}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.path || "-"}</div>
                </td>
                <td className="px-6 py-4">
                  <pre className="max-w-sm whitespace-pre-wrap break-words rounded-lg bg-black/[0.03] p-3 text-xs text-gray-600">{item.details_json}</pre>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm font-medium text-gray-500">
                  No security events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-black/5 bg-black/[0.03] px-6 py-4">
          <p className="text-sm font-medium text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
