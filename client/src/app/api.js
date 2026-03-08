const RAW = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = RAW.replace(/\/$/, "").replace(/\/api$/, "");

export function getToken() {
  return localStorage.getItem("hzshop_token") || "";
}

export function setToken(token) {
  if (token) localStorage.setItem("hzshop_token", token);
  else localStorage.removeItem("hzshop_token");
}

// JSON requests (normal API)
export async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const friendly =
      data?.errors?.map((e) => e.message).join(", ") ||
      data?.message ||
      "Request failed";

    throw new Error(friendly);
  }

  return data;
}

export async function uploadMultiImages(formData) {
  const t = getToken();
  const res = await fetch(`${API_URL}/api/upload/multi`, {
    method: "POST",
    headers: t ? { Authorization: `Bearer ${t}` } : undefined,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data;
}

export { API_URL };