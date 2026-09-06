const User = require('../models/User');
const Dataset = require('../models/Dataset');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return sendSuccess(res, users);
});

exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    return sendError(res, 'isActive must be a boolean value.', 400);
  }

  if (req.params.id === req.user._id.toString()) {
    return sendError(res, 'You cannot deactivate your own account.', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  );

  if (!user) {
    return sendError(res, 'User not found.', 404);
  }

  return sendSuccess(res, user, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
});

exports.getSystemStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalDatasets, suspiciousDatasets, activeUsers] = await Promise.all([
    User.countDocuments(),
    Dataset.countDocuments(),
    Dataset.countDocuments({ isSuspicious: true }),
    User.countDocuments({ isActive: true }),
  ]);

  return sendSuccess(res, {
    totalUsers,
    activeUsers,
    totalDatasets,
    suspiciousDatasets,
  });
});

exports.getSuspiciousAlerts = asyncHandler(async (req, res) => {
  const alerts = await Dataset.find({ isSuspicious: true })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, alerts);
});
