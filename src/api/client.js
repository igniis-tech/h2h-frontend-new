// // Lightweight API client for H2H backend

// function getApiBase() {
//   const fromEnvJs = (typeof window !== 'undefined' && window._env_ && window._env_.BACKEND_URL) || null;
//   const fromVite = (import.meta?.env?.VITE_API_BASE) || null;
//   const base = (fromEnvJs || fromVite || "").replace(/\/$/, "");
//   if (base) return `${base}/api`;
//   // fallback to same-origin /api
//   return "/api";
// }

// export const API_BASE = getApiBase();

// function csrfFromCookie() {
//   if (typeof document === 'undefined') return null;
//   const match = document.cookie.match(/csrftoken=([^;]+)/);
//   return match ? decodeURIComponent(match[1]) : null;
// }

// async function request(path, { method = 'GET', body = null, token = null, headers = {} } = {}) {
//   let url = path.startsWith('http') ? path : `${API_BASE}${path}`;

//   const methodUpper = (method || 'GET').toUpperCase();
//   const isJson = body && typeof body === 'object' && !(body instanceof FormData);

//   // Bust caches for GETs (especially /auth/me)
//   const isGet = !body && methodUpper === 'GET';
//   if (isGet) {
//     const sep = url.includes('?') ? '&' : '?';
//     url = `${url}${sep}_=${Date.now()}`;
//   }

//   const h = {
//     'Accept': 'application/json',
//     ...(isJson ? { 'Content-Type': 'application/json' } : {}),
//     ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
//     ...headers, // user-supplied headers (e.g., { Accept: 'application/pdf' }) override defaults
//   };

//   const csrf = csrfFromCookie();
//   if (csrf && !('X-CSRFToken' in h)) h['X-CSRFToken'] = csrf;

//   const res = await fetch(url, {
//     method: methodUpper,
//     credentials: 'include',
//     headers: h,
//     body: isJson ? JSON.stringify(body) : body,
//     cache: 'no-store',
//     redirect: 'follow',
//   });

//   const ct = res.headers.get('content-type') || '';
//   if (!res.ok) {
//     const msg = await (ct.includes('application/json') ? res.json() : res.text());
//     throw new Error(typeof msg === 'string' ? msg : (msg?.error || `HTTP ${res.status}`));
//   }
//   return ct.includes('application/json') ? res.json() : res;
// }

// // -----------------------------
// // API wrappers (h2h/urls.py)
// // -----------------------------
// export const api = {
//   // Health
//   health: () => request('/health/'),

//   // Auth / SSO
//   me: () => request('/auth/me'),
//   logout: () => request('/auth/logout', { method: 'POST' }),

//   // If your backend needs redirect_uri, pass it as the 2nd arg.
//   ssoAuthorizeUrl: (state, redirectUri) => {
//     let url = `${API_BASE}/auth/sso/authorize?state=${encodeURIComponent(state || '')}`;
//     if (redirectUri) url += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
//     return url;
//   },
//   // Call this from /auth/callback route with the raw query string (e.g., location.search)
//   ssoCallback: (queryString = '') => request(`/auth/sso/callback${queryString}`),

//   // Event & inventory
//   listPackages: (params = {}) => {
//     const q = new URLSearchParams(params).toString();
//     return request(`/packages${q ? `?${q}` : ''}`);
//     // supports e.g. ?event_slug=... or ?event_year=...
//   },

//   availability: (params = {}) => {
//     const q = new URLSearchParams(params).toString();
//     return request(`/inventory/availability${q ? `?${q}` : ''}`);
//     // supports event_id, property_id, unit_type_ids|codes|names, package_id
//   },

//   // Bookings & payments
//   createBooking: (payload) => request('/bookings/create', { method: 'POST', body: payload }),

//   myBookings: () => request('/bookings/me'),

//   createOrder: (payload) => request('/payments/create-order', { method: 'POST', body: payload }),

//   validatePromocode: (params = {}) => {
//     const q = new URLSearchParams(params).toString();
//     return request(`/promocodes/validate${q ? `?${q}` : ''}`);
//   },

//   // Tickets (PDF)
//   ticketByOrderPdf: async (orderId) => {
//     const res = await request(`/tickets/order/${orderId}.pdf`, { headers: { 'Accept': 'application/pdf' } });
//     return res; // Response object for blob()
//   },

//   ticketByBookingPdf: async (bookingId) => {
//     const res = await request(`/tickets/booking/${bookingId}.pdf`, { headers: { 'Accept': 'application/pdf' } });
//     return res; // Response object for blob()
//   },
// };

// // INR formatting helper
// export function formatINR(n) {
//   try {
//     return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
//   } catch {
//     return `₹${(n || 0).toLocaleString('en-IN')}`;
//   }
// }

// // --- SSO helpers ----------------------------------------------------------
// // Start an SSO login by generating a short state, storing it in sessionStorage
// // and redirecting the browser to the backend's authorize URL. The backend
// // should redirect back to /auth/sso/callback (handled by the frontend).
// export function startSSO() {
//   const state = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
//   try {
//     sessionStorage.setItem('sso_state', state);
//     // remember where the user came from so we can redirect back after callback
//     sessionStorage.setItem('sso_return_to', window.location.pathname || '/');

//     const redirectUri = `${window.location.origin}/auth/sso/callback`;
//     // Call backend authorize endpoint which returns the provider URL, then redirect
//     return request(`/auth/sso/authorize?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`)
//       .then((data) => {
//         const url = data?.authorization_url || data?.url || api.ssoAuthorizeUrl(state, redirectUri);
//         window.location.href = url;
//       })
//       .catch(() => {
//         // fallback to redirecting to backend authorize endpoint (old behaviour)
//         window.location.href = api.ssoAuthorizeUrl(state, redirectUri);
//       });
//   } catch (e) {
//     // worst-case fallback
//     window.location.href = api.ssoAuthorizeUrl(state, `${window.location.origin}/auth/sso/callback`);
//   }
// }

// // Exchange an authorization code for a token via the backend SSO callback
// // endpoint. `opts` should be { code, state } and this returns whatever the
// // backend returns (typically an object containing user_info and tokens).
// export async function exchangeCodeForToken({ code, state }) {
//   const qs = `?code=${encodeURIComponent(code || '')}&state=${encodeURIComponent(state || '')}`;
//   return api.ssoCallback(qs);
// }
// src/api/client.js
// Robust client with loopback host normalization (localhost vs 127.0.0.1),
// no-CSRF-on-GET (prevents CORS preflight races), and SSO helpers.

//
// --- API base normalization (align loopback hostnames) ---------------------
//
function normalizeApiBase(raw) {
  try {
    const appHost = window.location.hostname; // "localhost" or "127.0.0.1"
    const base = raw || "";
    const u = new URL(base, window.location.origin); // handles bare paths/hosts

    const isLoopback = (h) =>
      h === "localhost" || h === "127.0.0.1" || h === "[::1]";

    // Align loopback host with the app host so SameSite cookies stick.
    if (isLoopback(appHost) && isLoopback(u.hostname) && u.hostname !== appHost) {
      u.hostname = appHost; // e.g. convert 127.0.0.1 -> localhost
    }

    // Ensure we end at ".../api"
    if (!u.pathname.endsWith("/api") && !u.pathname.endsWith("/api/")) {
      u.pathname = u.pathname.replace(/\/+$/, "") + "/api";
    }

    return u.href.replace(/\/+$/, "");
  } catch {
    return "/api";
  }
}

const fromEnvJs =
  typeof window !== "undefined" && window._env_ && window._env_.BACKEND_URL;
const fromVite = (import.meta?.env?.VITE_API_BASE) || "";
export const API_BASE = normalizeApiBase(fromEnvJs || fromVite || "/api");

//
// --- helpers ---------------------------------------------------------------
//
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[2]) : null;
}

function unsafeMethod(methodUpper) {
  return !["GET", "HEAD", "OPTIONS"].includes(methodUpper);
}

// Ensure csrftoken cookie exists WITHOUT adding headers (no preflight)
async function ensureCsrfCookie() {
  let token = getCookie("csrftoken");
  if (token) return token;
  try {
    await fetch(`${API_BASE}/health/?t=${Date.now()}`, { credentials: "include" });
  } catch {}
  return getCookie("csrftoken");
}

//
// --- core request ----------------------------------------------------------
//
export async function request(path, { method = "GET", body = null, token = null, headers = {} } = {}) {
  let url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const methodUpper = (method || "GET").toUpperCase();
  const isJson = body && typeof body === "object" && !(body instanceof FormData);

  // Cache-bust GETs (esp. /auth/me)
  if (!body && methodUpper === "GET") {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}_=${Date.now()}`;
  }

  // Base headers; user-supplied headers override defaults
  const h = {
    Accept: "application/json",
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  // Only attach CSRF for unsafe methods
  if (unsafeMethod(methodUpper)) {
    let csrf = getCookie("csrftoken");
    if (!csrf) csrf = await ensureCsrfCookie();
    if (csrf && !("X-CSRFToken" in h)) h["X-CSRFToken"] = csrf;
  }

  const res = await fetch(url, {
    method: methodUpper,
    credentials: "include",
    headers: h,
    body: isJson ? JSON.stringify(body) : body,
    cache: "no-store",
    redirect: "follow",
  });

  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const msg = await (ct.includes("application/json") ? res.json() : res.text());
    throw new Error(typeof msg === "string" ? msg : (msg?.error || `HTTP ${res.status}`));
  }
  return ct.includes("application/json") ? res.json() : res;
}

//
// --- API wrappers (match backend urls.py) ----------------------------------
//
export const api = {
  // Health
  health: () => request("/health/"),

  // Auth / SSO
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),

  ssoAuthorizeUrl: (state, redirectUri) => {
    let url = `${API_BASE}/auth/sso/authorize?state=${encodeURIComponent(state || "")}`;
    if (redirectUri) url += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    return url;
  },
  // Call from /auth/callback route with raw query string (location.search)
  ssoCallback: (queryString = "") => request(`/auth/sso/callback${queryString}`),

  // Event & inventory
  listPackages: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/packages${q ? `?${q}` : ""}`);
  },
  

  availability: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/inventory/availability${q ? `?${q}` : ""}`);
  },

  // Bookings & payments
  createBooking: (payload) => request("/bookings/create", { method: "POST", body: payload }),
  myBookings: () => request("/bookings/me"),
  createOrder: (payload) => request("/payments/create-order", { method: "POST", body: payload }),

  validatePromocode: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/promocodes/validate${q ? `?${q}` : ""}`);
  },

  // Tickets (PDF)
  ticketByOrderPdf: async (orderId) => {
    const res = await request(`/tickets/order/${orderId}.pdf`, {
      headers: { Accept: "application/pdf" }, // avoid 406
    });
    return res; // Response for blob()
  },

  ticketByBookingPdf: async (bookingId) => {
    const res = await request(`/tickets/booking/${bookingId}.pdf`, {
      headers: { Accept: "application/pdf" }, // avoid 406
    });
    return res; // Response for blob()
  },
};

//
// --- utilities exported for components ------------------------------------
//
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

//
// --- SSO helpers -----------------------------------------------------------
//
export function startSSO() {
  const state = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    sessionStorage.setItem("sso_state", state);
    sessionStorage.setItem("sso_return_to", window.location.pathname || "/");

    const redirectUri = `${window.location.origin}/auth/sso/callback`;

    // Ask backend for provider URL; fall back to hitting it directly
    return request(
      `/auth/sso/authorize?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`
    )
      .then((data) => {
        const url = data?.authorization_url || data?.url || api.ssoAuthorizeUrl(state, redirectUri);
        window.location.href = url;
      })
      .catch(() => {
        window.location.href = api.ssoAuthorizeUrl(state, redirectUri);
      });
  } catch {
    window.location.href = api.ssoAuthorizeUrl(state, `${window.location.origin}/auth/sso/callback`);
  }
}

// If you need the raw exchange directly (old-project style)
export async function exchangeCodeForToken({ code, state }) {
  const qs = `?code=${encodeURIComponent(code || "")}&state=${encodeURIComponent(state || "")}`;
  return api.ssoCallback(qs);
}
