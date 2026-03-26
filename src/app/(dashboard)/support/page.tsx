"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type SupportThreadItem = {
  id: string;
  customer_id: string;
  customer_email?: string;
  order_id?: string | null;
  subject: string;
  status: "open" | "in_progress" | "closed";
  assigned_admin_id?: string | null;
  last_message: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
};

type SupportMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  created_at: string;
};

type SupportThreadDetail = {
  thread: SupportThreadItem;
  messages: SupportMessage[];
};

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "closed") return "bg-gray-200 text-gray-700";
  if (status === "in_progress") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-800";
}

export default function SupportAdminPage() {
  const [threads, setThreads] = useState<SupportThreadItem[]>([]);
  const [selectedID, setSelectedID] = useState("");
  const [selected, setSelected] = useState<SupportThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedID) || selected?.thread || null,
    [threads, selectedID, selected]
  );

  async function loadThreads(preferredID?: string) {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (status) params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      const res = (await api.get(`/admin/support/threads?${params.toString()}`)) as { items: SupportThreadItem[] };
      const items = Array.isArray(res?.items) ? res.items : [];
      setThreads(items);
      const nextID = preferredID || (items.some((thread) => thread.id === selectedID) ? selectedID : items[0]?.id || "");
      if (nextID) {
        setSelectedID(nextID);
        await loadThread(nextID);
      } else {
        setSelected(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load support conversations.");
    } finally {
      setLoading(false);
    }
  }

  async function loadThread(threadID: string) {
    try {
      const detail = (await api.get(`/admin/support/threads/${threadID}`)) as SupportThreadDetail;
      setSelected(detail);
      setSelectedID(threadID);
    } catch (err: any) {
      setError(err.message || "Failed to load conversation.");
    }
  }

  useEffect(() => {
    void loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadThreads();
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (!selectedID) return;
    const timer = window.setInterval(() => {
      void loadThread(selectedID);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [selectedID]);

  async function sendReply() {
    if (!selectedID || !reply.trim()) return;
    try {
      setActionLoading(true);
      setError("");
      const detail = (await api.post(`/admin/support/threads/${selectedID}/messages`, { message: reply.trim() })) as SupportThreadDetail;
      setReply("");
      setSelected(detail);
      await loadThreads(selectedID);
    } catch (err: any) {
      setError(err.message || "Failed to send reply.");
    } finally {
      setActionLoading(false);
    }
  }

  async function closeThread() {
    if (!selectedID) return;
    try {
      setActionLoading(true);
      setError("");
      await api.post(`/admin/support/threads/${selectedID}/close`, {});
      await loadThreads(selectedID);
    } catch (err: any) {
      setError(err.message || "Failed to close conversation.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-heading text-gray-950">Customer Care Queue</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Review incoming complaints, reply professionally, and close conversations when the issue is resolved.
        </p>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.4fr]">
        <section className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
          <div className="border-b border-black/5 p-5">
            <div className="flex flex-col gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by subject or customer email"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-green-900/30"
              />
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "", label: "All" },
                  { value: "open", label: "Open" },
                  { value: "in_progress", label: "In progress" },
                  { value: "closed", label: "Closed" },
                ].map((option) => (
                  <button
                    key={option.value || "all"}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-wider transition ${
                      status === option.value ? "bg-green-800 text-white" : "bg-black/5 text-gray-700 hover:bg-black/10"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-600">Loading support queue...</div>
          ) : threads.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No support conversations match this filter yet.</div>
          ) : (
            <div className="divide-y divide-black/5">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => void loadThread(thread.id)}
                  className={`block w-full px-5 py-4 text-left transition ${thread.id === selectedID ? "bg-green-900/5" : "hover:bg-black/5"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-gray-900">{thread.subject}</div>
                      <div className="mt-1 truncate text-xs font-semibold text-gray-500">{thread.customer_email || "Unknown customer"}</div>
                      <div className="mt-2 line-clamp-2 text-xs text-gray-600">{thread.last_message || "No messages yet."}</div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${statusClass(thread.status)}`}>
                      {thread.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 text-[11px] font-semibold text-gray-500">Updated {formatDate(thread.last_message_at)}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
          {!selectedThread ? (
            <div className="flex min-h-[560px] items-center justify-center p-6 text-center text-sm text-gray-600">
              Select a support conversation from the queue to review it.
            </div>
          ) : (
            <div className="flex min-h-[560px] flex-col">
              <div className="border-b border-black/5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.24em] text-green-700">Support case</div>
                    <h2 className="mt-2 text-2xl font-black text-gray-950">{selectedThread.subject}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className={`rounded-full px-2.5 py-1 font-black uppercase tracking-wider ${statusClass(selectedThread.status)}`}>
                        {selectedThread.status.replace("_", " ")}
                      </span>
                      <span>{selectedThread.customer_email || "Unknown customer"}</span>
                      {selectedThread.order_id ? <span>Order: {selectedThread.order_id}</span> : null}
                      <span>Opened {formatDate(selectedThread.created_at)}</span>
                    </div>
                  </div>
                  {selectedThread.status !== "closed" ? (
                    <button
                      type="button"
                      onClick={closeThread}
                      disabled={actionLoading}
                      className="rounded-xl border border-black/10 px-4 py-2 text-sm font-bold text-gray-800 transition hover:bg-black/5 disabled:opacity-60"
                    >
                      {actionLoading ? "Working..." : "Close chat"}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {selected?.messages?.map((message) => {
                  const isAdmin = message.sender_role === "admin";
                  return (
                    <div key={message.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm ${isAdmin ? "bg-green-800 text-white" : "bg-black/5 text-gray-900"}`}>
                        <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${isAdmin ? "text-white/80" : "text-gray-500"}`}>
                          {isAdmin ? "Admin reply" : "Customer"}
                        </div>
                        <div className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.message}</div>
                        <div className={`mt-2 text-[11px] font-semibold ${isAdmin ? "text-white/75" : "text-gray-500"}`}>
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-black/5 p-6">
                {selectedThread.status === "closed" ? (
                  <div className="rounded-2xl border border-black/10 bg-black/5 p-4 text-sm text-gray-700">
                    This chat has been closed. If the customer reaches out again, they should open a new case.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={4}
                      placeholder="Reply to the customer..."
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-green-900/30"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={sendReply}
                        disabled={actionLoading || !reply.trim()}
                        className="rounded-xl bg-green-800 px-5 py-3 text-sm font-black text-white transition hover:bg-green-900 disabled:opacity-60"
                      >
                        {actionLoading ? "Sending..." : "Send reply"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
