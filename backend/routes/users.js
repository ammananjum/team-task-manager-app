const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

router.put(
  "/profile",
  auth,
  upload.single("image"),
  userController.updateProfile
);

module.exports = router;