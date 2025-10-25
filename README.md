# Highway to Heal — React + Vite + Tailwind Frontend

A bold, modern frontend wired to your Django backend endpoints.

## Endpoints integrated (from `h2h/urls.py`)

- `GET /api/health/`
- `GET /api/auth/me`
- `GET /api/packages` (optional: `?event_slug=...` or `?event_year=2025`)
- `GET /api/inventory/availability` (query: `event_id`, `property_id`, `unit_type_ids|codes|names`, `package_id`)
- `POST /api/bookings/create`
- `GET /api/bookings/me`
- `POST /api/payments/create-order` → returns `{ order, key_id, order_db, payment_link, payment_link_meta, pricing_snapshot }`
- `GET /api/promocodes/validate?code=...&amount_inr=...&booking_id=...&package_id=...`
- `GET /api/tickets/order/<order_id>.pdf`
- `GET /api/tickets/booking/<booking_id>.pdf`

## Configure

- Public env: `public/env.js`
```js
window._env_ = {
  BACKEND_URL: "http://localhost:8000", // your Django base (no trailing slash)
  ENABLE_AUTH: true
};
```
Backend must mount API at `/api/` (as in your Django `config/urls.py`).

## Run

```bash
npm i
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
