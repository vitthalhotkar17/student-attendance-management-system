const Session = require("../models/Session");
const Assignment = require("../models/Assignment");
const { success, error } = require("../utils/response");

const SESSION_DURATION_MINUTES = 30;

// ─── POST /api/sessions/start ─────────────────────────────────────────────────
const startSession = async (req, res, next) => {
  try {
    const { subject, lat, lng, durationMinutes } = req.body;
    const faculty = req.user;

    if (!subject) return error(res, "Subject is required", 400);

    // Deactivate any other running session by this faculty
    await Session.updateMany({ facultyId: faculty._id, active: true }, { active: false, endedAt: new Date() });

    const duration = durationMinutes || SESSION_DURATION_MINUTES;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const session = await Session.create({
      facultyId: faculty._id,
      facultyName: faculty.name,
      subject,
      expiresAt,
      lat: lat || null,
      lng: lng || null,
      radius: 500,
      active: true,
    });

    return success(res, { session }, "Attendance session started", 201);
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/sessions/end/:id ────────────────────────────────────────────────
const endSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      facultyId: req.user._id, // faculty can only end their own
    });

    if (!session) return error(res, "Session not found", 404);
    if (!session.active) return error(res, "Session is already ended", 400);

    session.active = false;
    session.endedAt = new Date();
    await session.save();

    return success(res, { session }, "Session ended");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/sessions ────────────────────────────────────────────────────────
const getSessions = async (req, res, next) => {
  try {
    const filter = {};
    // Faculty sees only their sessions; admin sees all
    if (req.user.role === "faculty") filter.facultyId = req.user._id;

    const sessions = await Session.find(filter)
      .populate("facultyId", "name email department")
      .sort({ createdAt: -1 });

    return success(res, { sessions }, "Sessions fetched");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/sessions/active ─────────────────────────────────────────────────
const getActiveSession = async (req, res, next) => {
  try {
    const now = new Date();
    const session = await Session.findOne({
      active: true,
      expiresAt: { $gt: now },
    }).populate("facultyId", "name department");

    return success(res, { session: session || null }, session ? "Active session found" : "No active session");
  } catch (err) {
    next(err);
  }
};

module.exports = { startSession, endSession, getSessions, getActiveSession };
