# 🚗 Wheelio — Full-Stack Car Rental & Fleet Management Platform

A modern, production-grade **MERN** car rental platform delivering a seamless experience for renters to discover, filter, and book vehicles, paired with an administrative fleet dashboard for vehicle inventory, dynamic pricing, Stripe payment processing, and booking lifecycle management.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://wheelio-spua.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://wheelio-backend.onrender.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments%20%26%20Webhooks-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![React](https://img.shields.io/badge/React-18%20(Vite)-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-black?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

🌐 **Live Client (Vercel):** [https://wheelio-spua.vercel.app/](https://wheelio-spua.vercel.app/)  
⚙️ **Live API (Render):** [https://wheelio-backend.onrender.com/](https://wheelio-backend.onrender.com/)

---

## 🌟 Key Engineering Features

### 👤 Customer Experience & Booking Engine
- **Dual Authentication**: Standard Email/Password registration with Bcrypt hashing alongside secure **Google OAuth 2.0 Authorization Code Flow** with automatic profile picture and onboarding sync.
- **Dynamic Vehicle Search & Filtering**: Multi-parameter search by city location, price per day, seating capacity, and transmission type.
- **Location Autocomplete**: Powered by **Geoapify Geocoding API** for exact pickup/drop-off point selection.
- **Double-Booking Prevention Algorithm**: Real-time server-side date conflict engine (`checkAvailability`) using MongoDB `$lte` and `$gte` comparison operators to mathematically prevent overlapping reservations.
- **💳 Stripe Payment Gateway & Idempotent Webhooks**:
  - **Server-Side Calculated Pricing**: Guarantees zero client-side price tampering by computing total duration rates on the backend.
  - **Cryptographically Verified Webhooks**: Listens directly for server-to-server Stripe events (`checkout.session.completed`) using raw-buffer signature verification (`stripe.webhooks.constructEvent`).
  - **Idempotency Guard**: Prevents duplicate charges or multiple booking confirmations in case of network retries.
- **⭐ Customer Reviews & Rating Engine**:
  - **Verified Renter Guard**: Restricts review submissions to customers with confirmed/paid reservations for that specific car.
  - **MongoDB Aggregation Pipeline**: Employs `$match`, `$group`, `$avg`, and `$sum` operators to compute real-time average ratings and 1-to-5 star rating distribution breakdowns in a single database pass.
  - **Interactive Feedback Modal**: Dynamic star picker and review dialog in "My Bookings", with real-time rating badges on vehicle cards and detail pages.
- **Customer Portal**: "My Bookings" interface displaying active, upcoming, and past reservations with live status badges (`Confirmed`, `Pending`, `💳 Paid`, `💵 Pay on Pickup`).
- **Theme & Responsiveness**: Mobile-first design with built-in Light/Dark mode state toggle and Framer Motion micro-interactions.

### 🛡️ Production Security & Fleet Management
- **Security Headers (`helmet`)**: Enforces secure HTTP headers, cross-origin resource policy, and clickjacking protection.
- **Brute-Force & DDoS Rate Limiting (`express-rate-limit`)**: Two-tier defense applying strict throttles on authentication routes (20 req / 15 min) and fleet endpoints (500 req / 15 min).
- **Business Analytics Dashboard**: Summary KPIs on total fleet revenue, active rentals, and vehicle utilization rates.
- **Inventory Cloud Upload**: Direct-to-cloud file streaming via **Multer memory storage** into **ImageKit CDN** with automatic WebP compression.
- **Booking Lifecycle Control**: Single-click status transitions (Pending $\rightarrow$ Confirmed $\rightarrow$ Cancelled) and automated email triggers via **Resend**.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Frontend Client (React.js + Vite)                    │
│   • React Router DOM (v7)        • Tailwind CSS & Dark Mode            │
│   • Context API State            • Geoapify Map Autocomplete           │
│   • Framer Motion Animations     • React Hot Toast Notifications       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (Axios)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Backend Server (Node.js + Express)                  │
│   • JWT Auth & Google OAuth Verifier                                   │
│   • Booking Date Conflict Engine (`checkAvailability`)                 │
│   • Stripe Payment Session Generator & Idempotent Webhook Engine       │
│   • Vehicle Inventory Controllers                                      │
└───────────────┬───────────────────┬────────────────────┬───────────────┘
                │                   │                    │
    ┌───────────▼────────┐ ┌────────▼──────────┐  ┌──────▼──────────────┐
    │   MongoDB Atlas    │ │ ImageKit Cloud    │  │ Stripe & Resend     │
    │ (Users, Cars,      │ │ (Optimized Car    │  │ (Payments, Webhooks,│
    │  Bookings)         │ │  Asset Hosting)   │  │  & Emails)          │
    └────────────────────┘ └───────────────────┘  └─────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies | Role / Rationale |
|---|---|---|
| **Client** | React 18, Vite | High-performance SPA with instant module replacement |
| **Routing** | React Router DOM v7 | Nested route hierarchies and data loaders |
| **Styling** | Tailwind CSS | Utility-first responsive design system with dark mode |
| **Icons & Motion** | Lucide React, Framer Motion | Smooth transitions and clean, modern SVG UI icons |
| **Server** | Node.js, Express.js | Event-driven non-blocking I/O microservice |
| **Security** | Helmet, Express-Rate-Limit | HTTP security headers & multi-tier brute-force API protection |
| **Database** | MongoDB Atlas, Mongoose | Aggregation pipelines (`$group`, `$avg`), compound indices, and schema validation |
| **Auth** | JWT, Google OAuth 2.0, Bcryptjs | Multi-provider identity and secure token hashing |
| **Payments** | Stripe API & Webhooks | Server-side checkout sessions, signature verification & idempotency |
| **External APIs** | Geoapify, ImageKit, Resend | Geocoding, cloud media acceleration, transactional emails |
| **Hosting** | Vercel (Client) & Render (Server) | Global edge CDN & containerized microservice |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URL
- Google Cloud Console Project (OAuth 2.0 Credentials)
- ImageKit account (Keys + URL endpoint)
- Stripe Account (Test API Secret Key)
- (Optional) Resend API key for notification emails

### 1. Clone the Repository
```bash
git clone https://github.com/Rajan-vish/Wheelio.git
cd Wheelio
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ImageKit Storage
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint

# Stripe Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
CURRENCY=inr

# Email Service (Optional)
RESEND_API_KEY=your_resend_api_key
```

Run the backend server:
```bash
npm run server
```

### 3. Frontend Setup
In a new terminal:
```bash
cd ../client
npm install
```

Create a `.env` file in `client/`:
```env
VITE_BASE_URL=http://localhost:3000
VITE_CURRENCY=₹
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GEO_API_KEY=your_geoapify_key
```

Run the frontend:
```bash
npm run dev
```

Open `http://localhost:5173` to explore the app.

---

## 📡 API Specification

### Authentication
- `POST /api/user/register` — Create user account with hashed password
- `POST /api/user/login` — Sign in and receive authorization bearer token
- `POST /api/user/google` — Exchange Google auth code for session token

### Vehicles & Inventory
- `GET /api/user/vehicles` — Filter cars by location, price, category, and date availability
- `POST /api/owner/add-vehicle` — Create vehicle listing (ImageKit buffer upload)
- `POST /api/owner/toggle-car` — Toggle vehicle availability status
- `POST /api/owner/delete-car` — Delete vehicle listing

### Bookings & Stripe Payments
- `POST /api/bookings/check-availability` — Verify date overlap logic
- `POST /api/bookings/create` — Reserve vehicle with Pay on Pickup
- `POST /api/bookings/stripe-checkout` — Create hosted Stripe Checkout Session
- `POST /api/bookings/webhook` — Raw buffer Stripe Webhook handler with idempotency check
- `POST /api/bookings/verify-payment` — Confirm session payment upon redirect
- `GET /api/bookings/user` — Retrieve authenticated user's reservations
- `GET /api/bookings/owner` — Fleet-wide booking register for owner

### Reviews & Ratings Engine (MongoDB Aggregation)
- `POST /api/reviews/add` — Submit review & recalculate rating via aggregation pipeline (Verified renters only)
- `GET /api/reviews/:vehicleId` — Retrieve vehicle reviews with star rating breakdown

---

## 📁 Project Structure

```
Wheelio/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── assets/             # Static graphics and icons
│   │   ├── components/         # Navbar, VehicleCard, DatePicker, Login Modal
│   │   ├── context/            # AppContext (global user, token, theme state)
│   │   ├── pages/              # Home, Vehicles, Details, MyBookings, Owner Dashboard
│   │   ├── App.jsx             # Route definitions & layout wrappers
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── configs/                # MongoDB, ImageKit, Stripe configuration
│   ├── controllers/            # Booking, Review, User, Owner, and Newsletter controllers
│   ├── middleware/             # Auth guard (JWT protect), Multer memory storage
│   ├── models/                 # Vehicle.js, Booking.js, Review.js, User.js schemas
│   ├── routes/                 # bookingRoutes, reviewRoutes, userRoutes, ownerRoutes
│   ├── server.js               # Express entry point (Helmet, Rate Limiters, Raw Stripe Webhooks)
│   └── package.json
└── README.md                   # Documentation
```

---

## 👨‍💻 Author

**Rajan Kumar Vishwakarma**
- GitHub: [@Rajan-vish](https://github.com/Rajan-vish)
- Email: [rajanvish2005@gmail.com](mailto:rajanvish2005@gmail.com)
- LinkedIn: [linkedin.com/in/rajan-kumar-vishwakarma-1a4bb92a8](https://www.linkedin.com/in/rajan-kumar-vishwakarma-1a4bb92a8/)
- Codeforces: [rajan_pant (Specialist - 1420)](https://codeforces.com/profile/rajan_pant)
- LeetCode: [unbitten (614+ Solved)](https://leetcode.com/u/unbitten/)
