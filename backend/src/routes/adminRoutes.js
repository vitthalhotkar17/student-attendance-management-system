const router = require("express").Router();
const {
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
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorise } = require("../middleware/roleMiddleware");
const { uploadFace } = require("../middleware/uploadMiddleware");

// All admin routes require authentication + admin role
router.use(protect, authorise("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// Users (generic)
router.get("/users", getUsers);
router.delete("/user/:id", deleteUser);

// Students
router.post("/students", uploadFace.single("faceFile"), registerStudent);
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
router.put("/students/:id", updateStudent);
router.post("/students/:id/reset-password", resetStudentPassword);

// Faculty
router.post("/faculty", registerFaculty);
router.get("/faculty", getFaculty);
router.get("/faculty/:id", getFacultyById);
router.put("/faculty/:id", updateFaculty);
router.post("/faculty/:id/reset-password", resetFacultyPassword);

// Attendance (admin read)
router.get("/attendance", getAllAttendance);
router.get("/attendance/:id", getAttendanceById);

module.exports = router;
