const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");

// CREATE TASK
router.post("/", auth, taskController.createTask);

// GET TASKS
router.get("/", auth, taskController.getTasks);

// UPDATE TASK
router.put("/:id", auth, taskController.updateTask);

// DELETE TASK
router.delete("/:id", auth, taskController.deleteTask);

// GET TEAMS BY PROJECT
router.get("/teams-by-project/:project_id", auth, taskController.getTeamsByProject);

module.exports = router;