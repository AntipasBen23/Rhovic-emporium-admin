export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession() {
    if (!refreshPromise) {
        refreshPromise = fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({}),
        })
            .then((res) => res.ok)
            .catch(() => false)
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

function clearAdminSession() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("rhovic-admin-session");
    window.dispatchEvent(new Event("rhovic-admin-logout"));
}

async function requestWithRefresh(endpoint: string, options: RequestInit = {}, retried = false) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
    });

    const canRefresh =
        !retried &&
        res.status === 401 &&
        !endpoint.startsWith("/auth/login") &&
        !endpoint.startsWith("/auth/refresh") &&
        !endpoint.startsWith("/auth/logout");

    if (canRefresh) {
        const refreshed = await refreshSession();
        if (refreshed) {
            return requestWithRefresh(endpoint, options, true);
        }
        clearAdminSession();
    }

    return res;
}

export const api = {
    get: async (endpoint: string, token?: string) => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await requestWithRefresh(endpoint, { headers });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "An error occurred");
        }
        return res.json();
    },

    post: async (endpoint: string, body: any, token?: string) => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await requestWithRefresh(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
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

        const res = await requestWithRefresh(endpoint, {
            method: "PATCH",
            headers,
            body: JSON.stringify(body),
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

        const res = await requestWithRefresh(endpoint, {
            method: "DELETE",
            headers,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "An error occurred");
        }
        return res.status === 204 ? null : res.json();
    }
};
