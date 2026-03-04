const authServer=require("./auth.service");
exports.register=async (req,res,next)=> {
    try {
        const result= await authServer.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error)
    }
}
exports.login= async (req,res,next) => {
    try {
        const result=await authServer.login(req.body);
        res.status(200).json(result)
    } catch (error) {
        next(error);
    }
}