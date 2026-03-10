const flightService=require("./flight.service");
const createFlight=async (req,res)=> {
    try {
        const flightId=await flightService.createFlight(req.body);
        return res.status(200).json
        ({
            message : "Create flight successfully",
            flightId
        })
    } catch (error) {
        return res.status(500).json({
            message : "Server failed"
        })
    }
}
const getFlight= async (req,res)=> {
    try {
        const {from,to,data}=req.body
        const flights=await flightService.getFlight({
            from,
            to,
            date
        })
        return res.status(200).json({
            message : "Search successfully",
            flights
        })
    } catch (error) {
        res.status(500).json({
           message: "Server error"
        })
    }
}
const updateFlight= async (req,res)=> {
    try {
        const flightId=req.params.flightId
        const flightUpdate=await flightService.updateFlight(flightId,req.body);
        res.status(200).json({
            message : "Update successfully",
            flightUpdate
        })
    } catch (error) {
       res.status(500).json({
        message : "Server error"
       }) 
    }
}
const deleteFlight= async (req,res)=> {
    try {
        const flightId= req.params.flightId;
        await flightService.deleteFlight(flightId);
    } catch (error) {
        throw error
    }
}
module.exports={createFlight,getFlight,updateFlight}