const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET || 'default_secret',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'default_refresh',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
  return { accessToken, refreshToken };
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return sendError(res, 'Name, email, and password are required.', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return sendError(res, 'An account with this email already exists.', 409);
  }

  const user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = generateTokens(user._id);

  await User.findByIdAndUpdate(user._id, { refreshToken });

  logger.info(`New user registered: ${email}`);

  return sendSuccess(res, {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  }, 'Account created successfully', 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Email and password are required.', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, 'Invalid email or password.', 401);
  }

  if (!user.isActive) {
    return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken });

  logger.info(`User logged in: ${email}`);

  return sendSuccess(res, {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  }, 'Login successful');
});

exports.logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }
  return sendSuccess(res, null, 'Logged out successfully');
});

exports.getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, req.user);
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, 'Refresh token required.', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh');
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return sendError(res, 'Invalid refresh token.', 401);
    }

    const tokens = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return sendSuccess(res, { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch {
    return sendError(res, 'Invalid or expired refresh token.', 401);
  }
});
