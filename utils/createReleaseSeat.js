const cron= require("node-cron");
const {sql,poolConnect}= require("../config/db");
const cronSeat=async ()=> {
    cron.schedule("*/1 * * * *",async ()=> {
        // hàm tự động chay lai mỗi phút 1 lần
        console.log("Function autos run in one minute");
        await poolConnect;
        const transaction=new sql.Transaction();
        try {
            await transaction.begin();
            const request=new sql.Request(transaction);
                await request.query(`
                        update Tickets
                        set Status='available'
                        where TicketId in (
                            Select *
                        from SeatHold
                        where ExpiredTime< GETDATE())
                        )
                    `)
                await request.query(`
                    delete 
                    from SeatHold
                    where TicketId in (
                            Select *
                        from SeatHold
                        where ExpiredTime< GETDATE())
                    `)
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    })
}
module.exports=cronSeat