// -------------------------------------------------
// Base / API origin
// -------------------------------------------------
function normalizeApiBase(raw) {
  try {
    const appHost = window.location.hostname; // "localhost" / "127.0.0.1" / "::1"
    const u = new URL(raw || "", window.location.origin);
    const isLoop = (h) => h === "localhost" || h === "127.0.0.1" || h === "[::1]";
    if (isLoop(appHost) && isLoop(u.hostname) && u.hostname !== appHost) {
      u.hostname = appHost; // keep SameSite cookies happy in dev
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
const fromVite = (import.meta?.env?.VITE_API_BASE) || "";
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

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[2]) : null;
}

// Ensure csrftoken cookie exists (your /health/ sets it via @ensure_csrf_cookie)
// IMPORTANT: no custom headers here → no CORS preflight.
export async function ensureCsrfCookie() {
  let token = getCookie("csrftoken");
  if (token) return token;
  try {
    await fetch(`${API_BASE}/health/?t=${Date.now()}`, { credentials: "include" });
  } catch {}
  return getCookie("csrftoken");
}

// Compose headers for unsafe methods (POST/PUT/DELETE)
export async function csrfHeaders(extra = {}) {
  const token = await ensureCsrfCookie();
  return {
    "Content-Type": "application/json",
    ...(token ? { "X-CSRFToken": token } : {}),
    ...extra,
  };
}

// Prime CSRF on module load (handy during dev)
try { ensureCsrfCookie(); } catch {}

export async function request(
  path,
  { method = "GET", body = null, headers = {} } = {}
) {
  let url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const methodUpper = (method || "GET").toUpperCase();
  const isGet = !body && methodUpper === "GET";
  const isJson = body && typeof body === "object" && !(body instanceof FormData);

  // Cache-bust GETs (esp. /auth/me)
  if (isGet) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}_=${Date.now()}`;
  }

  // Defaults (user-provided headers override below)
  let h = {
    Accept: "application/json",
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...headers, // <-- override defaults (e.g. Accept: 'application/pdf')
  };

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

// -----------------------------------------------------
// API wrappers — mirror your backend urls.py endpoints
// -----------------------------------------------------
export const api = {
  // Health
  health: () => request("/health/"),

  // Auth / Me
  me: () => request("/auth/me"),
  logout: async () => request("/auth/logout", {
    method: "POST",
    headers: await csrfHeaders(),
  }),

  // SSO (legacy helpers kept for completeness; not used in the flow below)
  ssoAuthorizeUrl: (state, redirectUri) => {
    let url = `${API_BASE}/auth/sso/authorize?state=${encodeURIComponent(state || "")}`;
    if (redirectUri) url += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    return url;
  },
  ssoCallback: async (queryString = "") => {
    const data = await request(`/auth/sso/callback${queryString}`);
    try {
      const access  = data?.tokens?.access_token || data?.access_token || null;
      const idToken = data?.tokens?.id_token     || data?.id_token     || null;
      const profile = data?.claims || data?.user || data?.user_info    || null;
      if (access)  { localStorage.setItem("jwt", access);      sessionStorage.setItem("jwt", access); }
      if (idToken) { localStorage.setItem("id_token", idToken); sessionStorage.setItem("id_token", idToken); }
      if (profile) { const s = JSON.stringify(profile); localStorage.setItem("user_info", s); sessionStorage.setItem("user_info", s); }
    } catch {}
    return data;
  },

  // Packages / Inventory
  listPackages: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/packages${q ? `?${q}` : ""}`);
  },
  availability: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/inventory/availability${q ? `?${q}` : ""}`);
  },

  // Bookings
  createBooking: async (payload) => request("/bookings/create", {
    method: "POST",
    headers: await csrfHeaders(),
    body: payload,
  }),
  myBookings: () => request("/bookings/me"),

  // Payments
  createOrder: async ({ package_id, booking_id, promo_code, pass_platform_fee = true, assume_method, return_to } = {}) => {
    const body = { package_id, booking_id, promo_code, pass_platform_fee, assume_method, return_to };
    return request("/payments/create-order", { method: "POST", headers: await csrfHeaders(), body });
  },

  // Promocodes
  validatePromocode: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/promocodes/validate${q ? `?${q}` : ""}`);
  },

  // Orders / Status polling
  getOrderStatus: (oid) => request(`/orders/status?oid=${encodeURIComponent(oid)}`),

  // Tickets (PDF)
  ticketUrl: (bookingId) => `${API_BASE}/tickets/booking/${encodeURIComponent(bookingId)}.pdf`,
  ticketByOrderPdf: async (orderId) =>
    request(`/tickets/order/${orderId}.pdf`, { headers: { Accept: "application/pdf" } }),
  ticketByBookingPdf: async (bookingId) =>
    request(`/tickets/booking/${bookingId}.pdf`, { headers: { Accept: "application/pdf" } }),

  // Optional: sightseeing opt-in (used by Register.jsx)
  sightseeingOptIn: async ({ booking_id, opt_in = true, guests }) => request("/sightseeing/optin", {
    method: "POST",
    headers: await csrfHeaders(),
    body: { booking_id, opt_in, guests },
  }),

  // Generic POST helper (fallback)
  post: async (path, payload) => request(path, {
    method: "POST",
    headers: await csrfHeaders(),
    body: payload,
  }),
};


function frontendCallbackUri() {
  return `${window.location.origin}/auth/callback`; // must match Cognito “Allowed callback URLs”
}

export function startSSO() {
  // avoid duplicate definitions — keep only this one
  const state = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    sessionStorage.setItem("sso_state", state);
    sessionStorage.setItem("sso_return_to", window.location.pathname || "/");
  } catch {}

  const redirectUri = frontendCallbackUri();
  // always go to backend’s login redirect endpoint; backend will 302 to Cognito
  const url =
    `${API_BASE}/auth/sso/login?` +
    `state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  window.location.assign(url); // top-level nav so cookies land correctly
}

// export async function exchangeCodeForToken({ code, state }) {
//   // the server callback now accepts redirect_uri — send the same one we used above
//   const url = new URL(`${API_BASE}/auth/sso/callback`);
//   if (code)  url.searchParams.set("code", code);
//   if (state) url.searchParams.set("state", state);
//   url.searchParams.set("redirect_uri", frontendCallbackUri());

//   const res = await withTimeout(fetch(url.toString(), {
//     method: "GET",
//     credentials: "include",
//     headers: { Accept: "application/json" },
//     cache: "no-store",
//   }), 12000);

//   const ct = res.headers.get("content-type") || "";
//   const body = ct.includes("application/json") ? await res.json() : await res.text();
//   if (!res.ok) {
//     throw new Error(typeof body === "string" ? body : (body?.error || `HTTP ${res.status}`));
//   }

//   // optional: persist tokens/profile locally, though the HttpOnly session cookie is canonical
//   try {
//     const access  = body?.tokens?.access_token || body?.access_token || null;
//     const idToken = body?.tokens?.id_token     || body?.id_token     || null;
//     const profile = body?.user || body?.claims || body?.user_info    || null;
//     if (access)  { localStorage.setItem("jwt", access);      sessionStorage.setItem("jwt", access); }
//     if (idToken) { localStorage.setItem("id_token", idToken); sessionStorage.setItem("id_token", idToken); }
//     if (profile) { const s = JSON.stringify(profile); localStorage.setItem("user_info", s); sessionStorage.setItem("user_info", s); }
//   } catch {}

//   return body;
// }

// Redeem the code exactly once (guards duplicate effect/HMR runs)
export async function exchangeCodeForToken({ code, state }) {
  if (!code) throw new Error("missing code");

  // one-time guard per code (prevents second redeem → 400)
  const guardKey = `sso_redeemed_${code}`;
  if (sessionStorage.getItem(guardKey)) return null;
  sessionStorage.setItem(guardKey, "1");

  const url = new URL(`${API_BASE}/auth/sso/callback`);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state);
  // Send the SAME redirect_uri you used in /login
  url.searchParams.set("redirect_uri", frontendCallbackUri());

  const res = await withTimeout(fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  }), 15000);

  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    // Allow you to see Cognito error text in console
    const msg = typeof body === "string" ? body : (body?.error || `HTTP ${res.status}`);
    throw new Error(msg);
  }

  // Optional: persist tokens/profile if backend returns them
  try {
    const access  = body?.tokens?.access_token || body?.access_token || null;
    const idToken = body?.tokens?.id_token     || body?.id_token     || null;
    const profile = body?.claims || body?.user || body?.user_info    || null;
    if (access)  { localStorage.setItem("jwt", access);      sessionStorage.setItem("jwt", access); }
    if (idToken) { localStorage.setItem("id_token", idToken); sessionStorage.setItem("id_token", idToken); }
    if (profile) { const s = JSON.stringify(profile); localStorage.setItem("user_info", s); sessionStorage.setItem("user_info", s); }
  } catch {}

  return body;
}



// -------------------------
// Small UI helper
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
