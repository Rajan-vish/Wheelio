import express from "express";
import { 
  changeBookingStatus, 
  checkAvailabilityOfVehicle, 
  createBooking, 
  createStripeCheckout, 
  getOwnerBookings, 
  getUserBookings, 
  verifyPaymentSession 
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityOfVehicle);
bookingRouter.post("/create", protect, createBooking);
bookingRouter.post("/stripe-checkout", protect, createStripeCheckout);
bookingRouter.post("/verify-payment", protect, verifyPaymentSession);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/owner", protect, getOwnerBookings);
bookingRouter.post("/change-status", protect, changeBookingStatus);

export default bookingRouter;