const User = require("../models/User");
const { success, error } = require("../utils/response");
const path = require("path");

// ─── GET /api/profile ─────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    return success(res, { user: req.user }, "Profile fetched");
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/profile ─────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, department, rollNo, year, employeeId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department, rollNo, year, employeeId },
      { new: true, runValidators: true }
    );

    return success(res, { user }, "Profile updated");
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/profile/upload ─────────────────────────────────────────────────
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) return error(res, "No image uploaded", 400);

    const profileImage = `/uploads/profiles/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage },
      { new: true }
    );

    return success(res, { user, profileImage }, "Profile image uploaded");
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadProfileImage };
