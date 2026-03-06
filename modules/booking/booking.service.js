const {holdTicket,confirmBookingTransaction,confirmPaymentBooking}=require("./booking.repository");
const holdSeatService= async (userId,ticketId)=> {
    return await holdTicket({userId,ticketId});
}
const confirmBookingService=async (data)=> {
    return await confirmBookingTransaction(data)
}
const confirmPaymentService=async (bookingId)=> {
    return await confirmPaymentBooking(bookingId)
}
module.exports={
    holdSeatService,
    confirmBookingService,
    confirmPaymentService
}