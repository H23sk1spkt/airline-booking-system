const express=require("express");
const route=express.Router();
const flightControllers=require("./flight.controller");
const { authorization } = require("../../middlewares/auth.middleware");
route.post("/flights",authorization("admin"),flightControllers);
route.get("/flights/search",flightControllers.getFlight)
route.put("/flights/:flightId",authorization("admin"),flightControllers.updateFlight)
route.delete("/flights/:flightId",authorization("admin"),flightControllers.updateFlight)
module.exports=route
