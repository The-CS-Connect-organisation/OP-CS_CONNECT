import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { ErrorLog } from '../models/ErrorLog.js';

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, _next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    details = error.issues;
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Database validation error';
    details = Object.values(error.errors).map((e) => e.message);
  } else if (error?.code === 11000) {
    statusCode = 409;
    message = 'Duplicate resource';
  }

  logger.error('Request failed', {
    path: req.originalUrl,
    method: req.method,
    statusCode,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  ErrorLog.create({
    path: req.originalUrl,
    method: req.method,
    statusCode,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    meta: details,
  }).catch(() => {
    // Avoid recursive logging failures in error middleware.
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};
