const Assignment = require("../models/Assignment");
const User = require("../models/User");
const { success, error } = require("../utils/response");

// ─── POST /api/assignments ────────────────────────────────────────────────────
// Create or replace the subject list for a faculty member
const createAssignment = async (req, res, next) => {
  try {
    const { facultyId, subjects } = req.body;
    if (!facultyId || !subjects?.length) {
      return error(res, "facultyId and subjects[] are required", 400);
    }

    const faculty = await User.findOne({ _id: facultyId, role: "faculty" });
    if (!faculty) return error(res, "Faculty not found", 404);

    const assignment = await Assignment.findOneAndUpdate(
      { facultyId },
      { facultyId, subjects },
      { upsert: true, new: true, runValidators: true }
    );

    return success(res, { assignment }, "Assignment saved", 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/assignments ─────────────────────────────────────────────────────
const getAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find()
      .populate("facultyId", "name email department");
    return success(res, { assignments }, "Assignments fetched");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/assignments/faculty/:id ────────────────────────────────────────
// Get subjects assigned to a specific faculty (called by faculty on login)
const getAssignmentByFaculty = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ facultyId: req.params.id });
    return success(
      res,
      { subjects: assignment?.subjects || [] },
      "Faculty subjects fetched"
    );
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/assignments/:id ──────────────────────────────────────────────
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return error(res, "Assignment not found", 404);
    return success(res, {}, "Assignment deleted");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentByFaculty,
  deleteAssignment,
};
