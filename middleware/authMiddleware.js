const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Admin = require("../models/admin");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    // Ensure token is present and follows "Bearer <token>" format
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    // Check if it's a User or an Admin
    let user = await User.findById(decoded.id).select("-password");
    let admin = await Admin.findById(decoded.id).select("-password");

    req.user = user || admin; // Attach either user or admin details

    if (!req.user) {
      return res.status(401).json({ error: "Invalid token. User not found." });
    }

    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token or session expired." });
  }
};

// ✅ Admin check middleware
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required!" });
  }
  next();
};

// ✅ Export both middlewares
module.exports = { authMiddleware, isAdmin };
