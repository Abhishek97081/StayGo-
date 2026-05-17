const express = require("express");

const router = express.Router();

const wrapAsync =
  require("../utils/wrapAsync");

const { isLoggedIn } =
  require("../middleware");

const bookingController =
  require("../controllers/bookings");

// CREATE ORDER
router.post(
  "/create-order/:id",

  isLoggedIn,

  wrapAsync(
    bookingController.createOrder
  )
);

// VERIFY PAYMENT
router.post(
  "/verify-payment",

  isLoggedIn,

  wrapAsync(
    bookingController.verifyPayment
  )
);

module.exports = router;