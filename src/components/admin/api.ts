"use client";

export class ApiClientError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** Same-origin fetch for the admin API. Adds the anti-forgery header and normalises errors. */
export async function api<T = Record<string, unknown>>(path: string, init: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  const res = await fetch(path, {
    method: init.method ?? "GET",
    credentials: "same-origin",
    headers: { "x-ahem-csrf": "1", ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}) },
    body: init.form ?? (init.body !== undefined ? JSON.stringify(init.body) : undefined),
  });
  if (res.status === 401 && !path.includes("/auth/")) {
    window.location.assign("/admin/login");
    throw new ApiClientError("Your session has expired.", 401);
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> };
  if (!res.ok) throw new ApiClientError(data.error || "The request could not be completed.", res.status, data.fields);
  return data as T;
}
