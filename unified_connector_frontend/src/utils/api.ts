export function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const url = new URL(`${apiBase()}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `GET ${path} failed`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${path} failed`);
  }
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * Save OAuth client configuration for a connector.
 * This posts client_id/client_secret/redirect_uri to backend configure endpoints.
 */
export async function saveConnectorOAuthConfig(
  connector: 'jira' | 'confluence',
  cfg: { client_id: string; client_secret: string; redirect_uri: string }
): Promise<{ status: string }> {
  return apiPost<{ status: string }>(`/connectors/${connector}/configure`, cfg);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, { method: 'DELETE' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `DELETE ${path} failed`);
  }
  return res.json();
}
