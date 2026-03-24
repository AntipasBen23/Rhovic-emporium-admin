"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type UserItem = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  deleted_at?: string | null;
  last_login_at?: string | null;
  active_sessions: number;
  vendor_id?: string | null;
  vendor_name?: string | null;
  vendor_status?: string | null;
};

const PAGE_SIZE = 20;

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  async function load() {
    try {
      setError("");
      const query = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String((page - 1) * PAGE_SIZE),
      });
      if (search) query.set("search", search);
      if (role) query.set("role", role);
      if (includeDeleted) query.set("include_deleted", "true");

      const data = await api.get(`/admin/users?${query.toString()}`);
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    void load();
  }, [page, search, role, includeDeleted]);

  async function handleLogout(userID: string) {
    try {
      setError("");
      setActionLoading(`logout:${userID}`);
      await api.post(`/admin/users/${userID}/logout`, {});
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to log out user");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(userID: string) {
    if (!window.confirm("Delete this user account? This will revoke their sessions and remove operational access.")) {
      return;
    }
    try {
      setError("");
      setActionLoading(`delete:${userID}`);
      await api.delete(`/admin/users/${userID}`);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  }

  const summaryLabel = useMemo(() => {
    if (includeDeleted) {
      return `Showing ${users.length} accounts on this page (${total} total including deleted)`;
    }
    return `Showing ${users.length} active accounts on this page (${total} total)`;
  }, [includeDeleted, total, users.length]);

  if (loading) return <div className="animate-pulse bg-gray-200 h-96 w-full flex rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-heading text-gray-950">User Directory</h1>
        <p className="text-gray-500 mt-1 font-medium">Search users, inspect account activity, force logout sessions, and review deleted accounts.</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 font-bold border border-red-200 rounded-xl">{error}</div>}

      <div className="glass-panel rounded-2xl border border-black/5 shadow-premium p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.7fr_auto] gap-3">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by email or vendor business name"
            className="rounded-xl border border-black/10 px-4 py-3 text-sm font-medium text-gray-800 focus:border-green-700 focus:outline-none"
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-black/10 px-4 py-3 text-sm font-medium text-gray-800 focus:border-green-700 focus:outline-none"
          >
            <option value="">All roles</option>
            <option value="buyer">Buyer</option>
            <option value="vendor">Vendor</option>
            <option value="super_admin">Super Admin</option>
            <option value="ops_admin">Ops Admin</option>
            <option value="finance_admin">Finance Admin</option>
          </select>
          <label className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => {
                setIncludeDeleted(e.target.checked);
                setPage(1);
              }}
            />
            Deleted accounts
          </label>
        </div>
        <p className="text-sm font-semibold text-gray-500">{summaryLabel}</p>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-xs font-black uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Vendor Details</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4">Active Sessions</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {users.map((user) => {
              const busy = actionLoading === `logout:${user.id}` || actionLoading === `delete:${user.id}`;
              const isDeleted = Boolean(user.deleted_at);
              return (
                <tr key={user.id} className="transition-colors hover:bg-black/5">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-950">{user.email}</div>
                    <div className="text-xs font-mono text-gray-400 mt-1">{user.id}</div>
                    <div className="text-xs text-gray-500 mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {user.vendor_id ? (
                      <div>
                        <div className="font-bold text-gray-900">{user.vendor_name || "Vendor account"}</div>
                        <div className="text-xs font-medium text-gray-500 mt-1">Status: {user.vendor_status || "unknown"}</div>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-400">No vendor profile</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {formatDate(user.last_login_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold ${user.active_sessions > 0 ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                      {user.active_sessions}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold ${isDeleted ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                      {isDeleted ? "Deleted" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {busy ? (
                        <span className="text-xs font-bold text-gray-500">Processing...</span>
                      ) : isDeleted ? (
                        <span className="text-xs font-bold text-gray-400">No actions</span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleLogout(user.id)}
                            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100"
                          >
                            Log out
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm font-medium text-gray-500">
                  No matching users found.
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
