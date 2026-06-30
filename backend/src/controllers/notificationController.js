const Notification = require("../models/Notification");
const { success, error } = require("../utils/response");

// ─── POST /api/notifications  (admin only) ────────────────────────────────────
const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, targetStudents } = req.body;
    if (!title || !message) return error(res, "Title and message are required", 400);

    const notification = await Notification.create({
      title,
      message,
      type: type || "info",
      createdBy: req.user._id,
      targetStudents: targetStudents || [],
    });

    return success(res, { notification }, "Notification sent", 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/notifications  (student: own + broadcasts) ─────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let filter = { isActive: true };

    // Admin/faculty see all; students see only broadcasts or targeted to them
    if (role === "student") {
      filter.$or = [
        { targetStudents: { $size: 0 } },          // broadcast
        { targetStudents: userId },                  // targeted
      ];
    }

    const notifications = await Notification.find(filter)
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .limit(50);

    // Add unread flag for each notification
    const withReadStatus = notifications.map((n) => ({
      ...n.toObject(),
      isRead: n.readBy.includes(userId),
    }));

    const unreadCount = withReadStatus.filter((n) => !n.isRead).length;

    return success(res, { notifications: withReadStatus, unreadCount }, "Notifications fetched");
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/notifications/:id/read  ────────────────────────────────────────
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: userId },
    });
    return success(res, {}, "Marked as read");
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/notifications/read-all  ────────────────────────────────────────
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      { isActive: true },
      { $addToSet: { readBy: userId } }
    );
    return success(res, {}, "All notifications marked as read");
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/notifications/:id  (admin only) ─────────────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });
    if (!notif) return error(res, "Notification not found", 404);
    return success(res, {}, "Notification deleted");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
