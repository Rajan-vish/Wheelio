import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast' 
import {motion} from 'motion/react'

const MyBookings = () => {

  const {axios, user, currency} = useAppContext()
  const [bookings, setBookings] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const openReviewModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setRating(5);
    setComment("");
    setShowReviewModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error("Please provide feedback for this vehicle.");
    }
    try {
      setSubmittingReview(true);
      const { data } = await axios.post("/api/reviews/add", {
        vehicleId: selectedVehicle._id,
        rating,
        comment,
      });

      if (data.success) {
        toast.success(data.message || "Thank you for your rating!");
        setShowReviewModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const {data} = await axios.get('/api/bookings/user')
      if(data.success){
        setBookings(data.bookings)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMyBookings();

      const searchParams = new URLSearchParams(window.location.search);
      const paymentStatus = searchParams.get('payment');
      const sessionId = searchParams.get('session_id');

      if (paymentStatus === 'success' && sessionId) {
        axios.post('/api/bookings/verify-payment', { sessionId }).then(({ data }) => {
          if (data.success && data.paymentStatus === 'paid') {
            toast.success("Payment successful! Your booking is confirmed.");
            fetchMyBookings();
          }
        }).catch(() => {});
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'cancelled') {
        toast.error("Payment was cancelled.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user]);

  return (
    <motion.div 
    initial={{opacity: 0, y: 30}}
    whileInView={{opacity: 1, y: 0}}
    transition={{duration: 0.6 }}
    // SYNC: Added dark text color for main container
    className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl dark:text-gray-200'>
      <Title 
        title='My Bookings' 
        subTitle='View and manage all your vehicle bookings' 
        align="left"
      />

      <div>
        {bookings.map((booking, index) => (
          <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            transition={{delay: index * 0.1, duration: 0.4 }}
            key={booking._id} 
            // SYNC: border-borderColor -> dark:border-gray-700
            className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor dark:border-gray-700 rounded-lg mt-5 first:mt-12 transition-colors'
          >

            {/* Vehicle Image + Info */}
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                <img 
                  src={booking.vehicle.image} 
                  alt="" 
                  className='w-full h-auto aspect-video object-cover'
                />
              </div>
              {/* SYNC: Added dark text color for heading */}
              <p className='text-lg font-medium mt-2 dark:text-white'>
                {booking.vehicle.brand} {booking.vehicle.model}
              </p>
              {/* SYNC: text-gray-500 -> dark:text-gray-400 */}
              <p className='text-gray-500 dark:text-gray-400'>
                {booking.vehicle.year} • {booking.vehicle.category} • {booking.vehicle.location}
              </p>
            </div>

            {/* Booking Info */}
            <div className='md:col-span-2'>
              <div className='flex items-center gap-2'>
                {/* SYNC: bg-light -> dark:bg-slate-800 */}
                <p className='px-3 py-1.5 bg-light dark:bg-slate-800 rounded dark:text-gray-300'>Booking #{index + 1}</p>
                <p 
                  className={`px-3 py-1 text-xs rounded-full capitalize ${
                    booking.status === "confirmed" 
                      ? "bg-green-400/15 text-green-600 dark:text-green-400" 
                      : booking.status === "pending"
                      ? "bg-amber-400/15 text-amber-600 dark:text-amber-400"
                      : "bg-red-400/15 text-red-600 dark:text-red-400"
                  }`}
                >
                  {booking.status}
                </p>
                {booking.paymentStatus && (
                  <p 
                    className={`px-2.5 py-0.5 text-xs rounded-full ${
                      booking.paymentStatus === "paid"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : booking.paymentStatus === "pending"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : booking.paymentStatus === "failed"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {booking.paymentStatus === "paid" ? "💳 Paid" : booking.paymentStatus === "pending" ? "⏳ Payment Pending" : "💵 Pay on Pickup"}
                  </p>
                )}
              </div>

              <div className='flex items-start gap-2 mt-3'>
                {/* SYNC: Kept colored icon without invert as per preference */}
                <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                <div>
                  {/* SYNC: text-gray-500 -> dark:text-gray-400 */}
                  <p className='text-gray-500 dark:text-gray-400'>Rental Period</p>
                  <p className='dark:text-gray-200'>{booking.pickupDate.split('T')[0]} to {booking.returnDate.split('T')[0]}</p>
                </div>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                <div>
                  {/* SYNC: text-gray-500 -> dark:text-gray-400 */}
                  <p className='text-gray-500 dark:text-gray-400'>Pickup Location</p>
                  <p className='dark:text-gray-200'>{booking.vehicle.location}</p>
                </div>
              </div>
            </div>

            {/* Price & Actions */}
            <div className='md:col-span-1 flex flex-col justify-between items-end gap-4'>
             <div className='text-sm text-gray-500 dark:text-gray-400 text-right'>
              <p>Total Price</p>
              <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
              <p className='mt-1'>Booked on {booking.createdAt.split('T')[0]}</p>
             </div>

             <button
               onClick={() => openReviewModal(booking.vehicle)}
               className='px-3.5 py-1.5 text-xs font-medium rounded-lg bg-primary/10 hover:bg-primary/20 text-primary dark:bg-primary/20 dark:hover:bg-primary/30 transition-all flex items-center gap-1.5 cursor-pointer border border-primary/20'
             >
               <span>⭐</span> Rate Vehicle
             </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Review & Rating Modal */}
      {showReviewModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-borderColor dark:border-gray-700 space-y-5"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">
                  Rate {selectedVehicle.brand} {selectedVehicle.model}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Share your rental experience</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitReview} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="text-2xl cursor-pointer transition-transform hover:scale-110"
                    >
                      <span
                        className={
                          star <= (hoverRating || rating)
                            ? "text-amber-400"
                            : "text-gray-300 dark:text-gray-600"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-sm font-semibold text-amber-500 self-center ml-2">
                    {rating} / 5
                  </span>
                </div>
              </div>

              {/* Feedback Comment */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the condition, cleanliness, and ride of the car?"
                  className="w-full px-3 py-2 border border-borderColor dark:border-gray-700 rounded-xl dark:bg-slate-900 dark:text-white outline-none text-sm resize-none h-24 transition-colors"
                  maxLength={500}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-dill rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default MyBookings