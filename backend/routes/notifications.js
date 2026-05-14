const router = require("express").Router();
const controller = require("../controllers/notificationController");
const auth = require("../middleware/auth");

router.get("/", auth, controller.getNotifications);
router.put("/read-all", auth, controller.markAllRead);

module.exports = router;