import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";
import logoImg from "../assets/image/logo.png";
import {
  ChevronDown, Bell, X, Check, Plus, Users, Briefcase,
  CheckSquare, User, LayoutDashboard, Pencil, Trash2, Mail,
} from "lucide-react";
import SectionHead from "../components/ui/SectionHead";
import FormCard   from "../components/ui/FormCard";
import Label      from "../components/ui/Label";
import Input      from "../components/ui/Input";
import Textarea   from "../components/ui/Textarea";
import Select     from "../components/ui/Select";
import ErrorMsg   from "../components/ui/ErrorMsg";
import BtnCharcoal from "../components/ui/BtnCharcoal";
import ListCard   from "../components/ui/ListCard";

/* ─── shared table styles ─────────────────────────────────── */
const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  fontSize: "0.875rem",
  background: "#FFFFFF",
  borderRadius: 14,
  overflow: "hidden",
  boxShadow: "0 2px 16px rgba(45,45,45,0.10)",
  border: "1px solid #DDD9CF",
};

const thStyle = {
  background: "#2B2B2B",
  color: "#D6D0BE",
  fontWeight: 700,
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  padding: "0.85rem 1rem",
  textAlign: "left",
  borderBottom: "2px solid #1A1A1A",
};

const tdStyle = {
  padding: "0.9rem 1rem",
  borderBottom: "1px solid #EDE9DF",
  color: "#2D2D2D",
  verticalAlign: "middle",
  background: "transparent",
};

const trHover = {
  transition: "background 0.12s",
};

function TableRow({ children, style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...trHover, background: hovered ? "#F6F1E6" : "#FFFFFF", ...style }}
    >
      {children}
    </tr>
  );
}

/* ─── toast ───────────────────────────────────────────────── */
function Toast({ msg }) {
  return msg ? (
    <div style={{
      position: "fixed", bottom: 28, right: 28, background: "#2B2B2B",
      color: "#D6D0BE", padding: "0.6rem 1.2rem", borderRadius: 10,
      fontSize: "0.82rem", fontWeight: 600, zIndex: 9999,
      boxShadow: "0 4px 20px rgba(0,0,0,0.18)", pointerEvents: "none",
      animation: "fadeUp 0.2s ease",
    }}>
      {msg}
    </div>
  ) : null;
}

/* ─── badges ──────────────────────────────────────────────── */
const statusBadge = (s) => {
  const map = {
    todo:        { bg: "#EEEEE8", color: "#686860", label: "To Do" },
    in_progress: { bg: "#E5EDFD", color: "#2855B8", label: "In Progress" },
    review:      { bg: "#FEF3CD", color: "#8A6800", label: "Review" },
    done:        { bg: "#D5F0DF", color: "#1A7A45", label: "Done" },
  };
  const v = map[s] || map.todo;
  return <span style={{ background: v.bg, color: v.color, fontSize: 11, fontWeight: 700,
    padding: "2px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>{v.label}</span>;
};

const priorityBadge = (p) => {
  const map = { low: ["#EEEEE8","#77776E"], medium: ["#FEF0DE","#9A5900"], high: ["#FDECEC","#B52A1C"] };
  const [bg, color] = map[p] || map.medium;
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 700,
    padding: "2px 10px", borderRadius: 99, textTransform: "capitalize" }}>{p}</span>;
};

const roleBadge = (r) => (
  <span style={{
    fontSize: 10, fontWeight: 700,
    background: r === "admin" ? "#FEF3CD" : "#E5EDFD",
    color: r === "admin" ? "#8A6800" : "#2855B8",
    padding: "2px 8px", borderRadius: 99, textTransform: "capitalize",
  }}>{r}</span>
);

/* ─── time ago helper ─────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function IconBtn({ onClick, color = "#C0392B", children }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h ? "#FEF0EE" : "none", border: "none",
        cursor: "pointer", color, padding: "5px 7px", borderRadius: 7,
        display: "inline-flex", alignItems: "center", transition: "background 0.13s" }}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  })();

  const [userData,      setUserData]      = useState(storedUser);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [toast,         setToast]         = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2400); };

  const [projects,      setProjects]      = useState([]);
  const [teams,         setTeams]         = useState([]);
  const [tasks,         setTasks]         = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [profileFile,     setProfileFile]     = useState(null);
  const [profilePic,      setProfilePic]      = useState(
    storedUser?.image ? `https://backendzip--azoha7945.replit.app${storedUser.image}` : logoImg
  );
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [openNotifMenu,   setOpenNotifMenu]   = useState(false);
  const [profileName,     setProfileName]     = useState(storedUser?.name || "");
  const profileRef = useRef(null);
  const notifRef   = useRef(null);

  // project forms
  const [projName,  setProjName]  = useState("");
  const [projDesc,  setProjDesc]  = useState("");
  const [projError, setProjError] = useState("");

  // team forms
  const [teamName,      setTeamName]      = useState("");
  const [teamProject,   setTeamProject]   = useState("");
  const [maxMembers,    setMaxMembers]     = useState(10);
  const [teamError,     setTeamError]     = useState("");
  const [inviteEmail,   setInviteEmail]   = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteTeamId,  setInviteTeamId]  = useState("");
  const [inviteMsg,     setInviteMsg]     = useState("");

  // task forms
  const [taskTitle,    setTaskTitle]    = useState("");
  const [taskDesc,     setTaskDesc]     = useState("");
  const [taskProject,  setTaskProject]  = useState("");
  const [taskTeam,     setTaskTeam]     = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDue,      setTaskDue]      = useState("");
  const [taskStatus,   setTaskStatus]   = useState("todo");
  const [taskError,    setTaskError]    = useState("");
  const [projectTeams, setProjectTeams] = useState([]);
  const [teamMembers,  setTeamMembers]  = useState([]);

  // task filters
  const [filterProject, setFilterProject] = useState("");
  const [filterTeam,    setFilterTeam]    = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [filterTeams,   setFilterTeams]   = useState([]);

  // members
  const [memberSearchProject, setMemberSearchProject] = useState("");
  const [memberSearchTeam,    setMemberSearchTeam]    = useState("");
  const [memberProjectTeams,  setMemberProjectTeams]  = useState([]);
  const [memberResults,       setMemberResults]       = useState([]);
  const [allTeamMembers,      setAllTeamMembers]      = useState({});

  // outside click
  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpenProfileMenu(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setOpenNotifMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { fetchProjects(); fetchTeams(); fetchTasks(); fetchNotifications(); }, []);

  // cascade: taskProject → teams
  useEffect(() => {
    if (!taskProject) { setProjectTeams([]); setTaskTeam(""); return; }
    api.get(`/tasks/teams-by-project/${taskProject}`)
      .then(r => setProjectTeams(r.data)).catch(() => setProjectTeams([]));
  }, [taskProject]);

  // cascade: taskTeam → members
  useEffect(() => {
    if (!taskTeam) { setTeamMembers([]); return; }
    api.get(`/teams/${taskTeam}`)
      .then(r => setTeamMembers(r.data.members || [])).catch(() => setTeamMembers([]));
  }, [taskTeam]);

  // filter cascade
  useEffect(() => {
    if (!filterProject) { setFilterTeams([]); setFilterTeam(""); return; }
    api.get(`/tasks/teams-by-project/${filterProject}`)
      .then(r => setFilterTeams(r.data)).catch(() => setFilterTeams([]));
  }, [filterProject]);

  // member search cascade
  useEffect(() => {
    if (!memberSearchProject) { setMemberProjectTeams([]); setMemberSearchTeam(""); setMemberResults([]); return; }
    api.get(`/tasks/teams-by-project/${memberSearchProject}`)
      .then(r => setMemberProjectTeams(r.data)).catch(() => setMemberProjectTeams([]));
  }, [memberSearchProject]);

  useEffect(() => {
    if (!memberSearchTeam) { setMemberResults([]); return; }
    api.get(`/teams/${memberSearchTeam}`)
      .then(r => setMemberResults(r.data.members || [])).catch(() => setMemberResults([]));
  }, [memberSearchTeam]);

  // load all team members for members section overview
  useEffect(() => {
    if (activeSection !== "members" || teams.length === 0) return;
    teams.forEach(team => {
      api.get(`/teams/${team.id}`)
        .then(r => setAllTeamMembers(prev => ({ ...prev, [team.id]: r.data.members || [] })))
        .catch(() => {});
    });
  }, [activeSection, teams]);

  const fetchProjects      = () => api.get("/projects").then(r => setProjects(r.data)).catch(() => {});
  const fetchTeams         = () => api.get("/teams").then(r => setTeams(r.data)).catch(() => {});
  const fetchTasks         = () => api.get("/tasks").then(r => setTasks(r.data)).catch(() => {});
  const fetchNotifications = () => api.get("/notifications").then(r => setNotifications(r.data)).catch(() => {});

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── Only show teams where the logged-in user is the leader ──
  // Supports both leader_id comparison and leader_name fallback
  const leaderTeams = teams.filter(t =>
    (t.leader_id != null && t.leader_id === userData?.id) ||
    (t.leader_id == null && t.leader_name === userData?.name)
  );

  // profile auto-save
  const saveProfile = useCallback(async (nameVal, fileVal) => {
    try {
      const fd = new FormData();
      fd.append("name", nameVal);
      if (fileVal) fd.append("image", fileVal);
      const res = await api.put("/users/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const updated = res.data.user;
      const newUser = { ...storedUser, ...updated };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUserData(newUser);
      if (updated.image) setProfilePic(`https://backendzip--azoha7945.replit.app${updated.image}`);
      showToast("✓ Profile saved");
    } catch { showToast("Failed to save"); }
  }, [storedUser]);

  const handleNameBlur = () => saveProfile(profileName, profileFile);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileFile(file);
    setProfilePic(URL.createObjectURL(file));
    saveProfile(profileName, file);
  };

  // projects
  const createProject = async () => {
    setProjError("");
    if (!projName.trim()) { setProjError("Project name is required"); return; }
    try {
      await api.post("/projects", { name: projName, description: projDesc });
      setProjName(""); setProjDesc(""); fetchProjects();
    } catch { setProjError("Failed to create project"); }
  };

  const saveProjectField = async (id, name, description) => {
    try { await api.put(`/projects/${id}`, { name, description }); fetchProjects(); showToast("✓ Project saved"); }
    catch { showToast("Failed to save project"); }
  };

  const deleteProject = async (id) => {
    try { await api.delete(`/projects/${id}`); fetchProjects(); }
    catch {}
  };

  // teams
  const createTeam = async () => {
    setTeamError("");
    if (!teamName.trim()) { setTeamError("Team name is required"); return; }
    if (!teamProject)     { setTeamError("Please select a project"); return; }
    try {
      await api.post("/teams", { name: teamName, project_id: teamProject, max_members: maxMembers });
      setTeamName(""); setTeamProject(""); setMaxMembers(10);
      fetchTeams();
    } catch (err) { setTeamError(err.response?.data?.message || "Failed to create team"); }
  };

  const deleteTeam = async (id) => {
    try { await api.delete(`/teams/${id}`); fetchTeams(); }
    catch {}
  };

  const sendInvite = async () => {
    setInviteMsg("");
    if (!inviteTeamId) { setInviteMsg("Please select a team"); return; }
    if (!inviteEmail)  { setInviteMsg("Email is required"); return; }
    try {
      await api.post("/teams/invite", {
        team_id: Number(inviteTeamId),
        email: inviteEmail.trim(),
        message: inviteMessage,
      });
      setInviteEmail(""); setInviteMessage(""); setInviteTeamId("");
      setInviteMsg("✓ Invite sent!");
      fetchNotifications();
    } catch (err) {
      setInviteMsg(err.response?.data?.message || "Failed to send invite");
    }
  };

  // tasks
  const createTask = async () => {
    setTaskError("");
    if (!taskTitle.trim()) { setTaskError("Task title is required"); return; }
    if (!taskTeam)         { setTaskError("Please select a team"); return; }
    try {
      await api.post("/tasks", {
        title: taskTitle, description: taskDesc, team_id: taskTeam,
        assigned_to: taskAssignee || null, priority: taskPriority,
        status: taskStatus, due_date: taskDue || null,
      });
      setTaskTitle(""); setTaskDesc(""); setTaskProject(""); setTaskTeam("");
      setTaskAssignee(""); setTaskPriority("medium"); setTaskStatus("todo"); setTaskDue("");
      fetchTasks();
    } catch { setTaskError("Failed to create task"); }
  };

  const deleteTask = async (id) => {
    try { await api.delete(`/tasks/${id}`); fetchTasks(); }
    catch {}
  };

  const updateTaskStatus = async (id, status) => {
    try { await api.put(`/tasks/${id}`, { status }); fetchTasks(); }
    catch {}
  };

  // notifications
  const markAllRead = async () => {
    try { await api.put("/notifications/read-all"); fetchNotifications(); }
    catch {}
  };

  const respondToInvite = async (notifId, inviteId, action) => {
    try {
      await api.post("/teams/invite/respond", { invite_id: inviteId, action });
      fetchNotifications(); fetchTeams();
      showToast(action === "accept" ? "✓ Joined team!" : "Invite declined");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to respond");
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterProject && String(t.project_id) !== String(filterProject)) return false;
    if (filterTeam    && String(t.team_id)    !== String(filterTeam))    return false;
    if (filterStatus  && t.status             !== filterStatus)           return false;
    return true;
  });

  const navItems = [
    { key: "dashboard",     label: "Dashboard",     icon: <LayoutDashboard size={18}/> },
    { key: "projects",      label: "Projects",      icon: <Briefcase size={18}/> },
    { key: "teams",         label: "Teams",         icon: <Users size={18}/> },
    { key: "tasks",         label: "Tasks",         icon: <CheckSquare size={18}/> },
    { key: "members",       label: "Members",       icon: <User size={18}/> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18}/>, badge: unreadCount },
    { key: "account",       label: "Account",       icon: <User size={18}/> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FAF8F3", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        * { box-sizing: border-box; }
        table { border-radius: 14px; overflow: hidden; }
      `}</style>
      <Toast msg={toast} />

      {/* SIDEBAR */}
      <aside style={{ width: 270, background: "#2B2B2B", position: "fixed", height: "100vh",
        display: "flex", flexDirection: "column", padding: "2rem 1.8rem", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginBottom: "2.5rem" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", border: "3px solid #D6D0BE", overflow: "hidden", flexShrink: 0 }}>
            <img src={logoImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 700, color: "#F6F1E6", margin: 0 }}>TaskFlow</h1>
            <p style={{ fontSize: "0.75rem", color: "#A09888", margin: 0 }}>Team Workspace</p>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
          {navItems.map(({ key, label, icon, badge }) => (
            <button key={key} onClick={() => setActiveSection(key)} style={{
              display: "flex", alignItems: "center", gap: "0.7rem",
              background: activeSection === key ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none", borderRadius: 8, padding: "0.65rem 0.9rem",
              color: activeSection === key ? "#F6F1E6" : "#A09888",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.88rem",
              letterSpacing: "0.06em", cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              position: "relative",
            }}
              onMouseEnter={e => { if (activeSection !== key) e.currentTarget.style.color = "#F6F1E6"; }}
              onMouseLeave={e => { if (activeSection !== key) e.currentTarget.style.color = "#A09888"; }}
            >
              {icon} {label}
              {badge > 0 && (
                <span style={{
                  marginLeft: "auto", background: "#C0392B", color: "#fff",
                  fontSize: "0.68rem", fontWeight: 700, borderRadius: 99,
                  minWidth: 18, height: 18, display: "inline-flex",
                  alignItems: "center", justifyContent: "center", padding: "0 5px",
                }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={() => { localStorage.removeItem("user"); window.location.href = "/"; }}
          style={{ background: "none", border: "none", color: "#E88080", fontFamily: "'DM Sans',sans-serif",
            fontWeight: 700, fontSize: "0.88rem", letterSpacing: "0.06em", cursor: "pointer",
            textAlign: "left", padding: "0.65rem 0.9rem", borderRadius: 8, transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#F6A0A0"}
          onMouseLeave={e => e.currentTarget.style.color = "#E88080"}
        >LOGOUT</button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 270, flex: 1, padding: "2rem 2.5rem", minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.9rem", marginBottom: "2rem" }}>
          {/* Bell with mini dropdown preview */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => setOpenNotifMenu(v => !v)}
              style={{
                background: "#fff", border: "1px solid #D8D4C8", borderRadius: "50%",
                width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative", boxShadow: "0 1px 6px rgba(45,45,45,0.08)",
              }}>
              <Bell size={18} color="#2D2D2D" />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: 5, right: 5,
                  width: 10, height: 10,
                  background: "#C0392B", borderRadius: "50%", border: "2px solid #fff",
                }} />
              )}
            </button>

            {openNotifMenu && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 10px)", width: 340,
                background: "#fff", border: "1px solid #D8D4C8", borderRadius: 16,
                boxShadow: "0 8px 40px rgba(45,45,45,0.16)", zIndex: 200, overflow: "hidden",
              }}>
                <div style={{
                  padding: "0.9rem 1.1rem", borderBottom: "1px solid #EDE9DF",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#2D2D2D" }}>
                    Notifications {unreadCount > 0 && (
                      <span style={{ background: "#C0392B", color: "#fff", fontSize: "0.65rem",
                        fontWeight: 700, borderRadius: 99, padding: "1px 6px", marginLeft: 6 }}>
                        {unreadCount}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => { setOpenNotifMenu(false); setActiveSection("notifications"); }}
                    style={{ background: "none", border: "none", color: "#5B35C4", fontSize: "0.78rem",
                      fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    See all →
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p style={{ padding: "1.2rem", color: "#9A9A8E", fontSize: "0.85rem", textAlign: "center" }}>
                    No notifications yet
                  </p>
                ) : (
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {notifications.slice(0, 5).map(n => {
                      const isSent    = n.direction === "sent";
                      const isPending = n.invite_status === "pending";
                      return (
                        <div key={n.id} style={{
                          padding: "0.75rem 1.1rem", borderBottom: "1px solid #F5F2EC",
                          background: !n.is_read ? "#FDFBF5" : "transparent",
                          display: "flex", gap: "0.7rem", alignItems: "flex-start",
                        }}>
                          <div style={{ paddingTop: 5, flexShrink: 0 }}>
                            <div style={{
                              width: 7, height: 7, borderRadius: "50%",
                              background: !n.is_read ? "#C0392B" : "transparent",
                            }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "0.82rem", color: "#2D2D2D", margin: "0 0 2px",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {n.message}
                            </p>
                            <p style={{ fontSize: "0.72rem", color: "#9A9A8E", margin: "0 0 6px" }}>
                              {isSent
                                ? `→ ${n.recipient_name || n.recipient_email || "?"} · ${n.team_name || ""}`
                                : `From: ${n.sender_name || "?"} · ${n.team_name || ""}`}
                            </p>
                            {n.type === "team_invite" && !isSent && isPending && (
                              <div style={{ display: "flex", gap: 5 }}>
                                <button
                                  onClick={() => { respondToInvite(n.id, n.invite_id, "accept"); setOpenNotifMenu(false); }}
                                  style={{ display: "flex", alignItems: "center", gap: 3,
                                    background: "#2B2B2B", color: "#D6D0BE", border: "none",
                                    borderRadius: 6, padding: "3px 10px", fontSize: "0.73rem",
                                    fontWeight: 700, cursor: "pointer" }}>
                                  <Check size={10}/> Accept
                                </button>
                                <button
                                  onClick={() => { respondToInvite(n.id, n.invite_id, "decline"); setOpenNotifMenu(false); }}
                                  style={{ display: "flex", alignItems: "center", gap: 3,
                                    background: "#FEF0EE", color: "#B52A1C",
                                    border: "1px solid #F5C6C0", borderRadius: 6,
                                    padding: "3px 10px", fontSize: "0.73rem",
                                    fontWeight: 700, cursor: "pointer" }}>
                                  <X size={10}/> Decline
                                </button>
                              </div>
                            )}
                            {n.type === "team_invite" && (n.invite_status === "accepted" || n.invite_status === "declined") && (
                              <span style={{ fontSize: "0.72rem", fontWeight: 700,
                                color: n.invite_status === "accepted" ? "#1A7A45" : "#B52A1C" }}>
                                {n.invite_status === "accepted" ? "✓ Accepted" : "✗ Declined"}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "#BCBBAF", whiteSpace: "nowrap", flexShrink: 0, paddingTop: 2 }}>
                            {timeAgo(n.created_at)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {notifications.length > 0 && (
                  <div style={{ padding: "0.6rem 1.1rem", borderTop: "1px solid #EDE9DF", textAlign: "center" }}>
                    <button
                      onClick={() => { setOpenNotifMenu(false); setActiveSection("notifications"); markAllRead(); }}
                      style={{ background: "none", border: "none", color: "#5B35C4",
                        fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif" }}>
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile pill */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <div onClick={() => setOpenProfileMenu(!openProfileMenu)} style={{
              display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer",
              background: "rgba(255,255,255,0.65)", padding: "0.35rem 0.9rem 0.35rem 0.4rem",
              borderRadius: 99, border: "1px solid #D8D4C8", boxShadow: "0 1px 6px rgba(45,45,45,0.07)" }}>
              <img src={profilePic} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
              <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#2D2D2D" }}>{userData?.name?.split(" ")[0]}</span>
              <ChevronDown size={16} color="#6B6B6B" />
            </div>
            {openProfileMenu && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", width: 200,
                background: "#fff", border: "1px solid #D8D4C8", borderRadius: 14,
                boxShadow: "0 8px 32px rgba(45,45,45,0.13)", zIndex: 100, overflow: "hidden" }}>
                {[["account","My Account"],["dashboard","Dashboard"]].map(([k,l]) => (
                  <button key={k} onClick={() => { setActiveSection(k); setOpenProfileMenu(false); }} style={{
                    display: "block", width: "100%", textAlign: "left", padding: "0.75rem 1.1rem",
                    background: "none", border: "none", fontFamily: "'DM Sans',sans-serif",
                    fontSize: "0.88rem", color: "#2D2D2D", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F6F1E6"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >{l}</button>
                ))}
                <hr style={{ border: "none", borderTop: "1px solid #EDE9DF", margin: 0 }} />
                <button onClick={() => { localStorage.removeItem("user"); window.location.href = "/"; }} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "0.75rem 1.1rem",
                  background: "none", border: "none", fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.88rem", color: "#C0392B", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FEF0EE"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* ══ DASHBOARD ══ */}
        {activeSection === "dashboard" && (
          <div>
            <SectionHead title={`Welcome back, ${userData?.name?.split(" ")[0]} 👋`} sub="Here's a quick overview of your workspace." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem", marginBottom: "2.5rem" }}>
              {[["Projects",projects.length,"#EDE8FE","#5B35C4"],["Teams",teams.length,"#E5EDFD","#2855B8"],["Tasks",tasks.length,"#D5F0DF","#1A7A45"]].map(([label,val,bg,color]) => (
                <div key={label} style={{ background: bg, borderRadius: 16, padding: "1.6rem 1.8rem" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color, marginBottom: 8 }}>{label}</p>
                  <p style={{ fontSize: "2.4rem", fontWeight: 700, color, fontFamily: "'Playfair Display',serif", margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>

            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase",
              letterSpacing: "0.06em", color: "#6B6B6B", marginBottom: "0.9rem" }}>Recent Tasks</p>

            {tasks.length === 0 ? (
              <p style={{ color: "#9A9A8E" }}>No tasks yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      {["Title","Project","Team","Status","Priority","Due Date"].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0,8).map(t => (
                      <TableRow key={t.id}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{t.title}</td>
                        <td style={tdStyle}>{t.project_name || <span style={{ color: "#BCBBAF" }}>—</span>}</td>
                        <td style={tdStyle}>{t.team_name || <span style={{ color: "#BCBBAF" }}>—</span>}</td>
                        <td style={tdStyle}>{statusBadge(t.status)}</td>
                        <td style={tdStyle}>{priorityBadge(t.priority)}</td>
                        <td style={{ ...tdStyle, fontSize: "0.82rem", color: "#6B6B6B" }}>
                          {t.due_date ? new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                      </TableRow>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ PROJECTS ══ */}
        {activeSection === "projects" && (
          <div>
            <SectionHead title="Projects" sub="Create and manage your projects." />
            <FormCard title="Create New Project">
              <div style={{ display: "grid", gap: "0.9rem" }}>
                <div><Label>Project name *</Label>
                  <Input placeholder="e.g. Website Redesign" value={projName} onChange={e => setProjName(e.target.value)} />
                </div>
                <div><Label>Description</Label>
                  <Textarea rows={2} placeholder="What is this project about?" value={projDesc} onChange={e => setProjDesc(e.target.value)} />
                </div>
                <ErrorMsg msg={projError} />
                <BtnCharcoal onClick={createProject}><Plus size={15}/> Create Project</BtnCharcoal>
              </div>
            </FormCard>

            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase",
              letterSpacing: "0.06em", color: "#6B6B6B", marginBottom: "0.9rem" }}>Your Projects ({projects.length})</p>

            {projects.length === 0 ? (
              <p style={{ color: "#9A9A8E" }}>No projects yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      {["Project Name","Description","Created","Actions"].map(h => (
                        <th key={h} style={h === "Actions" ? { ...thStyle, textAlign: "right" } : thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(p => (
                      <EditableProjectRow key={p.id} project={p} onSave={saveProjectField} onDelete={deleteProject} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ TEAMS ══ */}
        {activeSection === "teams" && (
          <div>
            <SectionHead title="Teams" sub="Create teams, set max members, and invite people by email." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>

              <FormCard title="Create New Team">
                <div style={{ display: "grid", gap: "0.85rem" }}>
                  <div><Label>Select Project *</Label>
                    <Select value={teamProject} onChange={e => setTeamProject(e.target.value)}>
                      <option value="">Choose a project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  </div>
                  <div><Label>Team name *</Label>
                    <Input placeholder="e.g. Frontend Dev" value={teamName} onChange={e => setTeamName(e.target.value)} />
                  </div>
                  <div><Label>Max members</Label>
                    <Input type="number" min={2} max={100} value={maxMembers} onChange={e => setMaxMembers(e.target.value)} />
                  </div>
                  <ErrorMsg msg={teamError} />
                  <BtnCharcoal onClick={createTeam}><Plus size={15}/> Create Team</BtnCharcoal>
                </div>
              </FormCard>

              {/* ── INVITE FORM — only shows teams where user is leader ── */}
              <FormCard title="Invite Member by Email">
                <div style={{ display: "grid", gap: "0.85rem" }}>
                  <div>
                    <Label>Select team *</Label>
                    {leaderTeams.length === 0 ? (
                      <p style={{
                        fontSize: "0.82rem", color: "#9A9A8E", fontStyle: "italic",
                        background: "#F6F3EC", border: "1px solid #E8E4DB",
                        borderRadius: 8, padding: "0.6rem 0.8rem", margin: 0,
                      }}>
                        You are not a leader of any team yet. Create a team first.
                      </p>
                    ) : (
                      <Select value={inviteTeamId} onChange={e => setInviteTeamId(e.target.value)}>
                        <option value="">Choose a team</option>
                        {leaderTeams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.project_name ? `${t.project_name} › ` : ""}{t.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                  <div><Label>Member email *</Label>
                    <Input type="email" placeholder="colleague@example.com" value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendInvite()}
                    />
                  </div>
                  <div><Label>Personal message (optional)</Label>
                    <Textarea rows={2} placeholder="Hi! I'd like you to join our team…" value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} />
                  </div>
                  {inviteMsg && (
                    <p style={{ fontSize: "0.83rem", color: inviteMsg.startsWith("✓") ? "#1A7A45" : "#B52A1C",
                      fontWeight: 600, margin: 0 }}>{inviteMsg}</p>
                  )}
                  <BtnCharcoal onClick={sendInvite} disabled={leaderTeams.length === 0}>
                    Send Invitation
                  </BtnCharcoal>
                </div>
              </FormCard>
            </div>

            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase",
              letterSpacing: "0.06em", color: "#6B6B6B", marginBottom: "0.9rem" }}>Your Teams ({teams.length})</p>

            {teams.length === 0 ? <p style={{ color: "#9A9A8E" }}>No teams yet.</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      {["Team Name","Project","Leader","Members","Actions"].map(h => (
                        <th key={h} style={h === "Actions" ? { ...thStyle, textAlign: "right" } : thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map(t => (
                      <TableRow key={t.id}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{t.name}</td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: 12, background: "#F3F0FF", color: "#5B35C4",
                            padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>
                            {t.project_name || "—"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {t.leader_name || "—"}
                            {(t.leader_id === userData?.id || t.leader_name === userData?.name) && (
                              <span style={{ fontSize: 10, fontWeight: 700, background: "#D5F0DF",
                                color: "#1A7A45", padding: "1px 7px", borderRadius: 99 }}>You</span>
                            )}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 600 }}>{t.member_count || 0}</span>
                          <span style={{ color: "#9A9A8E" }}> / {t.max_members || "∞"}</span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <IconBtn onClick={() => deleteTeam(t.id)}>
                            <Trash2 size={14}/>
                          </IconBtn>
                        </td>
                      </TableRow>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ TASKS ══ */}
        {activeSection === "tasks" && (
          <div>
            <SectionHead title="Tasks" sub="Select project → team → assign to a member who accepted the invite." />
            <FormCard title="Create New Task">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <Label>Task title *</Label>
                  <Input placeholder="What needs to be done?" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <Label>Description</Label>
                  <Textarea rows={2} placeholder="Optional details…" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                </div>

                <div>
                  <Label>Project *</Label>
                  <Select value={taskProject} onChange={e => { setTaskProject(e.target.value); setTaskTeam(""); setTaskAssignee(""); }}>
                    <option value="">Select project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Team *</Label>
                  <Select value={taskTeam} onChange={e => { setTaskTeam(e.target.value); setTaskAssignee(""); }}
                    disabled={!taskProject || projectTeams.length === 0}>
                    <option value="">{taskProject && projectTeams.length === 0 ? "No teams in this project" : "Select team"}</option>
                    {projectTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Assign to</Label>
                  <Select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}
                    disabled={!taskTeam || teamMembers.length === 0}>
                    <option value="">{taskTeam && teamMembers.length === 0 ? "No members yet" : "Unassigned"}</option>
                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={taskStatus} onChange={e => setTaskStatus(e.target.value)}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </Select>
                </div>
                <div>
                  <Label>Due date</Label>
                  <Input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.6rem" }}>
                  <ErrorMsg msg={taskError} />
                  <BtnCharcoal onClick={createTask} style={{ marginLeft: "auto" }}><Plus size={15}/> Create Task</BtnCharcoal>
                </div>
              </div>
            </FormCard>

            {/* Filters */}
            <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.2rem", flexWrap: "wrap", alignItems: "center" }}>
              <Select value={filterProject} onChange={e => { setFilterProject(e.target.value); setFilterTeam(""); }} style={{ width: "auto", minWidth: 160 }}>
                <option value="">All projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
              <Select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} style={{ width: "auto", minWidth: 160 }} disabled={!filterProject}>
                <option value="">All teams</option>
                {filterTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
              <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: "auto", minWidth: 140 }}>
                <option value="">All statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </Select>
              {(filterProject || filterTeam || filterStatus) && (
                <button onClick={() => { setFilterProject(""); setFilterTeam(""); setFilterStatus(""); }}
                  style={{ background: "none", border: "none", color: "#6B6B6B", cursor: "pointer", fontSize: "0.83rem", textDecoration: "underline" }}>
                  Clear filters
                </button>
              )}
            </div>

            <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase",
              letterSpacing: "0.06em", color: "#6B6B6B", marginBottom: "0.9rem" }}>Tasks ({filteredTasks.length})</p>

            {filteredTasks.length === 0 ? <p style={{ color: "#9A9A8E" }}>No tasks found.</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      {["Title","Project","Team","Assigned To","Priority","Status","Due Date","Actions"].map(h => (
                        <th key={h} style={h === "Actions" ? { ...thStyle, textAlign: "right" } : thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(t => (
                      <TableRow key={t.id}>
                        <td style={{ ...tdStyle, fontWeight: 600, maxWidth: 200 }}>
                          <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</span>
                        </td>
                        <td style={{ ...tdStyle, fontSize: "0.83rem" }}>{t.project_name || "—"}</td>
                        <td style={{ ...tdStyle, fontSize: "0.83rem" }}>{t.team_name || "—"}</td>
                        <td style={{ ...tdStyle, fontSize: "0.83rem" }}>{t.assigned_to_name || <span style={{ color: "#BCBBAF" }}>Unassigned</span>}</td>
                        <td style={tdStyle}>{priorityBadge(t.priority)}</td>
                        <td style={tdStyle}>
                          <Select value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value)}
                            style={{ width: "auto", fontSize: "0.8rem", padding: "0.3rem 0.5rem", minWidth: 110 }}>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </Select>
                        </td>
                        <td style={{ ...tdStyle, fontSize: "0.82rem", color: "#6B6B6B", whiteSpace: "nowrap" }}>
                          {t.due_date ? new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <IconBtn onClick={() => deleteTask(t.id)}>
                            <Trash2 size={14}/>
                          </IconBtn>
                        </td>
                      </TableRow>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ MEMBERS ══ */}
        {activeSection === "members" && (
          <div>
            <SectionHead title="Members" sub="Search by project and team, or browse all teams below." />

            <FormCard title="Search Members">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <Label>Project</Label>
                  <Select value={memberSearchProject} onChange={e => setMemberSearchProject(e.target.value)}>
                    <option value="">Select project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Team</Label>
                  <Select value={memberSearchTeam} onChange={e => setMemberSearchTeam(e.target.value)}
                    disabled={!memberSearchProject || memberProjectTeams.length === 0}>
                    <option value="">{memberSearchProject && memberProjectTeams.length === 0 ? "No teams" : "Select team"}</option>
                    {memberProjectTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </div>
              </div>
            </FormCard>

            {memberSearchTeam && (
              <>
                <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase",
                  letterSpacing: "0.06em", color: "#6B6B6B", marginBottom: "0.9rem" }}>
                  Members ({memberResults.length})
                </p>
                {memberResults.length === 0 ? (
                  <p style={{ color: "#9A9A8E" }}>No members in this team yet.</p>
                ) : (
                  <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          {["#","Name","Email","Role"].map(h => (
                            <th key={h} style={thStyle}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {memberResults.map((m, i) => (
                          <TableRow key={m.id}>
                            <td style={{ ...tdStyle, color: "#9A9A8E", width: 40 }}>{i + 1}</td>
                            <td style={tdStyle}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#2B2B2B",
                                  color: "#D6D0BE", display: "flex", alignItems: "center", justifyContent: "center",
                                  fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
                                  {m.name?.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600 }}>{m.name}</span>
                              </div>
                            </td>
                            <td style={{ ...tdStyle, fontSize: "0.83rem", color: "#6B6B6B" }}>{m.email}</td>
                            <td style={tdStyle}>{roleBadge(m.role)}</td>
                          </TableRow>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {!memberSearchTeam && teams.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {teams.map(team => {
                  const members = allTeamMembers[team.id] || [];
                  return (
                    <div key={team.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.8rem" }}>
                        <span style={{ background: "#EDE8FE", color: "#5B35C4", padding: "3px 12px",
                          borderRadius: 99, fontSize: "0.82rem", fontWeight: 700 }}>{team.name}</span>
                        {team.project_name && (
                          <span style={{ background: "#F3F0FF", color: "#5B35C4", padding: "2px 8px",
                            borderRadius: 99, fontSize: "0.75rem" }}>📁 {team.project_name}</span>
                        )}
                        <span style={{ color: "#9A9A8E", fontSize: "0.82rem" }}>
                          {members.length} member{members.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {members.length === 0 ? (
                        <p style={{ color: "#9A9A8E", fontSize: "0.85rem", paddingLeft: 4 }}>No members yet.</p>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table style={tableStyle}>
                            <thead>
                              <tr>
                                {["#","Name","Email","Role"].map(h => (
                                  <th key={h} style={thStyle}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {members.map((m, i) => (
                                <TableRow key={m.id}>
                                  <td style={{ ...tdStyle, color: "#9A9A8E", width: 40 }}>{i + 1}</td>
                                  <td style={tdStyle}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2B2B2B",
                                        color: "#D6D0BE", display: "flex", alignItems: "center", justifyContent: "center",
                                        fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                                        {m.name?.charAt(0).toUpperCase()}
                                      </div>
                                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                                    </div>
                                  </td>
                                  <td style={{ ...tdStyle, fontSize: "0.83rem", color: "#6B6B6B" }}>{m.email}</td>
                                  <td style={tdStyle}>{roleBadge(m.role)}</td>
                                </TableRow>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ NOTIFICATIONS ══ */}
        {activeSection === "notifications" && (
          <div>
            <SectionHead
              title="Notifications"
              sub="Team invitations and updates — accept or decline directly here."
            />

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              {unreadCount > 0 && (
                <span style={{ background: "#FDECEC", color: "#B52A1C", fontWeight: 700,
                  fontSize: "0.8rem", padding: "4px 14px", borderRadius: 99 }}>
                  {unreadCount} unread
                </span>
              )}
              {notifications.length > 0 && (
                <button onClick={markAllRead} style={{ background: "none", border: "none",
                  color: "#6B6B6B", fontSize: "0.82rem", cursor: "pointer", textDecoration: "underline",
                  fontFamily: "'DM Sans',sans-serif" }}>
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid #D8D4C8", borderRadius: 14,
                padding: "3rem", textAlign: "center" }}>
                <Bell size={32} color="#D8D4C8" style={{ marginBottom: 12 }} />
                <p style={{ color: "#9A9A8E", fontSize: "0.9rem", margin: 0 }}>No notifications yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {notifications.map(n => (
                  <NotifCard key={n.id} n={n} onRespond={respondToInvite} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ACCOUNT ══ */}
        {activeSection === "account" && (
          <div>
            <SectionHead title="Account Settings" sub="Changes are saved automatically when you click away." />
            <FormCard>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem", maxWidth: 400 }}>
                <div style={{ position: "relative" }}>
                  <img src={profilePic} style={{ width: 100, height: 100, borderRadius: "50%",
                    objectFit: "cover", border: "3px solid #D8D4C8" }} />
                  <label style={{ position: "absolute", bottom: 2, right: 2, background: "#2B2B2B",
                    borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", border: "2px solid #fff" }}>
                    <Pencil size={13} color="#D6D0BE" />
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                  </label>
                </div>
                <div style={{ width: "100%" }}>
                  <Label>Full name</Label>
                  <Input value={profileName} onChange={e => setProfileName(e.target.value)}
                    onBlur={handleNameBlur} placeholder="Your name" />
                  <p style={{ fontSize: "0.73rem", color: "#9A9A8E", marginTop: 4 }}>Saves automatically when you click away</p>
                </div>
                <div style={{ width: "100%" }}>
                  <Label>Email</Label>
                  <Input value={userData?.email || ""} disabled style={{ background: "#F0EDE4", cursor: "not-allowed" }} />
                </div>
              </div>
            </FormCard>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Editable Project Row ──────────────────────────────────── */
function EditableProjectRow({ project, onSave, onDelete }) {
  const [name, setName]       = useState(project.name);
  const [desc, setDesc]       = useState(project.description || "");
  const [editing, setEditing] = useState(false);

  const handleBlur = () => {
    if (name.trim() !== project.name || desc !== (project.description || "")) {
      onSave(project.id, name.trim() || project.name, desc);
    }
    setEditing(false);
  };

  return (
    <TableRow>
      <td style={{ ...tdStyle, fontWeight: 600, minWidth: 160 }}>
        {editing ? (
          <input value={name} onChange={e => setName(e.target.value)} onBlur={handleBlur} autoFocus
            style={{ width: "100%", fontWeight: 700, border: "none", borderBottom: "2px solid #2B2B2B",
              background: "transparent", outline: "none", fontFamily: "'DM Sans',sans-serif",
              fontSize: "0.875rem", color: "#2D2D2D" }} />
        ) : (
          <span onClick={() => setEditing(true)} style={{ cursor: "text" }}>{name}</span>
        )}
      </td>
      <td style={{ ...tdStyle, color: "#6B6B6B", minWidth: 200 }}>
        {editing ? (
          <input value={desc} onChange={e => setDesc(e.target.value)} onBlur={handleBlur}
            placeholder="Add description…"
            style={{ width: "100%", border: "none", borderBottom: "1px solid #D8D4C8",
              background: "transparent", outline: "none", fontFamily: "'DM Sans',sans-serif",
              fontSize: "0.83rem", color: "#6B6B6B" }} />
        ) : (
          <span onClick={() => setEditing(true)} style={{ cursor: "text", fontStyle: desc ? "normal" : "italic",
            color: desc ? "#6B6B6B" : "#BCBBAF" }}>
            {desc || "Click to add description…"}
          </span>
        )}
      </td>
      <td style={{ ...tdStyle, fontSize: "0.82rem", color: "#9A9A8E", whiteSpace: "nowrap" }}>
        {new Date(project.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </td>
      <td style={{ ...tdStyle, textAlign: "right" }}>
        <IconBtn onClick={() => setEditing(true)} color="#2855B8">
          <Pencil size={14}/>
        </IconBtn>
        <IconBtn onClick={() => onDelete(project.id)}>
          <Trash2 size={14}/>
        </IconBtn>
      </td>
    </TableRow>
  );
}

/* ── NotifCard ────────────────────────────────────────────── */
function NotifCard({ n, onRespond }) {
  const isInvite  = n.type === "team_invite";
  const isSent    = n.direction === "sent";
  const status    = n.invite_status ?? null;
  const inviteId  = n.invite_id ?? null;

  const [localStatus, setLocalStatus] = useState(status);
  const [loading,     setLoading]     = useState(false);

  const handle = async (action) => {
    if (!inviteId) {
      alert("Cannot respond: invite_id missing. Check your notifications API returns invite_id.");
      return;
    }
    setLoading(true);
    setLocalStatus(action === "accept" ? "accepted" : "declined");
    await onRespond(n.id, inviteId, action);
    setLoading(false);
  };

  const showButtons = isInvite && !isSent && (localStatus === "pending" || localStatus === null) && !loading;

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${!n.is_read ? "#C8B8F5" : "#D8D4C8"}`,
      borderLeft: `4px solid ${!n.is_read ? "#5B35C4" : "#D0CDCA"}`,
      borderRadius: 14,
      padding: "1.2rem 1.5rem",
      boxShadow: !n.is_read ? "0 2px 12px rgba(91,53,196,0.08)" : "0 1px 5px rgba(45,45,45,0.04)",
      display: "flex",
      alignItems: "flex-start",
      gap: "1rem",
    }}>

      <div style={{
        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
        background: isSent ? "#E5EDFD" : isInvite ? "#FEF3CD" : "#F0EDE4",
        display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
      }}>
        {isSent
          ? <Mail size={17} color="#2855B8" />
          : <Bell size={17} color="#8A6800" />
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.45rem", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            background: isSent ? "#E5EDFD" : "#FEF3CD",
            color:      isSent ? "#2855B8" : "#8A6800",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {isSent ? "Sent Invite" : "Team Invitation"}
          </span>

          {!n.is_read && (
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#C0392B",
              background: "#FDECEC", padding: "2px 7px", borderRadius: 99 }}>● New</span>
          )}

          {localStatus === "accepted" && (
            <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
              background: "#D5F0DF", color: "#1A7A45" }}>✓ Accepted</span>
          )}
          {localStatus === "declined" && (
            <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
              background: "#FDECEC", color: "#B52A1C" }}>✗ Declined</span>
          )}
        </div>

        <p style={{ fontSize: "0.9rem", color: "#2D2D2D", fontWeight: 500, lineHeight: 1.5, margin: "0 0 0.3rem" }}>
          {n.message}
        </p>

        <p style={{ fontSize: "0.76rem", color: "#6B6B6B", margin: "0 0 0.8rem" }}>
          {isSent
            ? <><strong>To:</strong> {n.recipient_name || n.recipient_email || "—"} &nbsp;·&nbsp; <strong>Team:</strong> {n.team_name || "—"}</>
            : <><strong>From:</strong> {n.sender_name || "—"} &nbsp;·&nbsp; <strong>Team:</strong> {n.team_name || "—"}</>
          }
        </p>

        {showButtons && (
          <div style={{ display: "flex", gap: "0.55rem" }}>
            <button onClick={() => handle("accept")}
              style={{ display: "flex", alignItems: "center", gap: 6,
                background: "#2B2B2B", color: "#D6D0BE", border: "none", borderRadius: 8,
                padding: "0.5rem 1.2rem", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#3D3D3D"}
              onMouseLeave={e => e.currentTarget.style.background = "#2B2B2B"}
            >
              <Check size={14} /> Accept Invite
            </button>
            <button onClick={() => handle("decline")}
              style={{ display: "flex", alignItems: "center", gap: 6,
                background: "#FEF0EE", color: "#B52A1C", border: "1px solid #F5C6C0",
                borderRadius: 8, padding: "0.5rem 1.1rem", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#FDE8E5"}
              onMouseLeave={e => e.currentTarget.style.background = "#FEF0EE"}
            >
              <X size={14} /> Decline
            </button>
          </div>
        )}

        {loading && (
          <p style={{ fontSize: "0.8rem", color: "#9A9A8E", fontStyle: "italic", margin: 0 }}>Saving…</p>
        )}
      </div>

      <div style={{ fontSize: "0.7rem", color: "#BCBBAF", whiteSpace: "nowrap",
        flexShrink: 0, textAlign: "right", lineHeight: 1.6 }}>
        {timeAgo(n.created_at)}<br />
        <span style={{ fontSize: "0.65rem" }}>
          {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  );
}
