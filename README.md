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
