const mongoose = require("mongoose");

/**
 * Session — an attendance window opened by a faculty member for a subject.
 * Students mark attendance against an active session.
 */
const sessionSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facultyName: { type: String },
    subject: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },   // auto-computed on creation
    endedAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
    // GPS anchor — set when faculty starts the session
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    radius: { type: Number, default: 500 },       // metres
  },
  { timestamps: true }
);

sessionSchema.index({ active: 1 });
sessionSchema.index({ facultyId: 1 });
sessionSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Session", sessionSchema);
