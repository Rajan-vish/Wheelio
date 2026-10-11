# 🚗 Wheelio — Full-Stack Car Rental & Fleet Management Platform

A modern, production-grade **MERN** car rental platform delivering a seamless experience for renters to discover, filter, and book vehicles, paired with an administrative fleet dashboard for vehicle inventory, pricing, and booking lifecycle management.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://wheelio-spua.vercel.app/)
[![React](https://img.shields.io/badge/React-18%20(Vite)-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-black?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

🌐 **Live Deployment:** [https://wheelio-spua.vercel.app/](https://wheelio-spua.vercel.app/)

---

## 🌟 Key Engineering Features

### 👤 Customer Experience
- **Dual Authentication**: Standard Email/Password registration alongside secure **Google OAuth 2.0 Authorization Code Flow** with automated profile onboarding.
- **Dynamic Vehicle Search & Filtering**: Multi-parameter search by city location, price per day, seating capacity, and transmission type.
- **Location Autocomplete**: Powered by **Geoapify Geocoding API** for exact pickup/drop-off point selection.
- **Booking Flow & Availability Validation**: Real-time server-side conflict detection preventing double-booking across overlapping calendar dates.
- **Customer Portal**: "My Bookings" interface displaying active, upcoming, and past reservations with live status badges.
- **Theme & Responsiveness**: Mobile-first design with built-in Light/Dark mode state toggle and Framer Motion micro-interactions.

### 🛡️ Admin & Fleet Management
- **Business Analytics Dashboard**: Summary KPIs on total fleet revenue, active rentals, and vehicle utilization rates.
- **Inventory CRUD**: Multi-image cloud upload via **ImageKit CDN** with automatic thumbnailing and responsive delivery.
- **Booking Lifecycle Control**: Single-click status transitions (Pending $\rightarrow$ Confirmed $\rightarrow$ Completed $\rightarrow$ Cancelled) and automated email triggers via **Resend**.

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
│   • Vehicle Inventory Controllers                                      │
└───────────────┬───────────────────┬────────────────────┬───────────────┘
                │                   │                    │
    ┌───────────▼────────┐ ┌────────▼──────────┐  ┌──────▼──────────────┐
    │   MongoDB Atlas    │ │ ImageKit Cloud    │  │ Resend Email Engine │
    │ (Users, Cars,      │ │ (Optimized Car    │  │ (Booking Confirms   │
    │  Bookings)         │ │  Asset Hosting)   │  │  & Alerts)          │
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
| **Database** | MongoDB Atlas, Mongoose | Flexible document schema for variable vehicle attributes |
| **Auth** | JWT, Google OAuth 2.0, Bcryptjs | Multi-provider identity and secure token hashing |
| **External APIs** | Geoapify, ImageKit, Resend | Geocoding, cloud media acceleration, transactional emails |
| **Hosting** | Vercel (Client & Server) | Fast global CDN edge delivery |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URL
- Google Cloud Console Project (OAuth 2.0 Credentials)
- ImageKit account (Keys + URL endpoint)
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
- `POST /api/auth/register` — Create user account with hashed password
- `POST /api/auth/login` — Sign in and receive authorization bearer token
- `POST /api/auth/google` — Exchange Google auth code for session token

### Vehicles & Inventory
- `GET /api/cars` — Filter cars by location, price, category, and date availability
- `GET /api/cars/:id` — Detailed vehicle specifications and images
- `POST /api/cars` — Create vehicle listing (Admin only, ImageKit upload)
- `PUT /api/cars/:id` — Update vehicle pricing/details (Admin only)
- `DELETE /api/cars/:id` — Remove vehicle from fleet (Admin only)

### Bookings & Reservations
- `POST /api/bookings` — Reserve vehicle with date conflict verification
- `GET /api/bookings/my-bookings` — Retrieve authenticated user's reservations
- `GET /api/bookings/admin/all` — Fleet-wide booking register (Admin only)
- `PATCH /api/bookings/:id/status` — Advance booking state (Confirmed, Completed, Cancelled)

---

## 📁 Project Structure

```
Wheelio/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── assets/             # Static graphics and icons
│   │   ├── components/         # Navbar, CarCard, DatePicker, Modal widgets
│   │   ├── context/            # AuthContext, ThemeContext, CartContext
│   │   ├── pages/              # Home, Cars, Details, Bookings, AdminDashboard
│   │   ├── App.jsx             # Route definitions
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── configs/                # MongoDB, ImageKit, Resend configuration
│   ├── controllers/            # Car, Booking, and User business logic
│   ├── middleware/             # Auth guard, admin gate, error handler
│   ├── models/                 # Car.js, Booking.js, User.js schemas
│   ├── routes/                 # Express route manifests
│   ├── server.js               # Express application entry point
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
