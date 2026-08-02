import { User } from '../models/users.model.js';
import { decodeToken } from '../lib/token.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Please log in.',
      });
    }
    const decoded = decodeToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Please log in.',
      });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Please log in.',
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({
          success: false,
          message: 'Token has expired. Please log in again.',
        });
    }
    if (error.name === 'JsonWebTokenError') {
      return res
        .status(401)
        .json({
          success: false,
          message: 'Invalid token. Please log in again.',
        });
    }
    if (error.name === 'NotBeforeError') {
      return res
        .status(401)
        .json({
          success: false,
          message: 'Token not active yet. Please log in again.',
        });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
