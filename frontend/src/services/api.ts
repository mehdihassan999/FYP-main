const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:5000/api";

export async function registerUser(payload: any) {
  const r = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || "Register failed");
  return data;
}

export async function loginUser(payload: any) {
  const r = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || "Login failed");
  return data; // { token }
}

export async function getDashboard(token: string) {
  const r = await fetch(`${API_BASE}/dashboard`, {
    headers: {"Authorization": `Bearer ${token}`}
  });
  return await r.json();
}
