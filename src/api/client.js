// -------------------------
// Currency util
// -------------------------
export function formatINR(n) {
  const num = Number(n ?? 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    const rounded = Math.round(num);
    return `₹${(isNaN(rounded) ? 0 : rounded).toLocaleString("en-IN")}`;
  }
}

//// src/api/client.js
// -------------------------------------------------
// Base / API origin
// -------------------------------------------------
function normalizeApiBase(raw) {
  try {
    const appHost = window.location.hostname;
    const u = new URL(raw || "", window.location.origin);
    const isLoop = (h) => ["localhost", "127.0.0.1", "::1", "[::1]"].includes(h);
    if (isLoop(appHost) && isLoop(u.hostname) && u.hostname !== appHost) {
      u.hostname = appHost; // keep loopback host consistent
    }
    if (!u.pathname.endsWith("/api") && !u.pathname.endsWith("/api/")) {
      u.pathname = u.pathname.replace(/\/+$/, "") + "/api";
    }
    return u.href.replace(/\/+$/, "");
  } catch {
    return "/api";
  }
}

const fromEnvJs = (typeof window !== "undefined" && window._env_?.BACKEND_URL) || "";
// @ts-ignore
const fromVite  = (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_BASE) || "";
export const API_BASE = normalizeApiBase(fromEnvJs || fromVite || "/api");

// -------------------------------------------------
// Small utils
// -------------------------------------------------
export function withTimeout(promise, ms = 12000) {
  let t;
  return Promise.race([
    promise.finally(() => clearTimeout(t)),
    new Promise((_, rej) => (t = setTimeout(() => rej(new Error("Request timeout")), ms))),
  ]);
}

// -------------------------------------------------
// Tokens (stateless; memory + storage)
// -------------------------------------------------
let accessToken  = null; // Cognito access token
let idToken      = null; // Cognito ID token
let refreshToken = null; // Cognito refresh token

(function bootstrapTokens() {
  try {
    accessToken  = sessionStorage.getItem("jwt")     || localStorage.getItem("jwt")     || null;
    idToken      = sessionStorage.getItem("id_jwt")  || localStorage.getItem("id_jwt")  || null;
    refreshToken = sessionStorage.getItem("refresh_token") || localStorage.getItem("refresh_token") || null;
  } catch {}
})();

function emitAuthUpdated() {
  try { window.dispatchEvent(new Event("auth:updated")); } catch {}
}

function persistTokens({ access, id, refresh } = {}) {
  if (access !== undefined) accessToken  = access;
  if (id     !== undefined) idToken      = id;
  if (refresh!== undefined) refreshToken = refresh;

  const write = (k, v) => {
    try {
      if (v === undefined) return;
      if (v === null) {
        sessionStorage.removeItem(k); localStorage.removeItem(k);
      } else {
        sessionStorage.setItem(k, v); localStorage.setItem(k, v);
      }
    } catch {}
  };
  write("jwt", accessToken);
  write("id_jwt", idToken);
  write("refresh_token", refreshToken);

  emitAuthUpdated();
}

export function setAuthTokens({ access, id, refresh } = {}) { persistTokens({ access, id, refresh }); }
export function getAccessToken() { return accessToken; }
export function getIdToken()     { return idToken; }

// Prefer ID token for all endpoints unless you specifically need access_token scopes
function chooseTokenFor(/* url */) {
  return getIdToken() || getAccessToken();
}

// -------------------------
// Profile helpers (no network)
// -------------------------
export function readStoredProfile() {
  try {
    const s = sessionStorage.getItem("user_info");
    if (s) return JSON.parse(s);
    const l = localStorage.getItem("user_info");
    if (l) return JSON.parse(l);
  } catch {}
  return null;
}

function syncTokensFromStorage() {
  try {
    accessToken  = sessionStorage.getItem("jwt")     || localStorage.getItem("jwt")     || accessToken || null;
    idToken      = sessionStorage.getItem("id_jwt")  || localStorage.getItem("id_jwt")  || idToken || null;
    refreshToken = sessionStorage.getItem("refresh_token") || localStorage.getItem("refresh_token") || refreshToken || null;
  } catch {}
}

// (optional) refresh flow (only if backend supports it)
let refreshInFlight = null;
async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    if (!refreshToken) throw new Error("no refresh token");
    const endpoints = [`${API_BASE}/auth/oauth/refresh`, `${API_BASE}/auth/refresh`];
    let data = null, lastErr = null;
    for (const ep of endpoints) {
      try {
        const r = await fetch(ep, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          credentials: "omit",
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!r.ok) throw new Error(`refresh ${r.status}`);
        data = await r.json().catch(() => ({}));
        break;
      } catch (e) { lastErr = e; }
    }
    if (!data) throw lastErr || new Error("refresh failed");
    const newAccess  = data.access || data.access_token || null;
    const newId      = data.id || data.id_token || getIdToken() || null;
    const newRefresh = data.refresh || data.refresh_token || refreshToken || null;
    if (!newAccess) throw new Error("no access token returned");
    persistTokens({ access: newAccess, id: newId, refresh: newRefresh });
    return newAccess;
  })();
  try { return await refreshInFlight; } finally { refreshInFlight = null; }
}

// -------------------------------------------------
// Core request helper (token always attached; no /auth/me ever called here)
// -------------------------------------------------
export async function request(path, { method = "GET", body = null, headers = {}, accept = "application/json" } = {}) {
  let url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const m = (method || "GET").toUpperCase();
  const isJson = body && typeof body === "object" && !(body instanceof FormData);

  if (m === "GET" && !body) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}_=${Date.now()}`;
  }

  async function doFetch() {
    const token = chooseTokenFor(url);
    const h = {
      Accept: accept,
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };
    return fetch(url, {
      method: m,
      credentials: "omit",
      headers: h,
      body: isJson ? JSON.stringify(body) : body,
      cache: "no-store",
      redirect: "follow",
    });
  }

  let res = await doFetch();
  if (res.status === 401) {
    try {
      await refreshAccessToken();
      res = await doFetch();
    } catch {}
  }

  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const msg = await (ct.includes("application/json") ? res.json() : res.text());
    throw new Error(typeof msg === "string" ? msg : (msg?.error || `HTTP ${res.status}`));
  }

  if (accept === "application/pdf") return res;
  return ct.includes("application/json") ? res.json() : res;
}

// -------------------------
// PDF helpers
// -------------------------
async function fetchPdfBlob(path) {
  const url =
    (path.startsWith("http") ? path : `${API_BASE}${path}`) +
    (path.includes("?") ? "&" : "?") + `_=${Date.now()}`;

  syncTokensFromStorage();
  const bearer = getIdToken() || getAccessToken();

  const res = await fetch(url, {
    method: "GET",
    credentials: "omit",
    headers: {
      Accept: "application/pdf",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    cache: "no-store",
    redirect: "follow",
  });

  if (typeof res.blob === "function") {
    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      const msg = await (ct.includes("application/json") ? res.json() : res.text());
      throw new Error(typeof msg === "string" ? msg : (msg?.error || `HTTP ${res.status}`));
    }
    return await res.blob();
  }

  if (res instanceof Blob) return res;
  if (res && typeof res.arrayBuffer === "function") {
    const buf = await res.arrayBuffer();
    return new Blob([buf], { type: "application/pdf" });
  }
  return new Blob([res], { type: "application/pdf" });
}

async function fetchPdfResponse(path) {
  const blob = await fetchPdfBlob(path);
  return new Response(blob, { status: 200, headers: { "Content-Type": "application/pdf" } });
}

export async function downloadPdf(path, filename = "ticket.pdf") {
  const blob = await fetchPdfBlob(path);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// -----------------------------------------------------
// API wrappers (no /auth/me network; returns stored profile)
// -----------------------------------------------------
export const api = {
  // Client-side "me" — reads from storage only
  me: async () => readStoredProfile(),

  logout: async () => {
    try { await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }); } catch {}
    setAuthTokens({ access: null, id: null, refresh: null });
    try {
      sessionStorage.removeItem("user_info"); localStorage.removeItem("user_info");
      sessionStorage.removeItem("jwt"); localStorage.removeItem("jwt");
      sessionStorage.removeItem("id_jwt"); localStorage.removeItem("id_jwt");
      sessionStorage.removeItem("refresh_token"); localStorage.removeItem("refresh_token");
    } catch {}
    emitAuthUpdated();
    return { ok: true };
  },

  ssoAuthorizeUrl: (state, redirectUri) => {
    let url = `${API_BASE}/auth/sso/authorize?state=${encodeURIComponent(state || "")}`;
    if (redirectUri) url += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    return url;
  },

  listPackages: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/packages${q ? `?${q}` : ""}`);
  },
  availability: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/inventory/availability${q ? `?${q}` : ""}`);
  },
  createBooking: (payload) => request("/bookings/create", { method: "POST", body: payload }),
  myBookings: () => request("/bookings/me"),
  createOrder: ({ package_id, booking_id, pass_platform_fee = true, assume_method, return_to } = {}) =>
    request("/payments/create-order", { method: "POST", body: { package_id, booking_id, pass_platform_fee, assume_method, return_to } }),
  validatePromocode: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/promocodes/validate${q ? `?${q}` : ""}`);
  },
  getOrderStatus: (oid) => request(`/orders/status?oid=${encodeURIComponent(oid)}`),

  // PDF APIs (Response-compatible) + direct download helpers
  ticketByOrderPdf:   (orderId)   => fetchPdfResponse(`/tickets/order/${orderId}.pdf`),
  ticketByBookingPdf: (bookingId) => fetchPdfResponse(`/tickets/booking/${bookingId}.pdf`),
  downloadTicketByOrder:   (orderId)   => downloadPdf(`/tickets/order/${orderId}.pdf`,   `ticket-${orderId}.pdf`),
  downloadTicketByBooking: (bookingId) => downloadPdf(`/tickets/booking/${bookingId}.pdf`, `booking-${bookingId}.pdf`),

  post: (path, payload) => request(path, { method: "POST", body: payload }),
};

// -------------------------
// SSO helpers
// -------------------------
function frontendCallbackUri() { return `${window.location.origin}/auth/callback`; }

export function startSSO() {
  const state = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    sessionStorage.setItem("sso_state", state);
    sessionStorage.setItem("sso_return_to", window.location.pathname || "/");
  } catch {}
  const redirectUri = frontendCallbackUri();
  const url = `${API_BASE}/auth/sso/login?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location.assign(url);
}

export async function exchangeCodeForToken({ code, state }) {
  if (!code) throw new Error("missing code");
  const guardKey = `sso_redeemed_${code}`;
  if (sessionStorage.getItem(guardKey)) return null;
  sessionStorage.setItem(guardKey, "1");

  const url = new URL(`${API_BASE}/auth/sso/callback`);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", frontendCallbackUri());

  const res = await withTimeout(fetch(url.toString(), {
    method: "GET",
    credentials: "omit",
    headers: { Accept: "application/json" },
    cache: "no-store",
  }), 15000);

  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = typeof body === "string" ? body : (body?.error || `HTTP ${res.status}`);
    throw new Error(msg);
  }

  const access  = body?.tokens?.access_token  || body?.access_token  || null;
  const id      = body?.tokens?.id_token      || body?.id_token      || null;
  const refresh = body?.tokens?.refresh_token || body?.refresh_token || null;
  const profile = body?.claims || body?.user || body?.user_info || null;

  setAuthTokens({ access, id, refresh });

  if (profile) {
    const s = JSON.stringify(profile);
    try { sessionStorage.setItem("user_info", s); localStorage.setItem("user_info", s); } catch {}
  }
  emitAuthUpdated();
  return { access, id, refresh, profile };
}
