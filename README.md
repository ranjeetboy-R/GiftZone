# Gift Zone — Full-Stack E-commerce Platform

Gift Zone is a production-ready full-stack e-commerce platform built with **Next.js, JavaScript, Tailwind CSS, Express.js, MongoDB, Clerk, and Cloudinary**.

The platform provides a complete shopping experience for customers and a dedicated admin interface for managing products and store inventory.

## Tech Stack

### Frontend

* Next.js
* JavaScript
* React
* Tailwind CSS
* Lucide React
* Clerk Authentication

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Clerk Authentication
* Cloudinary

### Deployment

* Vercel — Frontend
* Render — Backend
* MongoDB Atlas — Database
* Cloudinary — Image and payment-proof storage

---

## Features

### Customer Features

* Responsive homepage
* Product browsing
* Product search
* Category filtering
* Product sorting
* Pagination
* Product details
* Product image gallery
* Related products
* New arrivals
* Featured products
* Deals
* Wishlist
* Shopping cart
* Coupon support
* Checkout
* Delivery address management
* QR-based payment
* UTR submission
* Payment screenshot upload
* Order placement
* Order history
* Order tracking
* Customer account
* Reviews
* FAQ
* Contact page
* Shipping information
* Returns & replacement policy
* Privacy policy
* Terms & conditions

### Admin Features

* Secure admin authentication
* Product management
* Add products
* Update products
* Delete products
* Product image upload
* Cloudinary image management
* Product category management
* Featured product management
* New-arrival management
* Inventory/product status management

---

## Dynamic Product & Category System

Products are stored in **MongoDB** and accessed through the Express API.

The storefront does not depend on static product JSON files.

Product information such as:

* Product name
* Description
* Price
* Compare-at price
* Images
* Category
* Rating
* Reviews
* Featured status
* New-arrival status
* Active status

is retrieved from the backend.

Categories are generated dynamically from active products in MongoDB.

When an admin adds a product with a new category, that category can automatically appear on the storefront without manually editing frontend JSON data.

---

## Project Structure

```text
GiftZone/
│
├── client/
│   ├── app/
│   │   ├── account/
│   │   ├── about/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── checkout/
│   │   ├── contact/
│   │   ├── deals/
│   │   ├── faq/
│   │   ├── orders/
│   │   ├── privacy/
│   │   ├── returns/
│   │   ├── shop/
│   │   ├── shipping/
│   │   ├── terms/
│   │   ├── admin/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   └── ...
│   │
│   ├── public/
│   │   └── images/
│   │
│   ├── package.json
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## API

The frontend communicates with the Express backend through REST APIs.

### Products

```text
GET    /api/products
GET    /api/products/:slug
GET    /api/products/categories
GET    /api/products/related/:category

POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

### Product Listing

The product API supports:

* Pagination
* Category filtering
* Search
* Featured products
* New arrivals
* Deals
* Sorting

Example:

```text
/api/products?page=1&limit=24
```

Category filtering:

```text
/api/products?category=fashion-accessories
```

Featured products:

```text
/api/products?best=true&limit=4
```

New arrivals:

```text
/api/products?new=true&limit=4
```

---

## Environment Variables

### Client

Create a `.env.local` file inside the `client` directory.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

For production, use the deployed backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Server

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_atlas_connection_string

CLERK_SECRET_KEY=your_clerk_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:3000
```

Use the production frontend URL for deployment:

```env
CLIENT_URL=https://your-frontend.vercel.app
```

Never commit `.env` or `.env.local` files to Git.

### Clerk Production Setup

Create one Clerk application for Gift Zone and use its **Production** instance
for the deployed app. Add these values to the deployed services:

* Vercel client: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
* Render server: `CLERK_SECRET_KEY`

In the Clerk Dashboard, configure the production instance with:

* The Vercel URL as an allowed origin and redirect URL.
* The deployed frontend URL as the sign-in and sign-up redirect URL.
* The deployed API URL as an allowed origin when Clerk requests are made across
  the frontend and API domains.

Keep `CLERK_SECRET_KEY` only on the server. Never add it to the client
`.env.local`, Vercel environment variables, browser code, or Git.

The client sends Clerk session tokens as `Authorization: Bearer <token>` for
protected order and checkout requests. The Express server verifies those
tokens through `@clerk/express`.

---

## Local Development

### 1. Clone the repository

```bash
git clone <repository-url>

cd GiftZone
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

The frontend will run on the configured Next.js development port.

### 4. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

### 5. Start the backend

```bash
npm run dev
```

The Express API will run on the configured backend port.

---

## Database

Gift Zone uses **MongoDB Atlas** for persistent application data.

The database stores production data including:

* Products
* Orders
* Customers
* Reviews
* Coupons
* Payment information
* Payment proof references

MongoDB connection credentials must be provided through environment variables.

---

## Authentication

Customer authentication is handled through **Clerk**.

Supported authentication can include:

* Email authentication
* Google authentication

Admin access is protected separately and should only be available to authorized administrators.

Authentication secrets must never be exposed in client-side code or committed to the repository.

---

## Cloudinary

Cloudinary is used for storing application media such as:

* Product images
* Payment screenshots
* Other uploaded assets

Only Cloudinary configuration values should be stored in environment variables.

---

## Payment Flow

Gift Zone uses a manual payment workflow rather than an online payment gateway.

The checkout flow is:

```text
Cart
  ↓
Checkout
  ↓
Delivery Address
  ↓
Payment Details
  ↓
QR / Bank Payment
  ↓
UTR Submission
  ↓
Payment Screenshot Upload
  ↓
Order Submission
  ↓
Order Tracking
```

Before accepting real customer payments, production payment information must be configured securely.

---

## Production Deployment

### Frontend — Vercel

Deploy the `client` directory to Vercel.

Configure the required environment variables in the Vercel project settings.

### Backend — Render

Deploy the `server` directory as a Node.js web service on Render.

Configure:

* MongoDB Atlas connection
* Clerk secret
* Cloudinary credentials
* Frontend URL
* Production environment variables

### Database — MongoDB Atlas

Create a production MongoDB cluster and configure the connection string in the backend environment.

### Media — Cloudinary

Configure the Cloudinary production account and required credentials in the backend environment.

---

## Security

Production deployment should follow these practices:

* Never commit secrets
* Keep environment variables server-side where required
* Protect admin routes
* Validate API input
* Validate uploaded files
* Restrict CORS to trusted frontend origins
* Validate product IDs and slugs
* Use secure authentication
* Keep MongoDB credentials private
* Do not expose Cloudinary API secrets
* Do not store sensitive payment credentials in frontend source code

---

## Production Architecture

```text
                   ┌─────────────────────┐
                   │       Customer      │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │   Next.js Frontend  │
                   │       Vercel        │
                   └──────────┬──────────┘
                              │
                              │ REST API
                              ▼
                   ┌─────────────────────┐
                   │   Express Backend   │
                   │       Render        │
                   └──────┬──────┬───────┘
                          │      │
              ┌───────────┘      └────────────┐
              ▼                               ▼
    ┌──────────────────┐             ┌──────────────────┐
    │   MongoDB Atlas  │             │    Cloudinary     │
    │ Product / Orders │             │ Images / Uploads  │
    └──────────────────┘             └──────────────────┘

                         ┌──────────────────┐
                         │      Clerk       │
                         │  Authentication  │
                         └──────────────────┘
```

---

## License

This project is intended for production e-commerce use and private deployment.

Add an appropriate license if the repository is intended to be publicly distributed.

```
```
