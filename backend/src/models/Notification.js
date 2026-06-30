const mongoose = require("mongoose");

/**
 * Notification — admin broadcasts to students.
 */
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["info", "warning", "success", "alert"],
      default: "info",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional: target specific students; empty = broadcast to all
    targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Track who has read this notification
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isActive: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
