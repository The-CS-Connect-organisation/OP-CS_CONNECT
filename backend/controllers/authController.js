import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';

const toSafeUser = (userDoc) => ({
  id: userDoc._id.toString(),
  name: userDoc.name,
  email: userDoc.email,
  role: userDoc.role,
  isActive: userDoc.isActive,
  createdAt: userDoc.createdAt,
});

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role });
  const token = signToken({ sub: user._id.toString(), role: user.role });

  res.status(201).json({
    success: true,
    token,
    user: toSafeUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const token = signToken({ sub: user._id.toString(), role: user.role });

  res.json({
    success: true,
    token,
    user: toSafeUser(user),
  });
});

export const me = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    message: 'Auth API is healthy',
  });
});
