import jwt from "jsonwebtoken";
import config from "../config/env.js";
import User from "../models/userModel.js";
import { isInvalidToken } from "../utils/functions.js";

// Protect routes (user must be logged in)
export const protect = async (req, res, next) => {
  let token;

  // Get token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Format: "Bearer <token>"
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Check for invalid token
    if (await isInvalidToken(token)) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from DB (exclude password)
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Restrict route to admins/staff
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};
