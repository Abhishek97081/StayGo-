const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");

const { isLoggedIn } = require("../middleware");

const bookingController =
  require("../controllers/bookings");

router.post(
  "/create-order/:id",

  isLoggedIn,

  wrapAsync(
    bookingController.createOrder
  )
);

router.post(
  "/verify-payment",

  isLoggedIn,

  wrapAsync(
    bookingController.verifyPayment
  )
);

module.exports = router;