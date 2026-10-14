import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import { stripeWebhook } from "./controllers/bookingController.js";

const app = express();

await connectDB();

// Security: HTTP headers protection
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(cors());

// Rate Limiting: General API protection (500 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api/", apiLimiter);

// Rate Limiting: Strict Auth protection against brute-force (20 requests per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please wait 15 minutes." },
});
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);

// Stripe Webhook MUST receive raw buffer body for signature verification BEFORE express.json()
app.post(
  "/api/bookings/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());

app.get("/", (req, res) => res.send("Server is running"));

app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/newsletter", newsletterRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
);
