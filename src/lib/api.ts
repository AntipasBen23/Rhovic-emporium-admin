export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const api = {
    get: async (endpoint: string, token?: string) => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${endpoint}`, { headers, credentials: "include" });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "An error occurred");
        }
        return res.json();
    },

    post: async (endpoint: string, body: any, token?: string) => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
            credentials: "include"
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "An error occurred");
        }
        return res.json();
    },

    patch: async (endpoint: string, body: any, token?: string) => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(body),
            credentials: "include"
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "An error occurred");
        }
        return res.json();
    },

    delete: async (endpoint: string, token?: string) => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: "DELETE",
            headers,
            credentials: "include"
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "An error occurred");
        }
        return res.status === 204 ? null : res.json();
    }
};
