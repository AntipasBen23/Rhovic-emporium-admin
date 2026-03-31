export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

let refreshPromise: Promise<boolean> | null = null;

function getCSRFCookie() {
    if (typeof document === "undefined") return "";
    const cookie = document.cookie
        .split("; ")
        .find((part) => part.startsWith("rhovic_csrf_token="));
    return cookie ? decodeURIComponent(cookie.slice("rhovic_csrf_token=".length)) : "";
}

async function refreshSession() {
    if (!refreshPromise) {
        const csrf = getCSRFCookie();
        refreshPromise = fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(csrf ? { "X-CSRF-Token": csrf } : {}),
            },
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
    const headers = new Headers(options.headers);
    const method = (options.method || "GET").toUpperCase();
    if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
        const csrf = getCSRFCookie();
        if (csrf && !headers.has("X-CSRF-Token")) {
            headers.set("X-CSRF-Token", csrf);
        }
    }
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
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
