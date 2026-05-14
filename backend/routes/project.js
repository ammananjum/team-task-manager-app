const express = require("express");
const {
  getProjects,
  createProject,
  updateProject,   // ← add this
  deleteProject,
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.use(authMiddleware);

router.get("/",      getProjects);
router.post("/",     createProject);
router.put("/:id",   updateProject);   // ← add this
router.delete("/:id", deleteProject);

module.exports = router;