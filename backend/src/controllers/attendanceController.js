const Attendance = require("../models/Attendance");
const Session = require("../models/Session");
const User = require("../models/User");
const { success, error } = require("../utils/response");
const { compareFaces } = require("../services/faceRecognitionService");
const { distanceMeters, todayString } = require("../utils/dateUtils");

// ─── POST /api/attendance/mark ───────────────────────────────────────────────
/**
 * Student marks attendance for an active session.
 * Requires:
 *   - sessionId  (string)
 *   - faceImage  (base64 data-URI from webcam)
 *   - lat / lng  (GPS from browser)
 */
const markAttendance = async (req, res, next) => {
  try {
    const { sessionId, faceImage, lat, lng } = req.body;
    const student = req.user;

    // ── 1. Validate session ────────────────────────────────────────────────
    const session = await Session.findById(sessionId);
    if (!session) return error(res, "Session not found", 404);
    if (!session.active) return error(res, "This session is no longer active", 400);
    if (new Date() > new Date(session.expiresAt)) {
      session.active = false;
      await session.save();
      return error(res, "Session has expired", 400);
    }

    // ── 2. Check for duplicate ─────────────────────────────────────────────
    const alreadyMarked = await Attendance.findOne({
      sessionId,
      studentId: student._id,
    });
    if (alreadyMarked) {
      return error(res, "Attendance already marked for this session", 409);
    }

    // ── 3. GPS proximity check ─────────────────────────────────────────────
    if (session.lat && session.lng && lat && lng) {
      const dist = distanceMeters(session.lat, session.lng, parseFloat(lat), parseFloat(lng));
      if (dist > session.radius) {
        return error(
          res,
          `You are ${Math.round(dist)}m away from the class location. Must be within ${session.radius}m.`,
          400
        );
      }
    }

    // ── 4. Face verification ───────────────────────────────────────────────
    const freshStudent = await User.findById(student._id).select("+faceEmbeddings +faceEmbedding");
    let faceVerified = false;
    let verificationScore = 0;

    const embeddings = freshStudent.faceEmbeddings?.length
      ? freshStudent.faceEmbeddings
      : freshStudent.faceEmbedding
      ? [freshStudent.faceEmbedding]
      : [];

    if (!embeddings.length) {
      return error(res, "No face registered for this account. Please register your face first.", 400);
    }

    if (!faceImage) {
      return error(res, "Live face image is required for attendance verification.", 400);
    }

    const result = compareFaces(faceImage, embeddings);
    faceVerified = result.verified;
    verificationScore = result.score;

    if (!faceVerified) {
      return error(
        res,
        `Face Verification Failed. Attendance cannot be marked. (Score: ${verificationScore}%)`,
        400,
        { verified: false, score: verificationScore }
      );
    }

    // ── 5. Create attendance record ────────────────────────────────────────
    const record = await Attendance.create({
      sessionId,
      studentId: student._id,
      studentName: student.name,
      subject: session.subject,
      date: todayString(),
      checkIn: new Date(),
      faceVerified,
      verificationScore,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      status: "Present",
    });

    return success(
      res,
      { record, faceVerified, verificationScore },
      "Attendance marked successfully",
      201
    );
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/attendance/check-in ──────────────────────────────────────────
// (Legacy/simple check-in without session — for simpler flows)
const checkIn = async (req, res, next) => {
  return markAttendance(req, res, next);
};

// ─── POST /api/attendance/check-out ─────────────────────────────────────────
const checkOut = async (req, res, next) => {
  try {
    const today = todayString();
    const record = await Attendance.findOne({
      studentId: req.user._id,
      date: today,
    });

    if (!record) return error(res, "No check-in found for today", 404);
    if (record.checkOut) return error(res, "Already checked out today", 409);

    record.checkOut = new Date();
    await record.save();

    return success(res, { record }, "Checked out successfully");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/attendance/history ─────────────────────────────────────────────
const getHistory = async (req, res, next) => {
  try {
    const records = await Attendance.find({ studentId: req.user._id })
      .populate("sessionId", "subject facultyName startedAt")
      .sort({ createdAt: -1 });

    return success(res, { records }, "Attendance history");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/attendance/student/:id ─────────────────────────────────────────
const getStudentAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ studentId: req.params.id })
      .populate("sessionId", "subject facultyName startedAt")
      .sort({ createdAt: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;

    return success(
      res,
      {
        records,
        summary: {
          total,
          present,
          absent: total - present,
          percentage: total ? Math.round((present / total) * 100) : 0,
        },
      },
      "Student attendance"
    );
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/attendance/session/:id ─────────────────────────────────────────
const getSessionAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ sessionId: req.params.id })
      .populate("studentId", "name email rollNo department")
      .sort({ checkIn: 1 });

    return success(res, { records, count: records.length }, "Session attendance");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/attendance/report ──────────────────────────────────────────────
const getReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department, studentId } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }
    if (studentId) filter.studentId = studentId;

    let records = await Attendance.find(filter)
      .populate("studentId", "name email rollNo department")
      .populate("sessionId", "subject facultyName")
      .sort({ date: -1 });

    if (department) {
      records = records.filter((r) => r.studentId?.department === department);
    }

    return success(res, { records, count: records.length }, "Attendance report");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  markAttendance,
  checkIn,
  checkOut,
  getHistory,
  getStudentAttendance,
  getSessionAttendance,
  getReport,
};
