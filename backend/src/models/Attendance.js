const mongoose = require("mongoose");

/**
 * Attendance — one record per student per session.
 * Stores face verification score, GPS coordinates, and timestamp.
 */
const attendanceSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: { type: String },
    subject: { type: String },                   // denormalised for fast reporting
    // Check-in info
    date: { type: String },                       // "YYYY-MM-DD" for easy grouping
    checkIn: { type: Date, default: Date.now },
    checkOut: { type: Date, default: null },
    // Face verification
    faceVerified: { type: Boolean, default: false },
    verificationScore: { type: Number, default: 0 },
    // GPS at mark time
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    // Status: Present / Absent / Late
    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      default: "Present",
    },
  },
  { timestamps: true }
);

// Prevent duplicate mark for same student in same session
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
