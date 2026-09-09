import {sendError} from "../utils/apiResponse.js"
import logger from '../utils/logger.js';

export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected error occurred';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = `File too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE_MB || 50}MB.`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please sign in again.';
  }

  if (process.env.NODE_ENV !== 'production') {
    logger.error(`[${statusCode}] ${message}`, err);
  }

  return sendError(res, message, statusCode);
}
