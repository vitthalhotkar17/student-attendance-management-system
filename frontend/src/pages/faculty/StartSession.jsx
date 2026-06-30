import { useState, useEffect } from "react";
import { assignmentService } from "../../services/assignmentService.js";
import { attendanceService } from "../../services/attendanceService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PlayCircle, StopCircle, MapPin, BookOpen, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function StartSession() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState("");
  const [session, setSession]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [subs, active] = await Promise.all([
          assignmentService.getSubjectsForFaculty(user._id || user.id),
          attendanceService.getActiveSession(),
        ]);
        setSubjects(subs);
        if (active && (active.facultyId === (user._id || user.id) || active.facultyId?._id === (user._id || user.id))) {
          setSession(active);
          setSelected(active.subject);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setChecking(false);
      }
    };
    if (user) load();
  }, [user]);

  const handleStart = async () => {
    if (!selected) { toast.error("Please select a subject."); return; }
    setLoading(true);
    try {
      const existing = await attendanceService.getActiveSession();
      if (existing) { toast.error("A session is already active. Stop it first."); return; }
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(
          (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
          (e) => rej(e),
          { enableHighAccuracy: true, timeout: 10000 }
        )
      );
      const s = await attendanceService.startSession({ subject: selected, lat: pos.lat, lng: pos.lng });
      setSession(s);
      toast.success("Session started — students can now mark attendance!");
    } catch (err) { toast.error(err?.message || "Failed to start session"); }
    finally { setLoading(false); }
  };

  const handleStop = async () => {
    if (!session?._id) return;
    setLoading(true);
    try {
      await attendanceService.stopSession(session._id);
      toast.success("Session stopped.");
      setSession(null);
      setSelected("");
    } catch (err) { toast.error(err?.message || "Failed to stop session"); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-up" style={{ maxWidth: 700 }}>
      {/* Hero */}
      <div className="hero-gradient" style={{ padding: "28px 32px", marginBottom: 24 }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>Faculty · Session Control</p>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Start Attendance Session</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Your GPS location is captured when you start. Students must be within 500 m.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Subject selector */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(99,102,241,0.12)", display: "grid", placeItems: "center" }}>
              <BookOpen size={18} color="#818cf8" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Select Subject</p>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>Your assigned subjects (from database)</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {checking ? (
              <p style={{ fontSize: 13, color: "var(--muted)", padding: "12px 0" }}>Loading subjects…</p>
            ) : subjects.length > 0 ? subjects.map((s) => (
              <div key={s} onClick={() => !session && setSelected(s)}
                style={{
                  background: selected === s ? "rgba(99,102,241,0.1)" : "var(--surface2)",
                  border: selected === s ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border)",
                  borderRadius: 10, padding: "12px 16px", cursor: session ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s"
                }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: selected === s ? "#818cf8" : "var(--text)" }}>{s}</span>
                {selected === s && <CheckCircle size={16} color="#818cf8" />}
              </div>
            )) : (
              <p style={{ fontSize: 13, color: "var(--muted)", padding: "12px 0" }}>No subjects assigned. Contact admin.</p>
            )}
          </div>
        </div>

        {/* Session control */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Action card */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(16,185,129,0.1)", display: "grid", placeItems: "center" }}>
                <MapPin size={18} color="#10b981" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Session Control</p>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>GPS auto-captured on start</p>
              </div>
            </div>

            {!session ? (
              <button className="btn btn-primary w-full" style={{ justifyContent: "center", padding: "12px" }} disabled={loading || !selected} onClick={handleStart}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Starting…</> : <><PlayCircle size={16} /> Start Session</>}
              </button>
            ) : (
              <button className="btn btn-danger w-full" style={{ justifyContent: "center", padding: "12px" }} disabled={loading} onClick={handleStop}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Stopping…</> : <><StopCircle size={16} /> Stop Session</>}
              </button>
            )}
          </div>

          {/* Active session info */}
          {session && (
            <div className="animate-fade-in" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span className="dot-live" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>Session Active</span>
              </div>
              {[
                { label: "Subject",    val: session.subject },
                { label: "Session ID", val: session._id },
                { label: "Expires",    val: new Date(session.expiresAt).toLocaleTimeString() },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "var(--muted)" }}>{label}</span>
                  <span style={{ color: "var(--text)", fontWeight: 600, fontFamily: label === "Session ID" ? "monospace" : "inherit", fontSize: label === "Session ID" ? 11 : 12.5 }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
