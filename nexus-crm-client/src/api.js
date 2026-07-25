export const API = "http://localhost:5128/api";

export function getAuthToken() {
  return localStorage.getItem("nexuscrm-token") || null;
}

export function getUserInfo() {
  const user = localStorage.getItem("nexuscrm-user");
  return user ? JSON.parse(user) : null;
}

export function setAuthSession(authData) {
  if (authData?.accessToken) {
    localStorage.setItem("nexuscrm-token", authData.accessToken);
    localStorage.setItem("nexuscrm-user", JSON.stringify({
      userId: authData.userId,
      userName: authData.userName,
      email: authData.email,
      companyId: authData.companyId,
      role: authData.role,
    }));
  }
}

export function clearAuthSession() {
  localStorage.removeItem("nexuscrm-token");
  localStorage.removeItem("nexuscrm-user");
}

function getHeaders(hasBody = false) {
  const headers = {};
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(res) {
  const text = await res.text();
  if (!text) {
    if (!res.ok) return { isSuccess: false, message: `HTTP Error ${res.status}: ${res.statusText}`, data: null };
    return { isSuccess: true, message: "", data: null };
  }
  try {
    const json = JSON.parse(text);
    if (!res.ok && json.isSuccess === undefined) {
      return { isSuccess: false, message: json.title || json.message || `HTTP ${res.status}`, data: null };
    }
    return json;
  } catch {
    return { isSuccess: res.ok, message: text || `HTTP ${res.status}`, data: null };
  }
}

// GET request
export async function apiGet(path) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: getHeaders(false),
    });
    return await parseResponse(res);
  } catch {
    return { isSuccess: false, message: "Cannot reach the API. Is it running?", data: null };
  }
}

// POST / PUT / PATCH / DELETE request with optional JSON body
export async function apiSend(path, method, body) {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: getHeaders(Boolean(body)),
      body: body ? JSON.stringify(body) : undefined,
    });
    return await parseResponse(res);
  } catch {
    return { isSuccess: false, message: "Cannot reach the API. Is it running?", data: null };
  }
}
