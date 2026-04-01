"use client";

import { useEffect, useMemo, useRef } from "react";

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: HTMLElement,
                options: {
                    sitekey: string;
                    callback?: (token: string) => void;
                    "error-callback"?: () => void;
                    "expired-callback"?: () => void;
                    theme?: "light" | "dark" | "auto";
                }
            ) => string;
            remove?: (widgetId: string) => void;
        };
    }
}

type TurnstileWidgetProps = {
    onToken: (token: string) => void;
};

export default function TurnstileWidget({ onToken }: TurnstileWidgetProps) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const enabled = useMemo(() => siteKey.trim().length > 0, [siteKey]);

    useEffect(() => {
        if (!enabled || !containerRef.current) return;

        const render = () => {
            if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                theme: "auto",
                callback: (token: string) => onToken(token),
                "error-callback": () => onToken(""),
                "expired-callback": () => onToken(""),
            });
        };

        if (window.turnstile) {
            render();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = render;
        document.body.appendChild(script);

        return () => {
            if (widgetIdRef.current && window.turnstile?.remove) {
                window.turnstile.remove(widgetIdRef.current);
            }
            widgetIdRef.current = null;
        };
    }, [enabled, onToken, siteKey]);

    if (!enabled) return null;

    return (
        <div className="space-y-2">
            <div ref={containerRef} />
            <p className="text-xs text-gray-500">
                Security check enabled to protect the admin portal.
            </p>
        </div>
    );
}
