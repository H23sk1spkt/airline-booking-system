const authRepo=require("./auth.repository");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
exports.register= async ({fullName,email,password})=> {
    const existing=await authRepo.findByEmail(email);
    if(existing){
        throw new Error("Email already exists");
    }
    const hashPassword=await bcrypt.hash(password,10);
    return authRepo.createUser({
        fullName,
        email,
        password : hashPassword,
    });
}
exports.login=async ({email,password})=> {
    const user=await authRepo.findByEmail(email);
    if(!user){
        throw new Error("User not found");
    }
    const isMatch= await bcrypt.compare(password,user.PasswordHash);
    if(!isMatch){
        throw new Error("Password not correct");
    }
    const token = jwt.sign(
        {
            id : user.UserId,
            role : user.RoleId
        },
        process.env.JWT_SECRET,
        {expiresIn : "1d"}
    );
    return {
        token,
        user: {
            id : user.UserId,
            email : user.Email,
            role : user.RoleId
        }
    }
}