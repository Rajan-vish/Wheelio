import mongoose from "mongoose";
import Review from "../models/Review.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

// Helper function: Recalculate vehicle ratings using MongoDB Aggregation Pipeline
const updateVehicleRating = async (vehicleId) => {
  const stats = await Review.aggregate([
    {
      $match: { vehicle: new mongoose.Types.ObjectId(vehicleId) },
    },
    {
      $group: {
        _id: "$vehicle",
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Vehicle.findByIdAndUpdate(vehicleId, {
      totalReviews: stats[0].totalReviews,
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
    });
  } else {
    await Vehicle.findByIdAndUpdate(vehicleId, {
      totalReviews: 0,
      averageRating: 0,
    });
  }
};

// Add or update review for a vehicle
export const addReview = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { vehicleId, rating, comment } = req.body;

    if (!vehicleId || !rating || !comment) {
      return res.json({ success: false, message: "Rating and comment are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Rating must be between 1 and 5." });
    }

    // Business Logic: Only verified customers with a confirmed or paid booking can review
    const hasBooked = await Booking.findOne({
      vehicle: vehicleId,
      user: userId,
      $or: [
        { status: "confirmed" },
        { paymentStatus: "paid" },
      ],
    });

    if (!hasBooked) {
      return res.json({
        success: false,
        message: "Only verified renters with a confirmed booking can review this vehicle.",
      });
    }

    // Upsert review (update if already reviewed, else create)
    const review = await Review.findOneAndUpdate(
      { vehicle: vehicleId, user: userId },
      { rating, comment },
      { new: true, upsert: true }
    );

    // Recalculate average rating using MongoDB Aggregation
    await updateVehicleRating(vehicleId);

    res.json({
      success: true,
      message: "Review submitted successfully!",
      review,
    });
  } catch (error) {
    console.error("Add Review Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get reviews and rating breakdown for a vehicle
export const getVehicleReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const reviews = await Review.find({ vehicle: vehicleId })
      .populate("user", "name image")
      .sort({ createdAt: -1 });

    // Aggregation: Calculate Star Rating Breakdown (5, 4, 3, 2, 1 stars)
    const breakdown = await Review.aggregate([
      { $match: { vehicle: new mongoose.Types.ObjectId(vehicleId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json({
      success: true,
      reviews,
      breakdown,
    });
  } catch (error) {
    console.error("Get Reviews Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
