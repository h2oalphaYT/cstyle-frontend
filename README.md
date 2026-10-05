# CStyle — Storefront & Admin

React + TypeScript + Vite + Tailwind storefront with an Ant Design admin panel at `/admin`.
All data (products, images, categories, cart, wishlist, orders, coupons, banners, dashboard figures) comes from the
CStyle REST API in the sibling repository `cstyle-backend`. Nothing is hard-coded.

## Run locally

Start the backend first (see `cstyle-backend/README.md`):

```bash
cd ../cstyle-backend
npm install
npm run db:local     # local MongoDB (separate terminal), or set MONGODB_URI to Atlas
npm run seed         # sample products, images, admin account, coupons
npm run dev          # http://localhost:5000
```

Then the frontend:

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

Log in with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from the backend `.env` and open **/admin**.

| Script | |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/` (uses `.env.production`) |
| `npm run preview` | Serve the built `dist/` |
| `npm run lint` | ESLint |

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend base URL including `/api`, e.g. `http://localhost:5000/api` or `https://api.example.com/api` |
| `VITE_LKR_PER_USD` | Approximate rate for the USD display toggle (orders are always charged in LKR) |
| `VITE_BANK_DETAILS` | Optional bank details shown after a bank-transfer order |

The backend's `FRONTEND_URL` must include this site's origin for CORS.

## Structure

```
src/api/            client.ts (fetch wrapper: auth header, errors, retries), index.ts (typed endpoints), types.ts
src/context/        AuthContext (JWT session), CartContext (server cart / guest cart), WishlistContext,
                    NotificationContext (toasts), ThemeContext (dark/light, LKR/USD)
src/hooks/useApi.ts loading / error / reload state for API calls
src/components/     SafeImage (lazy loading, skeleton, placeholder on failure), ProductCard, SearchBox (live suggestions),
                    StateViews (loading / error / empty), Header, Footer
src/pages/          Home, Shop, ProductDetail, Cart, Checkout, OrderSuccess, Account (profile, orders, tracking), Wishlist, Auth, Contact, About
src/admin/          AdminLayout + Dashboard, Products, Categories, Coupons & Banners, Orders, Inventory, Customers, Analytics, Settings
```

## Features

* **Catalog:** search with suggestions (name, SKU, tags, category, description), category / gender / price / size / colour filters,
  sale / new / featured filters, sorting, pagination, related products, recently viewed (account or browser).
* **Product page:** image gallery with zoom and lightbox, colour/size variants with live per-variant stock, reviews and ratings.
* **Cart & wishlist:** saved to the account when logged in, kept in the browser for guests and merged on login; stock is checked on every change.
* **Checkout:** guest or logged-in, saved address, coupon codes, server-calculated shipping and totals, cash on delivery or bank transfer.
* **Orders:** order history, order detail with progress, customer cancellation (before processing), guest order tracking.
* **Admin:** live dashboard and sales analytics, product editor (images upload / reorder / primary / remove, sizes, colours,
  variant stock matrix, sale price, SKU, tags, specifications, active/featured), categories with images, coupons, banners,
  order status workflow, inventory adjustments, customers and roles, contact messages.
* **Images:** every image goes through `SafeImage` — lazy loaded, skeleton while loading, branded placeholder if missing or broken.
  Image URLs come from the API as absolute URLs; the frontend never builds upload paths itself.

## Deployment

Build with `VITE_API_URL` pointing at the deployed backend (`.env.production` or your host's environment variables), deploy `dist/`
(Vercel, Netlify, any static host) with a SPA fallback to `index.html`, and add the site URL to the backend's `FRONTEND_URL`.

> The older notes in this folder (`IMPLEMENTATION_STATUS.md`, `QUICK_START.md`, etc.) describe the earlier mock-data version.
