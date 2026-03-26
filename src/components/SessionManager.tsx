"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export default function SessionManager() {
    const router = useRouter();
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        function isLoggedIn() {
            return typeof window !== "undefined" && sessionStorage.getItem("rhovic-admin-session") === "1";
        }

        function clearSession() {
            if (typeof window !== "undefined") {
                sessionStorage.removeItem("rhovic-admin-session");
            }
        }

        async function expireSession() {
            try {
                await api.post("/auth/logout", {});
            } catch {}
            clearSession();
            router.push("/login");
        }

        function resetTimer() {
            if (!isLoggedIn()) return;
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(() => {
                void expireSession();
            }, IDLE_TIMEOUT_MS);
        }

        function handleForcedLogout() {
            clearSession();
            router.push("/login");
        }

        const events: Array<keyof WindowEventMap> = [
            "click",
            "keydown",
            "mousemove",
            "scroll",
            "touchstart",
        ];

        if (isLoggedIn()) {
            resetTimer();
            for (const event of events) {
                window.addEventListener(event, resetTimer, { passive: true });
            }
        }

        window.addEventListener("rhovic-admin-logout", handleForcedLogout);

        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            for (const event of events) {
                window.removeEventListener(event, resetTimer);
            }
            window.removeEventListener("rhovic-admin-logout", handleForcedLogout);
        };
    }, [router]);

    return null;
}
