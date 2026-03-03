import User from "../models/user.model.js";

export const requireLogin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first."
      });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid session. Please login again."
      });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication failed."
    });
  }
};