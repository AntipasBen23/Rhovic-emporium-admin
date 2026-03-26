"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type VisitorSession = {
  visitor_key: string;
  user_id?: string | null;
  user_email: string;
  country: string;
  region: string;
  state: string;
  city: string;
  user_agent: string;
  latest_path: string;
  referrer: string;
  first_seen: string;
  last_seen: string;
  page_views: number;
};

type VisitorHit = {
  id: string;
  path: string;
  referrer: string;
  created_at: string;
  user_agent: string;
};

type VisitorDetail = {
  session: VisitorSession;
  hits: VisitorHit[];
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function parseDevice(userAgent: string) {
  const ua = (userAgent || "").toLowerCase();
  const device = /mobile|iphone|android/.test(ua)
    ? "Mobile"
    : /ipad|tablet/.test(ua)
      ? "Tablet"
      : "Desktop";

  const browser = ua.includes("edg/")
    ? "Edge"
    : ua.includes("chrome/")
      ? "Chrome"
      : ua.includes("safari/") && !ua.includes("chrome/")
        ? "Safari"
        : ua.includes("firefox/")
          ? "Firefox"
          : "Unknown";

  const os = ua.includes("iphone") || ua.includes("ipad")
    ? "iOS"
    : ua.includes("android")
      ? "Android"
      : ua.includes("windows")
        ? "Windows"
        : ua.includes("mac os")
          ? "macOS"
          : ua.includes("linux")
            ? "Linux"
            : "Unknown";

  return { device, browser, os };
}

export default function VisitorsPage() {
  const [items, setItems] = useState<VisitorSession[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [selected, setSelected] = useState<VisitorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");

  const countries = useMemo(() => {
    const values = Array.from(new Set(items.map((item) => item.country).filter(Boolean)));
    return values.sort((a, b) => a.localeCompare(b));
  }, [items]);

  async function loadVisitors(preferredKey?: string) {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (search.trim()) params.set("search", search.trim());
      if (country) params.set("country", country);
      const res = (await api.get(`/admin/visitors?${params.toString()}`)) as { items: VisitorSession[] };
      const nextItems = Array.isArray(res?.items) ? res.items : [];
      setItems(nextItems);
      const nextKey = preferredKey || (nextItems.some((item) => item.visitor_key === selectedKey) ? selectedKey : nextItems[0]?.visitor_key || "");
      if (nextKey) {
        await loadVisitor(nextKey);
      } else {
        setSelected(null);
        setSelectedKey("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load visitor sessions.");
    } finally {
      setLoading(false);
    }
  }

  async function loadVisitor(visitorKey: string) {
    try {
      const data = (await api.get(`/admin/visitors/${visitorKey}`)) as VisitorDetail;
      setSelected(data);
      setSelectedKey(visitorKey);
    } catch (err: any) {
      setError(err.message || "Failed to load visitor session.");
    }
  }

  useEffect(() => {
    void loadVisitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadVisitors();
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, country]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-heading text-gray-950">Visitor Intelligence</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Review visitor sessions, page trails, locations, logged-in identities when available, and device/browser signals.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <section className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
          <div className="border-b border-black/5 p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_180px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email, page path, country, region..."
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-green-900/30"
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-green-900/30"
              >
                <option value="">All countries</option>
                {countries.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-600">Loading visitor sessions...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No visitor sessions match this filter yet.</div>
          ) : (
            <div className="divide-y divide-black/5">
              {items.map((item) => {
                const device = parseDevice(item.user_agent);
                return (
                  <button
                    key={item.visitor_key}
                    type="button"
                    onClick={() => void loadVisitor(item.visitor_key)}
                    className={`block w-full px-5 py-4 text-left transition ${selectedKey === item.visitor_key ? "bg-green-900/5" : "hover:bg-black/5"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-gray-900">
                          {item.user_email && item.user_email !== "Anonymous" ? item.user_email : item.visitor_key.slice(0, 12)}
                        </div>
                        <div className="mt-1 truncate text-xs font-semibold text-gray-500">
                          {item.country} • {item.region} • {item.state}
                        </div>
                        <div className="mt-2 line-clamp-1 text-xs text-gray-600">
                          Last page: {item.latest_path}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-xs font-black uppercase tracking-wider text-green-800">{item.page_views} views</div>
                        <div className="mt-1 text-[11px] font-semibold text-gray-500">{device.device} • {device.browser}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-gray-500">
                      Last seen {formatDate(item.last_seen)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
          {!selected ? (
            <div className="flex min-h-[560px] items-center justify-center p-6 text-center text-sm text-gray-600">
              Select a visitor session to see the full page trail and visitor details.
            </div>
          ) : (
            <div className="space-y-6 p-6">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-green-700">Visitor profile</div>
                <h2 className="mt-2 text-2xl font-black text-gray-950">
                  {selected.session.user_email && selected.session.user_email !== "Anonymous"
                    ? selected.session.user_email
                    : `Visitor ${selected.session.visitor_key.slice(0, 12)}`}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>{selected.session.country}</span>
                  <span>•</span>
                  <span>{selected.session.region}</span>
                  <span>•</span>
                  <span>{selected.session.state}</span>
                  <span>•</span>
                  <span>{selected.session.city}</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "First seen", value: formatDate(selected.session.first_seen) },
                  { label: "Last seen", value: formatDate(selected.session.last_seen) },
                  { label: "Total page views", value: String(selected.session.page_views) },
                  { label: "Latest page", value: selected.session.latest_path || "-" },
                  { label: "Referrer", value: selected.session.referrer || "-" },
                  {
                    label: "Device",
                    value: (() => {
                      const device = parseDevice(selected.session.user_agent);
                      return `${device.device} • ${device.browser} • ${device.os}`;
                    })(),
                  },
                ].map((row) => (
                  <div key={row.label} className="rounded-xl border border-black/10 bg-white p-4">
                    <div className="text-[11px] font-black uppercase tracking-wider text-gray-500">{row.label}</div>
                    <div className="mt-2 break-words text-sm font-semibold text-gray-900">{row.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-sm font-black text-gray-950">Page trail</div>
                <div className="mt-3 space-y-3">
                  {selected.hits.map((hit) => {
                    const device = parseDevice(hit.user_agent);
                    return (
                      <div key={hit.id} className="rounded-xl border border-black/10 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-mono text-sm font-bold text-gray-900">{hit.path}</div>
                          <div className="text-xs font-semibold text-gray-500">{formatDate(hit.created_at)}</div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>Referrer: {hit.referrer || "-"}</span>
                          <span>{device.device}</span>
                          <span>{device.browser}</span>
                          <span>{device.os}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
