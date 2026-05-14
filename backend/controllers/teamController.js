// controllers/teamController.js
const pool = require("../config/db");

// CREATE TEAM — now with project_id + max_members
exports.createTeam = async (req, res) => {
  try {
    const { name, project_id, max_members } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ message: "Team name required" });
    if (!project_id) return res.status(400).json({ message: "Project is required" });

    // Make sure the project belongs to this user
    const proj = await pool.query(
      `SELECT id FROM projects WHERE id=$1 AND user_id=$2`,
      [project_id, userId]
    );
    if (!proj.rows.length)
      return res.status(403).json({ message: "Project not found or not yours" });

    const team = await pool.query(
      `INSERT INTO teams (name, project_id, created_by, max_members)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, project_id, userId, max_members || 10]
    );

    const teamId = team.rows[0].id;

    // Creator auto-joins as admin
    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,'admin')`,
      [teamId, userId]
    );

    res.json(team.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET TEAMS — with project name + member count
exports.getTeams = async (req, res) => {
  try {
    const userId = req.user.id;

   const teams = await pool.query(
  `SELECT 
  t.id,
  t.name,
  t.project_id,
  p.name AS project_name,
  t.created_at,
  t.max_members,
  u.name AS leader_name,
  COUNT(tm2.user_id) AS member_count
FROM teams t
LEFT JOIN projects p ON p.id = t.project_id
LEFT JOIN users u ON u.id = t.created_by
LEFT JOIN team_members tm2 ON tm2.team_id = t.id
JOIN team_members tm ON tm.team_id = t.id
WHERE tm.user_id = $1
GROUP BY 
  t.id,
  t.name,
  t.project_id,
  p.name,
  t.created_at,
  t.max_members,
  u.name
ORDER BY t.created_at DESC`,
  [userId]
);

    res.json(teams.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE TEAM + MEMBERS (only members who accepted invite)
exports.getTeamById = async (req, res) => {
  try {
    const team = await pool.query(
      `SELECT t.*, p.name AS project_name
       FROM teams t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    const members = await pool.query(
      `SELECT u.id, u.name, u.email, tm.role
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1`,
      [req.params.id]
    );

    res.json({ ...team.rows[0], members: members.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE TEAM
exports.deleteTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const check = await pool.query(
      `SELECT id FROM teams WHERE id=$1 AND created_by=$2`,
      [req.params.id, userId]
    );
    if (!check.rows.length)
      return res.status(403).json({ message: "Not authorized" });

    await pool.query(`DELETE FROM teams WHERE id=$1`, [req.params.id]);
    res.json({ message: "Team deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SEND INVITE
exports.sendInvite = async (req, res) => {
  try {
    const { team_id, email, message } = req.body;
    const senderId = req.user.id;

    // Find recipient
    const recipient = await pool.query(
      `SELECT id, name FROM users WHERE email=$1`, [email]
    );
    if (!recipient.rows.length)
      return res.status(404).json({ message: "No user found with that email" });

    const recipientId = recipient.rows[0].id;

    // Check max_members
    const team = await pool.query(`SELECT * FROM teams WHERE id=$1`, [team_id]);
    const memberCount = await pool.query(
      `SELECT COUNT(*) FROM team_members WHERE team_id=$1`, [team_id]
    );
    const count = parseInt(memberCount.rows[0].count);
const max = parseInt(team.rows[0].max_members);

if (count >= max)
  return res.status(400).json({ message: "Team is full" });

    // Already a member?
    const already = await pool.query(
      `SELECT id FROM team_members WHERE team_id=$1 AND user_id=$2`,
      [team_id, recipientId]
    );
    if (already.rows.length)
      return res.status(400).json({ message: "User is already in this team" });

    // Create invite
    const invite = await pool.query(
      `INSERT INTO team_invites (team_id, sender_id, recipient_id, status)
       VALUES ($1,$2,$3,'pending') RETURNING *`,
      [team_id, senderId, recipientId]
    );

    // Notification for recipient
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, invite_id, team_id, sender_id)
       VALUES ($1,'team_invite',$2,$3,$4,$5)`,
      [
        recipientId,
        message || `You've been invited to join team`,
        invite.rows[0].id,
        team_id,
        senderId,
      ]
    );

    // Notification for sender (sent copy)
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, invite_id, team_id, sender_id, direction)
       VALUES ($1,'team_invite',$2,$3,$4,$5,'sent')`,
      [
        senderId,
        `Invite sent to ${email}`,
        invite.rows[0].id,
        team_id,
        senderId,
      ]
    );

    res.json({ message: "Invite sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RESPOND TO INVITE
exports.respondToInvite = async (req, res) => {
  try {
    const { invite_id, action } = req.body;
    const userId = req.user.id;

    const invite = await pool.query(
      `SELECT * FROM team_invites WHERE id=$1 AND recipient_id=$2`,
      [invite_id, userId]
    );
    if (!invite.rows.length)
      return res.status(404).json({ message: "Invite not found" });

    await pool.query(
      `UPDATE team_invites SET status=$1 WHERE id=$2`,
      [action === "accept" ? "accepted" : "declined", invite_id]
    );

    if (action === "accept") {
      await pool.query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,'member')
         ON CONFLICT DO NOTHING`,
        [invite.rows[0].team_id, userId]
      );
    }

   await pool.query(
  `UPDATE notifications
   SET is_read = true
   WHERE invite_id = $1 AND user_id = $2`,
  [invite_id, userId]
);
    res.json({
  message: `Invite ${action}ed`,
  status: action === "accept" ? "accepted" : "declined"
});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};