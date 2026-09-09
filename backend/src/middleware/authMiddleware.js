import pkg from 'jsonwebtoken';
const { verify } = pkg;
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Authentication required. Please sign in.', 401);
  }

  try {
    const decoded = verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 'User not found.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token. Please sign in again.', 401);
  }
});
