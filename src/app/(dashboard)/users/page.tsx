"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type UserItem = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  vendor_id?: string | null;
  vendor_name?: string | null;
  vendor_status?: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    try {
      const { items } = await api.get("/admin/users?limit=200");
      setUsers(items || []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

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
    if (!window.confirm("Delete this user account? This will also revoke their sessions.")) {
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

  if (loading) return <div className="animate-pulse bg-gray-200 h-96 w-full flex rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-heading text-gray-950">User Directory</h1>
        <p className="text-gray-500 mt-1 font-medium">Manage registered users, view account details, log out sessions, and remove accounts.</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 font-bold border border-red-200 rounded-xl">{error}</div>}

      <div className="glass-panel overflow-hidden rounded-2xl border border-black/5 shadow-premium">
        <div className="px-6 py-4 border-b border-black/5 bg-black/[0.03]">
          <p className="text-sm font-bold text-gray-600">Registered users: <span className="text-gray-950">{users.length}</span></p>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-xs font-black uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Vendor Details</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {users.map((user) => {
              const busy = actionLoading === `logout:${user.id}` || actionLoading === `delete:${user.id}`;
              return (
                <tr key={user.id} className="transition-colors hover:bg-black/5">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-950">{user.email}</div>
                    <div className="text-xs font-mono text-gray-400 mt-1">{user.id}</div>
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
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {busy ? (
                        <span className="text-xs font-bold text-gray-500">Processing...</span>
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
                <td colSpan={5} className="px-6 py-8 text-center text-sm font-medium text-gray-500">
                  No registered users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
