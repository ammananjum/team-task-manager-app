const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("passport");

router.post("/register", authController.register);

router.post("/login", (req, res, next) => {
      console.log("LOGIN REQUEST BODY:", req.body);

  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json(err);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.logIn(user, (err) => {
      if (err) return res.status(500).json(err);

      return res.json({
        message: "Login successful",
        user,
      });
    });
  })(req, res, next);
});
module.exports = router;