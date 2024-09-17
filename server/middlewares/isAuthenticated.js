import jwt from "jsonwebtoken";
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access! Please login",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        message: "Invlide token! Please login again",
      });
    }
    req.id = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
};

export default isAuthenticated;
