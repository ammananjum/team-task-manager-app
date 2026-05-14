const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const connectPgSimple = require("connect-pg-simple")(session);
const pool = require("./config/db");
const path = require("path");
const fs = require("fs");

require("dotenv").config();
require("./config/passport")(passport);

const app = express();

// ─────────────────────────────────────────────
// Ensure upload folders exist (VERY IMPORTANT)
// ─────────────────────────────────────────────
const uploadDir = path.join(__dirname, "uploads/avatars");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const teamRoutes = require("./routes/team");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/users");
const projectRoutes = require("./routes/project");
const notificationRoutes = require("./routes/notifications");
// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // good for forms

// ─────────────────────────────────────────────
// Session (PostgreSQL store)
// ─────────────────────────────────────────────
app.use(
  session({
    store: new connectPgSimple({ pool }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set true in production (HTTPS)
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
  })
);

// ─────────────────────────────────────────────
// Passport
// ─────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);
app.use("/notifications", notificationRoutes);

// ─────────────────────────────────────────────
// Static Files (uploads)
// ─────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─────────────────────────────────────────────
// Test route
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Backend running ");
});

module.exports = app;