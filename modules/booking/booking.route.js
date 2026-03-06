const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/auth.middleware");
const bookingController = require("./booking.controller");
router.post("/hold", verifyToken, bookingController.holdSeat);
router.post("/confirm", bookingController.confirmBooking);
router.post("/payment", bookingController.confirmPayment);
module.exports = router;
