# hzShop — Full‑Stack E‑commerce (WhatsApp Checkout) + Admin Dashboard
This project is a production-ready **full-stack online shop** for **clothes + bags**.

Storefront (Home, Shop, Product, Cart, Checkout)
**WhatsApp checkout** (no online payments)
**Admin dashboard** (CRUD products, manage orders)
MongoDB Atlas
English + Persian (RTL) language switch
Responsive, clean UI (Tailwind)


## 1) Requirements

- Node.js **20 LTS or 22 LTS** (recommended)
- MongoDB Atlas connection string
- Cloudinary account (for product image uploads)



## 2) Run locally (step-by-step)
### A) Install dependencies
From the project root:
```bash
cd hzshop-final
npm run install:all
```

### B) Server env
Create `server/.env` from the example:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

- `MONGODB_URI` = your MongoDB Atlas URI
- `JWT_SECRET` = any long random string
- `WHATSAPP_NUMBER` = any number for now (you can change later)
- `CORS_ORIGINS` = `http://localhost:5173`
- Cloudinary (required for image uploads):
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `CLOUDINARY_FOLDER` (optional)

### C) Client env
Create `client/.env`:
```bash
cp client/.env.example client/.env
```
Make sure `client/.env` contains
VITE_API_URL=http://localhost:5000
```

### D) Seed admin + sample products
```bash
cd server
npm run seed
```
This creates an owner admin as sample:


### E) Start server
```bash
cd server
npm run dev
```

Server runs at:
- `http://localhost:5000/api/health`

### F) Start client

Open a new terminal:

```bash
cd client
npm run dev
```

Client runs at:
- `http://localhost:5173`

---

## 3) Admin Dashboard
1. Go to: `/login`
2. Login with the seeded admin account
3. Go to: `/admin`

Admin features:
- Add/Edit/Delete products
- Upload product images from your laptop (Cloudinary)
- View orders
- Update order status

### Upload images (Cloudinary)

In **Admin → Create/Edit Product**, use the **file uploader** to upload an image from your laptop.
The server uploads it to Cloudinary and returns a permanent URL, which is saved in the product `images[]` field.

---

## 4) WhatsApp Checkout (How it works)

At checkout:
1. Customer fills shipping details
2. App creates an order in MongoDB
3. App opens WhatsApp with a pre-filled message containing order details

WhatsApp number comes from `server/.env`:

```
WHATSAPP_NUMBER=+15551234567
```

---

## 5) Deploy to Render (recommended)

### Option A (simple): Deploy API + Client separately

#### 1) Deploy the backend (Web Service)

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables:
  - `NODE_ENV=production`
  - `MONGODB_URI=...`
  - `JWT_SECRET=...`
  - `WHATSAPP_NUMBER=+15551234567`
  - `CLOUDINARY_CLOUD_NAME=...`
  - `CLOUDINARY_API_KEY=...`
  - `CLOUDINARY_API_SECRET=...`
  - `CLOUDINARY_FOLDER=hzshop`
  - `CORS_ORIGINS=https://YOUR-FRONTEND-URL.onrender.com`

#### 2) Deploy the frontend (Static Site)

- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable:
  - `VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com`


### Option B (one service): Serve client from server

1) Build the client locally:

```bash
cd client
npm run build
```

2) Set `SERVE_CLIENT=true` on the backend.

> Note: on Render this is less flexible. Option A is usually easier.

---

## 6) Customize

- Change theme: `client/src/styles/index.css` and Tailwind classes
- Update translations:
  - `client/src/i18n/locales/en.json`
  - `client/src/i18n/locales/fa.json`

---

## Folder structure

```
hzshop-final/
  client/   # React + Tailwind storefront + admin UI
  server/   # Node/Express API + MongoDB
```
