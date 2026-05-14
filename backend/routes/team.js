// routes/teamRoutes.js
// ⚠️  CRITICAL: specific routes MUST come BEFORE /:id
//     Express matches top-to-bottom — if /:id is first,
//     it will catch "invite" and "invite/respond" as IDs.

const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth"); // your JWT middleware
const {
  createTeam,
  getTeams,
  getTeamById,
  deleteTeam,
  sendInvite,
  respondToInvite,
} = require("../controllers/teamController");

router.post("/",                 auth, createTeam);
router.get("/",                  auth, getTeams);

// ── specific named routes first ──────────────────────────────
router.post("/invite",           auth, sendInvite);
router.post("/invite/respond",   auth, respondToInvite);

// ── parameterized route last ─────────────────────────────────
router.get("/:id",               auth, getTeamById);
router.delete("/:id",            auth, deleteTeam);

module.exports = router;