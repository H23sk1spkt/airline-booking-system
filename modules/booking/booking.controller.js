const bookingService=require("./booking.service");
const holdSeat=async (req,res)=> {
    try {
        const userId=req.user.id;
        const {ticketId}=req.body;
        const result=await bookingService.holdSeatService(userId,ticketId);
        return res.status(200).json({
            success: true,
            message : "Seat hold successfully",
            data: result
        })
    } catch (err) {
        return res.status(400).json({
            success: false,
            message : err.message
        })
    }
}
const confirmBooking= async (req,res)=> {
    try {
        const bookingId=await bookingService.confirmBookingService(req,body);
        return res.status(200).json({
            success : true,
            bookingId
        })
    } catch (error) {
        return res.status(400).json({
            success : false,
            message : err.message
        });
    }
}
const confirmPayment= async (req,res)=> {
    try {
        const {bookingId}=req.body
        await bookingService.confirmPaymentService(bookingId);
        return res.status(200).json({
            success : true,
            message : "Payment successfully"
        })
    } catch (error) {
        return res.status(400).json({
            success : false,
            message : err.message
        })
    }
}
module.exports = {
    holdSeat,
    confirmBooking,
    confirmPayment
}