const jwt = require("jsonwebtoken");
exports.verifyToken = async (req, res, next) => {
  const authHead = req.headers.authorization;
  if (!authHead || !authHead.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token not found",
    });
  }
  const token = authHead.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Kiểm tra lỗi có lỗi thi văng ra cho cathc bắt còn nếu ko có lỗi thì trả về dữ liệu mà token đang năm giữ
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid Token",
    });
  }
};
exports.authorization= (roleRequired)=> {
  return (req,res,next)=> {
    if(!req.user){
      return res.status(401).json({
        message : "User not found"
      })
    }
    if(req.user.role !== roleRequired){
      return res.status(403).json({
        message : "Role not correct"
      })
    }
    next();
  }
}