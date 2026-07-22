export const API = "http://localhost:5128/api";

async function parseResponse(res) {
  const text = await res.text();
  if (!text) {
    if (!res.ok) return { isSuccess: false, message: `HTTP Error ${res.status}: ${res.statusText}`, data: null };
    return { isSuccess: true, message: "", data: null };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { isSuccess: res.ok, message: text || `HTTP ${res.status}`, data: null };
  }
}

// GET request. Returns the API's Result envelope: { isSuccess, message, data }
export async function apiGet(path) {
  try {
    const res = await fetch(`${API}${path}`);
    return await parseResponse(res);
  } catch (err) {
    return { isSuccess: false, message: "Cannot reach the API. Is it running?", data: null };
  }
}

// POST / PUT / PATCH / DELETE request with optional JSON body
export async function apiSend(path, method, body) {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return await parseResponse(res);
  } catch (err) {
    return { isSuccess: false, message: "Cannot reach the API. Is it running?", data: null };
  }
}
