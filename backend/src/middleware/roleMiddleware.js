const { sendError } = require('../utils/apiResponse');

exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role !== 'admin') {
    return sendError(res, 'Access denied. Admin privileges required.', 403);
  }
  next();
};
