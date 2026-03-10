const utils=require("../../utils/generateSeat")
const flightRepo=require("./flight.repository");
const {sql,poolConnect}=require("../../config/db");
const createFlightBooking = async (data)=> {
    await poolConnect;
    const transaction=new sql.Transaction();
    try {
        transaction.begin();
        const request=new sql.Request(transaction)
        const flight=await flightRepo.createFlight(request,data);
        const flightId=flight.FlightId
        const totalSeat=flight.TotalSeat
        const seats=await utils.generateSeats(totalSeat);
        const bulkTickets= flightRepo.bulkInsertTicket(transaction,flightId,seats);
        await transaction.commit();
        return flightId
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
const getFlight=async ()=> {
    await poolConnect();
        const request=new sql.Request();
        const flights=await flightRepo.getFlight(request,data);
        return flights
    
}
const updateFlight=async (flightId,data)=> {
    await poolConnect;
    try {
        const request=new sql.Request();
        const flight= await flightRepo.updateFlight(request,flightId,data);
        return flight
    } catch (error) {
        throw error
    }
    
}
const deleteFlight=async (flightId)=> {
    await poolConnect;
    const transaction=new sql.Transaction();
    try {
        transaction.begin();
        const request=new sql.Request(transaction);
        await flightRepo.deleteFlight(flightId);
        await flightRepo.deleteTicket(flightId);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error
    }
}
module.exports={
    createFlightBooking,
    getFlight,
    updateFlight,
    deleteFlight
}