import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// to verify officer
export const verifyOfficer = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.userType !== 'officer') {
    throw new ApiError(403, "Access denied. Only placement officers can access this resource");
  }
  next();
});

// to verify student
export const verifyStudent = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.userType !== 'student') {
    throw new ApiError(403, "Access denied. Only students can access this resource");
  }
  next();
});

// to verify alumni
export const verifyAlumni = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.userType !== 'alumni') {
    throw new ApiError(403, "Access denied. Only alumni can access this resource");
  }
  next();
});