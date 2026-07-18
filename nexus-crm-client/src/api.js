export const API = "http://localhost:5128/api";

// GET request. Returns the API's Result envelope: { isSuccess, message, data }
export async function apiGet(path) {
  try {
    const res = await fetch(`${API}${path}`);
    return await res.json();
  } catch {
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
    return await res.json();
  } catch {
    return { isSuccess: false, message: "Cannot reach the API. Is it running?", data: null };
  }
}
