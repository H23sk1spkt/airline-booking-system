const {sql,poolConnect}=require("../../config/db");
const createFlight= async (request,flightData)=> {
    const result=await request
    .input("FirstCode",sql.VarChar,FirstCode)
    .input("Airline",sql.NVarChar,Airline)
    .input("FromAirport",sql.VarChar,FromAirport)
    .input("ToAirport",sql.VarChar,ToAirport)
    .input("DepartureTime",sql.DateTime,DepartureTime)
    .input("ArrivalTime",sql.DateTime,ArrivalTime)
    .input("TotalSeat",sql.Int,TotalSeat)
    .input("AvailableSeat",sql.VarChar, AvailableSeat)
    .query(`
        INSERT INTO Flights 
        (
            FlightCode,
            Airline,
            FromAirport,
            ToAirport,
            DepartureTime,
            ArrivalTime,
            TotalSeat,
            AvailableSeat
        )
        output inserted.FlightId
        values (
            @FlightCode,
            @Airline,
            @FromAirport,
            @ToAirport,
            @DepartureTime,
            @ArrivalTime,
            180,
            180
        )
        `)
    return result.recodeset[0]
}
const bulkInsertTicket= async (transaction,flightId,seats)=> {
    const table= new sql.Table("Tickets");
    table.columns.add("FlightId",sql.Int);
    table.columns.add("SeatCode",sql.VarChar(10));
    table.columns.add("Class",sql.NVarChar(20));
    table.columns.add("Price",sql.Decimal(18,2));
    for(const seat of seats){
        table.rows.add(
            flightId,
            seat.seatCode,
            seat.class,
            seat.price
        )
    }
    const request=new sql.Request(transaction);
    await request.bulk(table);
}
const getFlight= async (request,{from,to,date})=> {
    const flight=await request
    .input("from",sql.VarChar,from)
    .input("to",sql.VarChar,to)
    .input("Departure",sql.DateTime,date)
    .query(`
        Select *
        from Flights
        where FromAirport=@from
        and ToAirport=@to
        and Cast(DepartureTime as Data)=@Departure
        and Status='schedule'
        `);
    return flight.recodeset
}
const updateFlight=async (request,flightId,data)=> {
    const result= await request
    .input("Airline",sql.NVarChar,Airline)
    .input("Id",sql.Int,flightId)
    .input("FromAirport",sql.VarChar,FromAirport)
    .input("ToAirport",sql.VarChar,ToAirport)
    .input("AvailableSeat",sql.VarChar, AvailableSeat)
    .query(`
        update Flights
        set 
            Airline=@Airline,
            FromAirport=@FromAirport,
            ToAirport=@ToAirport,
            AvailableSeat='@AvailableSeat'
        where FlightId=@Id
        `)
    return result.rowsAffected[0]
}
const deleteFlight=async (request,flightId)=> {
    await request
    .input("Id",sql.Int,flightId)
    .query(`
        delete 
        from Flights
        where FlightId=@Id
        `)
}
const deleteTicket=async (request,flightId)=> {
    await request
    .input("Id",sql.Int,flightId)
    .query(`
        delete 
        from Tickets
        where FlightId=@Id
        `)
}
module.exports={
    createFlight,
    bulkInsertTicket,
    getFlight,
    updateFlight,
    deleteFlight,
    deleteTicket
}