# Gift Zone — Full Featured E-commerce Demo

Gift Zone is a production-oriented full-stack gifting storefront built with Next.js, JavaScript, Tailwind CSS, Express, MongoDB, Clerk and Cloudinary. The frontend includes a complete demo catalog and flows that work without a database by using dummy data in `client/public/data`.

## Dummy data

All demo content lives in `client/public/data`: products, categories, site content, payment details, coupons, reviews and FAQs. Replace these files or connect the backend APIs for live data.

## Pages

- Home
- Shop / search / category / sorting / pagination
- Categories
- Deals
- Product details / gallery / reviews / related products
- Wishlist
- Cart / coupons
- Checkout / delivery address / QR / UTR / payment proof
- Order list / order tracking
- Account
- About
- Contact
- FAQ
- Shipping
- Returns & Replacement
- Privacy
- Terms
- Admin dashboard

## Run locally

### Client

```bash
cd client
npm install
npm run dev
```

### Server

```bash
cd server
npm install
npm run dev
```

The frontend can run in demo mode with public JSON data. For live mode, configure the environment variables and backend.

## Production integrations

Configure Clerk for customer authentication, MongoDB Atlas for product/order persistence, Cloudinary for product and payment-proof uploads, and the Express backend on Render. Never commit secrets. Replace demo payment information before accepting real payments.
