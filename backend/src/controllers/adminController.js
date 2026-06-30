const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Session = require("../models/Session");
const { success, error } = require("../utils/response");
const generateToken = require("../utils/generateToken");
const { generateEmbedding } = require("../services/faceRecognitionService");
const path = require("path");

// ─── GET /api/admin/users ────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { role, department } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    const users = await User.find(filter).sort({ createdAt: -1 });
    return success(res, { users }, "Users fetched");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/attendance ───────────────────────────────────────────────
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, sessionId, studentId } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (sessionId) filter.sessionId = sessionId;
    if (studentId) filter.studentId = studentId;

    const records = await Attendance.find(filter)
      .populate("studentId", "name email rollNo department")
      .populate("sessionId", "subject facultyName startedAt")
      .sort({ createdAt: -1 });

    return success(res, { records }, "Attendance fetched");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/attendance/:id ──────────────────────────────────────────
const getAttendanceById = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate("studentId", "name email rollNo department")
      .populate("sessionId", "subject facultyName startedAt");

    if (!record) return error(res, "Attendance record not found", 404);
    return success(res, { record }, "Record fetched");
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/admin/user/:id ──────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, "User not found", 404);
    if (user.role === "admin") return error(res, "Cannot delete admin account", 403);
    await User.findByIdAndDelete(req.params.id);
    return success(res, {}, "User deleted");
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/students ────────────────────────────────────────────────
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, rollNo, department, year, contact, faceImageBase64 } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return error(res, "Email already registered", 409);

    let embeddings = [];
    let faceImage = null;

    if (faceImageBase64) {
      const images = Array.isArray(faceImageBase64) ? faceImageBase64 : [faceImageBase64];
      embeddings = images.map((img) => generateEmbedding(img));
      faceImage = images[0].substring(0, 50) + "...";
    }

    if (req.file) {
      const filePath = `/uploads/faces/${req.file.filename}`;
      faceImage = filePath;
      const fs = require("fs");
      const fileBuffer = fs.readFileSync(req.file.path);
      const b64 = fileBuffer.toString("base64");
      embeddings = [generateEmbedding(b64)];
    }

    const student = await User.create({
      name,
      email,
      password: password || "student123",
      role: "student",
      rollNo,
      department,
      contact: contact || "N/A",
      year: year ? parseInt(year) : undefined,
      faceImage,
      faceEmbeddings: embeddings,
    });

    return success(res, { student }, "Student registered", 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/students ─────────────────────────────────────────────────
const getStudents = async (req, res, next) => {
  try {
    const { department } = req.query;
    const filter = { role: "student" };
    if (department) filter.department = department;
    const students = await User.find(filter).sort({ name: 1 });
    return success(res, { students }, "Students fetched");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/students/:id ─────────────────────────────────────────────
const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: "student" });
    if (!student) return error(res, "Student not found", 404);
    return success(res, { student }, "Student fetched");
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/admin/students/:id ─────────────────────────────────────────────
const updateStudent = async (req, res, next) => {
  try {
    const { name, email, rollNo, department, year, contact, isActive } = req.body;
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: "student" },
      { name, email, rollNo, department, year, contact, isActive },
      { new: true, runValidators: true }
    );
    if (!student) return error(res, "Student not found", 404);
    return success(res, { student }, "Student updated");
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/faculty ──────────────────────────────────────────────────
const registerFaculty = async (req, res, next) => {
  try {
    const { name, email, password, department, employeeId, contact } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return error(res, "Email already registered", 409);

    const faculty = await User.create({
      name,
      email,
      password: password || "faculty123",
      role: "faculty",
      department,
      employeeId,
      contact: contact || "N/A",
    });

    return success(res, { faculty }, "Faculty registered", 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/faculty ───────────────────────────────────────────────────
const getFaculty = async (req, res, next) => {
  try {
    const faculty = await User.find({ role: "faculty" }).sort({ name: 1 });
    return success(res, { faculty }, "Faculty fetched");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/faculty/:id ───────────────────────────────────────────────
const getFacultyById = async (req, res, next) => {
  try {
    const f = await User.findOne({ _id: req.params.id, role: "faculty" });
    if (!f) return error(res, "Faculty not found", 404);
    return success(res, { faculty: f }, "Faculty fetched");
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/admin/faculty/:id ───────────────────────────────────────────────
const updateFaculty = async (req, res, next) => {
  try {
    const { name, email, department, employeeId, contact, isActive } = req.body;
    const faculty = await User.findOneAndUpdate(
      { _id: req.params.id, role: "faculty" },
      { name, email, department, employeeId, contact, isActive },
      { new: true, runValidators: true }
    );
    if (!faculty) return error(res, "Faculty not found", 404);
    return success(res, { faculty }, "Faculty updated");
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/faculty/:id/reset-password ──────────────────────────────
const resetFacultyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return error(res, "Password must be at least 6 characters", 400);

    const faculty = await User.findOne({ _id: req.params.id, role: "faculty" }).select("+password");
    if (!faculty) return error(res, "Faculty not found", 404);

    faculty.password = password;
    await faculty.save();
    return success(res, {}, "Faculty password reset");
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/students/:id/reset-password ─────────────────────────────
const resetStudentPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return error(res, "Password must be at least 6 characters", 400);

    const student = await User.findOne({ _id: req.params.id, role: "student" }).select("+password");
    if (!student) return error(res, "Student not found", 404);

    student.password = password;
    await student.save();
    return success(res, {}, "Student password reset");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const [totalStudents, totalFaculty, totalSessions, totalAttendance] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      Session.countDocuments(),
      Attendance.countDocuments(),
    ]);

    const recentSessions = await Session.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("facultyId", "name");

    return success(
      res,
      { totalStudents, totalFaculty, totalSessions, totalAttendance, recentSessions },
      "Admin dashboard"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  getAllAttendance,
  getAttendanceById,
  deleteUser,
  registerStudent,
  getStudents,
  getStudentById,
  updateStudent,
  registerFaculty,
  getFaculty,
  getFacultyById,
  updateFaculty,
  resetFacultyPassword,
  resetStudentPassword,
  getDashboard,
};
