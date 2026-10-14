import express from "express";
import { addReview, getVehicleReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", protect, addReview);
reviewRouter.get("/:vehicleId", getVehicleReviews);

export default reviewRouter;
