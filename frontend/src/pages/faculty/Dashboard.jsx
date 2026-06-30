import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { assignmentService } from "../../services/assignmentService.js";
import { attendanceService } from "../../services/attendanceService.js";
import { Activity, Users, ClipboardCheck, ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (user?.name) {
      setSubjects(assignmentService.getSubjectsForFaculty(user.name));
    }

    const loadRecentAttendance = async () => {
      const [sessions, records] = await Promise.all([
        attendanceService.listSessions(),
        attendanceService.listAttendance(),
      ]);

      const facultySessionIds = new Set(
        sessions
          .filter((session) => session.facultyId === user?.id || session.facultyName === user?.name)
          .map((session) => session.id)
      );

      setRecent(records.filter((record) => facultySessionIds.has(record.sessionId)).slice(0, 6));
    };

    loadRecentAttendance();
  }, [user?.id, user?.name]);

  const stats = [
    { label: "Assigned Subjects", value: subjects.length, icon: ClipboardCheck, color: "#6366f1" },
    { label: "Session Status",    value: subjects.length > 0 ? "Ready" : "None", icon: Activity, color: "#10b981" },
    { label: "Teaching Load",     value: subjects.length, icon: Users, color: "#f59e0b" },
  ];

  return (
    <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Hero */}
      <div className="hero-gradient" style={{ padding: "32px 36px" }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>Welcome back</p>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            {user?.name || "Faculty"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, marginBottom: 24 }}>
            {user?.department || "Faculty Department"} · {subjects.length} subject{subjects.length !== 1 ? "s" : ""} assigned
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/faculty/start-session" className="btn btn-primary">
              <PlayCircle size={15} /> Start Session <ArrowRight size={14} />
            </Link>
            <Link to="/faculty/students" className="btn btn-secondary">
              <Users size={14} /> View Students
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} className="card card-hover" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${s.color}15` }} />
            <div style={{ width: 42, height: 42, borderRadius: 10, background: `${s.color}15`, display: "grid", placeItems: "center", marginBottom: 16 }}>
              <s.icon size={19} color={s.color} />
            </div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text)" }}>{s.value}</p>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 5 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Assigned subjects */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Assigned Subjects</p>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>Subjects currently assigned to your profile</p>
          </div>
          <Link to="/faculty/start-session" className="btn btn-primary btn-sm">+ Start Session</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {subjects.length > 0 ? subjects.map((subj) => (
            <div key={subj} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{subj}</p>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Active · Click to start</p>
              </div>
              <span className="chip chip-green">Live</span>
            </div>
          )) : (
            <div style={{ background: "var(--surface2)", border: "1px dashed var(--border2)", borderRadius: 12, padding: "24px 20px", color: "var(--muted)", fontSize: 13 }}>
              No subjects assigned yet. Contact the administrator.
            </div>
          )}
        </div>
      </div>

      {/* Recent attendance */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Recent Attendance</p>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>Latest students who checked in during your sessions</p>
          </div>
          <Link to="/faculty/reports" className="btn btn-ghost btn-sm">View reports</Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table-base" style={{ width: "100%" }}>
            <thead>
              <tr><th>Student</th><th>Session</th><th>Face</th><th>Time</th></tr>
            </thead>
            <tbody>
              {recent.length > 0 ? recent.map((record) => (
                <tr key={record.id}>
                  <td style={{ fontWeight: 600 }}>{record.studentName}</td>
                  <td style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 12 }}>{record.sessionId}</td>
                  <td>
                    <span className={`chip ${record.faceVerified ? "chip-green" : "chip-muted"}`}>
                      {record.faceVerified ? "✓ Verified" : "Pending"}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(record.timestamp).toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ padding: "32px 16px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                    No attendance records yet for your sessions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
