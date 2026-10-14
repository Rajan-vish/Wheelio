import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import stripe from "../configs/stripe.js";


// checkAvailability()
//         ↓
// Find overlapping bookings
//         ↓
// booking.length === 0 ?
//         ↓
// YES → Available
// NO  → Not available
// Function to check Availability of Vehicle for a given Date
const checkAvailability = async (vehicle, pickupDate, returnDate) => {
    const booking = await Booking.find({
        vehicle,
//         //existing booking pickup date
//         <=
// new requested return date
        pickupDate: { $lte: returnDate },
//         existing booking return date
//         >=
// new requested pickup date
        returnDate: { $gte: pickupDate },
    });
    return booking.length === 0;
};

// API to Check Availability of Vehicles for the given Date and location
export const checkAvailabilityOfVehicle = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        // fetch all available vehicles for the given location
        const vehicles = await Vehicle.find({ location, isAvailable: true });

        // check vehicle availability for the given date range using promise
        const availableVehiclesPromises = vehicles.map(async (vehicle) => {
            const isAvailable = await checkAvailability(vehicle._id, pickupDate, returnDate);
            return { ...vehicle._doc, isAvailable: isAvailable };
        });

        let availableVehicles = await Promise.all(availableVehiclesPromises);
        availableVehicles = availableVehicles.filter(vehicle => vehicle.isAvailable === true);

        res.json({ success: true, availableVehicles });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Create Booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { vehicle, pickupDate, returnDate } = req.body;

        const isAvailable = await checkAvailability(vehicle, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Vehicle is not available" });
        }

        const vehicleData = await Vehicle.findById(vehicle);

        // Calculate price based on pickupDate and returnDate
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        let noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
        if (noOfDays === 0) {
            noOfDays = 1;
        }
        const price = vehicleData.pricePerDay * noOfDays;

        await Booking.create({ vehicle, owner: vehicleData.owner, user: _id, pickupDate, returnDate, price });

        res.json({ success: true, message: "Booking Created" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get List User Bookings
export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ user: _id }).populate("vehicle").sort({ createdAt: -1 });
        res.json({ success: true, bookings });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get Owner Bookings
export const getOwnerBookings = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.json({ success: false, message: "Unauthorised" });
        }
        const bookings = await Booking.find({ owner: req.user._id })
            .populate("vehicle user")
            .select("-user.password")
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to change booking status
export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, status } = req.body;

        const booking = await Booking.findById(bookingId);

        if (booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorised" });
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Create Stripe Checkout Session
export const createStripeCheckout = async (req, res) => {
    try {
        const { _id, email } = req.user;
        const { vehicle, pickupDate, returnDate } = req.body;

        if (!stripe) {
            return res.json({
                success: false,
                message: "Stripe is not configured. Please set STRIPE_SECRET_KEY in server environment variables.",
            });
        }

        const isAvailable = await checkAvailability(vehicle, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Vehicle is not available for these dates" });
        }

        const vehicleData = await Vehicle.findById(vehicle);
        if (!vehicleData) {
            return res.json({ success: false, message: "Vehicle not found" });
        }

        // Calculate price based on duration
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        let noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
        if (noOfDays <= 0) noOfDays = 1;
        const price = vehicleData.pricePerDay * noOfDays;

        // Pre-create booking with pending status
        const booking = await Booking.create({
            vehicle,
            owner: vehicleData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price,
            status: "pending",
            paymentStatus: "pending",
        });

        // Determine frontend origin for redirects
        const origin = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";
        const currency = (process.env.CURRENCY || "usd").toLowerCase();

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: `${vehicleData.brand} ${vehicleData.model}`,
                            description: `Rental from ${picked.toISOString().split("T")[0]} to ${returned.toISOString().split("T")[0]} (${noOfDays} day${noOfDays > 1 ? "s" : ""})`,
                            images: vehicleData.image ? [vehicleData.image] : [],
                        },
                        unit_amount: Math.round(price * 100), // Stripe expects amounts in cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            customer_email: email,
            client_reference_id: booking._id.toString(),
            metadata: {
                bookingId: booking._id.toString(),
                vehicleId: vehicle.toString(),
                userId: _id.toString(),
            },
            success_url: `${origin}/my-bookings?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/vehicle-details/${vehicle}?payment=cancelled`,
        });

        booking.paymentSessionId = session.id;
        await booking.save();

        res.json({
            success: true,
            url: session.url,
            sessionId: session.id,
            bookingId: booking._id,
        });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Stripe Webhook with Signature Verification & Idempotency
export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe) {
        return res.status(500).json({ error: "Stripe not initialized" });
    }

    let event;

    try {
        if (endpointSecret && sig) {
            // Verify cryptographic signature using raw request body
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            // Fallback for local testing if webhook secret is omitted
            event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        }
    } catch (err) {
        console.error("⚠️ Stripe Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Handle successful payment checkout session
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const bookingId = session.metadata?.bookingId || session.client_reference_id;

            // Find booking by paymentSessionId or bookingId
            const booking = await Booking.findOne({
                $or: [
                    { paymentSessionId: session.id },
                    ...(bookingId ? [{ _id: bookingId }] : []),
                ],
            });

            if (!booking) {
                console.warn(`[Stripe Webhook] Booking not found for session ${session.id}`);
                return res.json({ received: true });
            }

            // ⚡ IDEMPOTENCY CHECK:
            // If already marked as paid, immediately respond without re-running side effects
            if (booking.paymentStatus === "paid") {
                console.log(`[Stripe Webhook - Idempotent] Booking ${booking._id} already marked as paid.`);
                return res.json({ received: true });
            }

            // Mark booking as paid and confirmed
            booking.paymentStatus = "paid";
            booking.status = "confirmed";
            if (!booking.paymentSessionId) {
                booking.paymentSessionId = session.id;
            }
            await booking.save();

            console.log(`✅ [Stripe Webhook] Booking ${booking._id} confirmed and marked as paid!`);
        } else if (event.type === "payment_intent.payment_failed") {
            const paymentIntent = event.data.object;
            const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent.id, limit: 1 });
            if (sessions.data.length > 0) {
                const booking = await Booking.findOne({ paymentSessionId: sessions.data[0].id });
                if (booking && booking.paymentStatus !== "paid") {
                    booking.paymentStatus = "failed";
                    await booking.save();
                }
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error.message);
        res.status(500).json({ error: "Internal server error during webhook processing" });
    }
};

// API to verify payment session upon returning from Stripe redirect
export const verifyPaymentSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.json({ success: false, message: "Session ID required" });
        }

        const booking = await Booking.findOne({ paymentSessionId: sessionId });
        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        // If webhook hasn't fired yet, verify directly with Stripe API
        if (booking.paymentStatus !== "paid" && stripe) {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === "paid") {
                booking.paymentStatus = "paid";
                booking.status = "confirmed";
                await booking.save();
            }
        }

        res.json({
            success: true,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
        });
    } catch (error) {
        console.error("Verify Payment Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

