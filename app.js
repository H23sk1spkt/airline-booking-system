require("dotenv").config()
const express=require("express");
const app=express();
const {poolPromise}=require("./config/db");
const authRoute=require("./modules/auth/auth.route")
const errMiddleWare=require("./middlewares/error.middleware")
app.use(express.json());
app.get("/",(req,res)=> {
    res.json({
        message: "Flight Booking API running"
    })
})
app.use("/api/auth",authRoute);
const PORT=process.env.PORT || 3000;
app.use(errMiddleWare)
app.listen(PORT,()=> {
    console.log(`Server running on port ${PORT}`)
})