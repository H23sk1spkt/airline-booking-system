const { query } = require("mssql");
const {sql,poolConnect}= require("../../config/db");
// giu ve
const holdTicket= async ({
    userId,
    ticketId,
}
) => {
    await poolConnect;
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request=new sql.Request(transaction);
        request.input("ticketId",sql.Int,ticketId);
        request.input("userId",sql.Int,userId)
        await request.query(`
            Set transaction isolation level serializable
            `);
        const seatResult=await request.query(`
            Select * 
            from Tickets with (Updlock,rowlock)
            where TicketId=@ticketId
            and Status='available'
            `);
        if(!seatResult.recordset.length){
            throw new Error("Seat not found");
        }
        await request.query(`
            update Tickets
            set Status='hold'
            where TicketId=@ticketId`);
        await request.query(`
            Insert into SeatHold
            (
                TicketId,
                UserId,
                ExpiredTime
            )
            Values 
            (
                @ticketId,
                @userId,
                DATEADD(MINUTE,15,GETDATE())
            )
            `)
        await transaction.commit();
        return true
    } catch (error) {
       await transaction.rollback();
       throw error; 
    }
}
const confirmBookingTransaction = async ({
    userId,
    passengers,
    reservationCode,
}) => {

    await poolConnect;
    const transaction = new sql.Transaction();

    try {
        await transaction.begin();

        // SET isolation level
        const isoRequest = new sql.Request(transaction);
        await isoRequest.query(`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`);

        // 1️⃣ Insert Booking
        const bookingRequest = new sql.Request(transaction);
        bookingRequest.input("reservationCode", sql.VarChar, reservationCode);
        bookingRequest.input("userId", sql.Int, userId);

        const bookingResult = await bookingRequest.query(`
            INSERT INTO Booking (ReservationCode, UserId, TotalAmount)
            VALUES (@reservationCode, @userId, 0);

            SELECT SCOPE_IDENTITY() AS BookingId;
        `);

        const bookingId = bookingResult.recordset[0].BookingId;

        let totalAmount = 0;
        let AdultCount = 0;
        let ChildCount = 0;
        let BabyCount = 0;

        // 2️⃣ Loop passengers
        for (const p of passengers) {

            const ticketRequest = new sql.Request(transaction);
            ticketRequest.input("ticketId", sql.Int, p.ticketId);
            ticketRequest.input("userId", sql.Int, userId);

            const ticketResult = await ticketRequest.query(`
                SELECT t.*
                FROM Tickets t WITH (UPDLOCK, ROWLOCK)
                JOIN SeatHold sh ON t.TicketId = sh.TicketId
                WHERE t.TicketId = @ticketId
                AND t.Status = 'hold'
                AND sh.UserId = @userId
                AND sh.ExpiredTime > GETDATE()
            `);

            if (!ticketResult.recordset.length) {
                throw new Error("Ticket invalid or expired");
            }

            const ticket = ticketResult.recordset[0];
            let ticketPrice = Number(ticket.Price);

            if (p.type === 'Child') {
                ticketPrice *= 0.7;
                ChildCount++;
            } else if (p.type === 'Baby') {
                ticketPrice = 0;
                BabyCount++;
            } else {
                AdultCount++;
            }

            totalAmount += ticketPrice;

            const detailRequest = new sql.Request(transaction);
            detailRequest.input("bookingId", sql.Int, bookingId);
            detailRequest.input("ticketId", sql.Int, p.ticketId);
            detailRequest.input("name", sql.NVarChar, p.name);
            detailRequest.input("type", sql.VarChar, p.type);

            await detailRequest.query(`
                INSERT INTO BookingDetail
                (BookingId, TicketId, PassengerName, PassengerType)
                VALUES
                (@bookingId, @ticketId, @name, @type)
            `);
        }

        // 3️⃣ Update Booking tổng tiền + count
        const updateRequest = new sql.Request(transaction);
        updateRequest.input("bookingId", sql.Int, bookingId);
        updateRequest.input("totalAmount", sql.Decimal(18,2), totalAmount);
        updateRequest.input("adult", sql.Int, AdultCount);
        updateRequest.input("child", sql.Int, ChildCount);
        updateRequest.input("baby", sql.Int, BabyCount);

        await updateRequest.query(`
            UPDATE Booking
            SET TotalAmount = @totalAmount,
                AdultCount = @adult,
                ChildCount = @child,
                BabyCount = @baby
            WHERE BookingId = @bookingId
        `);

        await transaction.commit();
        return bookingId;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
// Khi xác nhận thanh toán
const confirmPaymentBooking=async (bookingId)=>{
    await poolConnect;
    const transaction= new sql.Transaction();
    try {
        await transaction.begin();
        const request=new sql.Request(transaction)
        request.input("bookingId",sql.Int,bookingId)
        const bookingCheck= await request.query(`
                select *
                from Booking 
                where BookingId=@bookingId
                and PaymentStatus='Unpaid'
            `)
        if(!bookingCheck.recordset.length){
            throw new Error("Invalid or already paid booking")
        }
        await request.query(
            `
                Update Tickets
                set Status= 'booked'
                where TicketId in (
                    Select TicketId 
                    from BookingDetail
                    where BookingId=@bookingId
                )
            `
        )
        await request.query(`
                update Booking
                Set 
                PaymentStatus='Paid',
                PaymentMethod='Confirmed'
                where BookingId=@bookingId
            `)
        await request.query(`
                update SeatHold
                set Status='Released'
                where TicketId in (
                    Select TicketId 
                    from BookingDetail
                    where BookingId=@bookingId
                )
            `)
        await transaction.commit();
        return true
    } catch (error) {
        await transaction.rollback();
        throw error
    }
}
module.exports= {
    holdTicket,
    confirmBookingTransaction,
    confirmPaymentBooking
}
