require("dotenv").config();
const express = require("express");
const app = express();
const { poolPromise } = require("./config/db");
const authRoute = require("./modules/auth/auth.route");
const bookingRouter = require("./modules/booking/booking.route");
const flightRoute=require("./modules/flight/flight.route")
const errMiddleWare = require("./middlewares/error.middleware");
const cron = require("./utils/createReleaseSeat");
app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    message: "Flight Booking API running",
  });
});
cron();
//  This function will automatically reset in one minute
app.use("/api/auth", authRoute);
app.use("/api/booking", bookingRouter);
app.use("/api/flights",flightRoute)
const PORT = process.env.PORT || 3000;
app.use(errMiddleWare);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
