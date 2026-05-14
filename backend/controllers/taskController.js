// controllers/taskController.js
const pool = require("../config/db");

// CREATE TASK — now with priority + status
exports.createTask = async (req, res) => {
  try {
    const { title, description, team_id, assigned_to, due_date, priority, status } = req.body;
    const created_by = req.user.id;

    const task = await pool.query(
      `INSERT INTO tasks
         (title, description, team_id, assigned_to, created_by, due_date, priority, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [title, description, team_id, assigned_to || null,
       created_by, due_date || null, priority || "medium", status || "todo"]
    );

    res.json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET TASKS — created by user OR assigned to user, with names
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await pool.query(
      `SELECT t.*,
              tm.name  AS team_name,
              p.name   AS project_name,
              u.name   AS assigned_to_name
       FROM tasks t
       LEFT JOIN teams    tm ON t.team_id     = tm.id
       LEFT JOIN projects p  ON tm.project_id = p.id
       LEFT JOIN users    u  ON t.assigned_to = u.id
       WHERE t.created_by = $1 OR t.assigned_to = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET TEAMS FOR A PROJECT (used in task form dropdown)
exports.getTeamsByProject = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized (no user)" });
    }

    const { project_id } = req.params;

    const teams = await pool.query(
      `SELECT t.id, t.name
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE t.project_id = $1 AND tm.user_id = $2`,
      [project_id, userId]
    );

    res.json(teams.rows);
  } catch (err) {
    console.error("TEAM ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
// UPDATE TASK (status + any field)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, title, description, due_date, assigned_to } = req.body;

    const task = await pool.query(
      `UPDATE tasks SET
         status      = COALESCE($1, status),
         priority    = COALESCE($2, priority),
         title       = COALESCE($3, title),
         description = COALESCE($4, description),
         due_date    = COALESCE($5, due_date),
         assigned_to = COALESCE($6, assigned_to)
       WHERE id = $7 RETURNING *`,
      [status, priority, title, description, due_date, assigned_to, id]
    );

    res.json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    await pool.query(`DELETE FROM tasks WHERE id=$1`, [req.params.id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

