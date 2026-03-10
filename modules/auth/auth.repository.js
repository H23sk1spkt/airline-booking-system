const {sql,poolPromise}=require("../../config/db");
exports.findByEmail=async (email)=> {
    const pool=await poolPromise;
    const result=await pool.request()
        .input("email",sql.VarChar,email)
        .query("Select * from Users where Email=@email")
    return result.recordset[0]
}
exports.createUser=async ({fullName,email,password}) => {
    const pool=await poolPromise;
    const result=await pool.request()
        .input("fullName",sql.NVarChar,fullName)
        .input("email",sql.VarChar,email)
        .input("password",sql.VarChar,password)
        .query(`
            Insert into Users(FullName,Email,PasswordHash,RoleId)
            Output Inserted.UserId,Inserted.Email
            values (@fullName,@email,@password,1)
            `)
    return result.recordset[0];
};
exports.sendOtp= async (email) => {
    
}