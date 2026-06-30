const router = require("express").Router();
const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const { authorise } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getNotifications);                                      // all roles
router.put("/read-all", markAllAsRead);                                 // all roles
router.put("/:id/read", markAsRead);                                    // all roles
router.post("/", authorise("admin"), createNotification);               // admin only
router.delete("/:id", authorise("admin"), deleteNotification);          // admin only

module.exports = router;
