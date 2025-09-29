import { api } from "@/lib/api";
import { useState } from "react";

function newIdemKey(prefix = "CK_") {
    const u = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`)
        .replace(/-/g, "")
    return prefix + u.slice(1, 24);
}

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

function parseApiError(e: any): { error?: string} {
    try { return JSON.parse(e?.message ?? ""); } catch { return {}; }
}

export async function postWithIdempotencyApi<T>(
    path: string,
    body: unknown,
    { keyPrefix = "CK_", maxRetries = 10 }: { keyPrefix?: string; maxRetries?: number } = {}
): Promise<T> {
    const key = newIdemKey(keyPrefix);
    const stableBody = JSON.parse(JSON.stringify(body));

    for(let i = 0; i < maxRetries; i++) {
        try {
            return await api<T>(path, {
                method: "POST",
                body: JSON.stringify(stableBody),
                headers: { "Idempotency-Key": key },
            });
        } catch (e: any) {
            const data = parseApiError(e);
            if (data?.error === "idempotency_in_progress") {
                await sleep(1000);
                continue;
            }
            if (data?.error === "idempotency_key_conflict") {
                throw e;
            }
            throw e;
        }
    }
    throw new Error("too_many_retries");
}

export function useIdempotentPost<T>(path: string, keyPrefix = "CK_") {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    async function run(body: unknown): Promise<T> {
        setLoading(true);
        setError(null);
        try {
            return await postWithIdempotencyApi<T>(path, body, {keyPrefix});
        } catch (e: any) {
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }

    return { run, loading, error }
}