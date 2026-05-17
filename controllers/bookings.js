const Razorpay = require("razorpay");
const crypto = require("crypto");

const Listing = require("../models/listing");
const Booking = require("../models/booking");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

module.exports.createOrder = async (req, res) => {

  const { id } = req.params;

  const listing = await Listing.findById(id);

  const { checkIn, checkOut, guests } = req.body;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const nights =
    Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  const totalPrice =
    nights * listing.price + 1500;

  // Prevent invalid dates
  if (nights <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking dates",
    });
  }

  // Prevent double booking
  const existingBooking = await Booking.findOne({
    listing: id,

    checkIn: { $lt: end },
    checkOut: { $gt: start },
  });

  if (existingBooking) {
    return res.status(400).json({
      success: false,
      message: "Dates already booked",
    });
  }

  const options = {
    amount: totalPrice * 100,
    currency: "INR",
  };

  const order = await razorpay.orders.create(options);

  const booking = new Booking({
    listing: listing._id,
    user: req.user._id,

    checkIn: start,
    checkOut: end,

    guests,
    nights,
    totalPrice,

    razorpayOrderId: order.id,
  });

  await booking.save();

  res.json({
    order,
    bookingId: booking._id,
    key: process.env.RAZORPAY_KEY_ID,
  });
};

module.exports.verifyPayment = async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_SECRET
    )
    .update(
      razorpay_order_id +
      "|" +
      razorpay_payment_id
    )
    .digest("hex");

  if (
    generatedSignature !==
    razorpay_signature
  ) {
    return res.status(400).json({
      success: false,
    });
  }

  await Booking.findByIdAndUpdate(
    bookingId,
    {
      paymentStatus: "paid",
      razorpayPaymentId:
        razorpay_payment_id,
    }
  );

  res.json({
    success: true,
  });
};