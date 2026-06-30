import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, ScanFace, MapPin, ShieldCheck, UserPlus, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";
import FaceCapture from "../../components/FaceCapture.jsx";
import PasswordInput from "../../components/PasswordInput.jsx";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ email: "", password: "", name: "", rollNo: "", department: "", year: 1 });
  const [faceImage, setFaceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register" && !faceImage) throw new Error("Please capture your face before registering.");
      let u;
      if (mode === "login") {
        u = await login(form.email, form.password, role);
      } else {
        u = await register({ ...form, role: "student", faceImage });
      }
      toast.success(`Welcome, ${u.name}!`);
      navigate(`/${u.role}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg)" }}>

      {/* ── Left brand panel ── */}
      <div style={{
        background: "linear-gradient(145deg,#1a1740 0%,#2e2870 40%,#4c1d95 70%,#1a1740 100%)",
        display: "flex", flexDirection: "column", padding: 52,
        position: "relative", overflow: "hidden"
      }} className="hidden lg:flex">
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
        {/* Glow blobs */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: "20%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 65%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, marginBottom: 64 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
            <GraduationCap size={24} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>SAMS</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Smart Attendance System</p>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 40, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 18 }}>
            Smarter Attendance,<br />Starts Here.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14.5, lineHeight: 1.75, maxWidth: 380, marginBottom: 44 }}>
            Secure, contactless attendance powered by real-time face recognition and GPS geofencing. Built for modern institutions.
          </p>

          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { Icon: ScanFace, label: "Face Auth",      sub: "99.2% accuracy" },
              { Icon: MapPin,   label: "Live GPS",       sub: "500 m geofence" },
              { Icon: ShieldCheck, label: "Secure",      sub: "JWT encrypted" },
            ].map(({ Icon, label, sub }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "18px 16px", backdropFilter: "blur(10px)" }}>
                <Icon size={22} color="rgba(255,255,255,0.75)" />
                <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 12 }}>{label}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", marginTop: 3 }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: "relative", fontSize: 11.5, color: "rgba(255,255,255,0.25)", marginTop: 48 }}>
          © {new Date().getFullYear()} SAMS · Student Attendance Management System v3.0
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 52px", background: "var(--surface)", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }} className="lg:hidden">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "grid", placeItems: "center" }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text)" }}>SAMS</p>
          </div>

          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            {mode === "login" ? "Sign in to your account" : "Create student account"}
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 28 }}>
            {mode === "login" ? "Welcome back — enter your credentials below." : "Quick registration, start marking attendance."}
          </p>

          {/* Role selector (login only) */}
          {mode === "login" && (
            <div style={{ marginBottom: 24 }}>
              <div className="label">I am a</div>
              <div style={{ display: "flex", gap: 6, background: "var(--surface2)", border: "1px solid var(--border)", padding: 5, borderRadius: 12 }}>
                {["student", "faculty", "admin"].map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)} style={{
                    flex: 1, padding: "9px 8px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s", border: "1px solid transparent",
                    background: role === r ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "transparent",
                    color: role === r ? "#fff" : "var(--muted)",
                    boxShadow: role === r ? "0 0 20px rgba(99,102,241,0.35)" : "none",
                    textTransform: "capitalize"
                  }}>{r}</button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <>
                <div>
                  <div className="label">Full Name</div>
                  <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Aarav Mehta" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div className="label">Roll No.</div>
                    <input required className="input" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} placeholder="CS2101" />
                  </div>
                  <div>
                    <div className="label">Year</div>
                    <select className="input" value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })}>
                      {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="label">Department</div>
                  <input required className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" />
                </div>
                <div>
                  <div className="label">Face Capture</div>
                  <FaceCapture onCapture={(img) => setFaceImage(img)} />
                </div>
              </>
            )}

            <div>
              <div className="label">Email Address</div>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input required type="email" className="input input-icon-left" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={`${role}@sams.edu`} />
              </div>
            </div>

            <PasswordInput id="password" name="password" label="Password" required minLength={6}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              leftIcon={<Lock size={15} />} />

            {mode === "login" && (
              <div style={{ textAlign: "right" }}>
                <Link to="/forgot-password" style={{ fontSize: 13, color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading || (mode === "register" && !faceImage)}
              className="btn btn-primary btn-lg w-full" style={{ marginTop: 4, justifyContent: "center" }}>
              {loading
                ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Please wait…</>
                : <>{mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={15} /></>}
            </button>
          </form>

          {/* Toggle */}
          <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
            {mode === "login" ? (
              <>New student?{" "}
                <button onClick={() => setMode("register")} style={{ color: "#818cf8", fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <UserPlus size={13} /> Register here
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setMode("login")} style={{ color: "#818cf8", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                  Sign in
                </button>
              </>
            )}
          </div>

          {/* Demo credentials */}
          {mode === "login" && (
            <div style={{ marginTop: 28, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>🔑 Demo credentials</p>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
                admin@sams.edu / anita@sams.edu / aarav@student.sams.edu<br />
                Passwords: admin123 / faculty123 / student123
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
