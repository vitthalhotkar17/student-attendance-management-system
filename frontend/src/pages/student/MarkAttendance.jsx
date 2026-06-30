import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { attendanceService } from "../../services/attendanceService.js";
import { api } from "../../services/api.js";
import { Camera, MapPin, CheckCircle, XCircle, ChevronRight, RefreshCw, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Webcam from "react-webcam";

const STEPS = ["Select Subject", "Face Scan", "Face Verify", "GPS Verify", "Confirmed"];

function StepBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 4 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 90 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center",
              background: i < current ? "#6366f1" : i === current ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "var(--surface2)",
              border: i <= current ? "2px solid #6366f1" : "2px solid var(--border2)",
              fontSize: 11, fontWeight: 800, color: i <= current ? "#fff" : "var(--muted)",
              boxShadow: i === current ? "0 0 16px rgba(99,102,241,0.5)" : "none",
              transition: "all 0.3s", flexShrink: 0
            }}>
              {i < current ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: i === current ? 600 : 400, color: i === current ? "var(--text)" : "var(--muted)", whiteSpace: "nowrap" }}>
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 1.5, background: i < current ? "#6366f1" : "var(--border)", margin: "0 8px", transition: "background 0.4s", borderRadius: 2 }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MarkAttendanceStudent() {
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const [step, setStep]               = useState(0);
  const [activeSession, setActive]    = useState(null);
  const [faceImage, setFaceImage]     = useState(null);
  const [location, setLocation]       = useState(null);
  const [loading, setLoading]         = useState(false);
  const [camReady, setCamReady]       = useState(false);
  const [verifyResult, setVerifyResult] = useState(null); // { verified, score }

  // Step 0 — fetch active session
  const loadSession = async () => {
    setLoading(true);
    try {
      const s = await attendanceService.getActiveSession();
      if (!s) throw new Error("No active session right now. Ask your faculty to start one.");
      setActive(s);
      setStep(1);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  // Step 1 — capture face, then immediately verify against DB-stored embedding
  const captureFace = useCallback(async () => {
    const img = webcamRef.current?.getScreenshot();
    if (!img) { toast.error("Capture failed. Make sure camera is allowed."); return; }
    setFaceImage(img);
    setStep(2);
    setLoading(true);
    setVerifyResult(null);
    try {
      const { data } = await api.post("/faces/verify", { faceImage: img });
      const result = data.data; // { verified, score }
      setVerifyResult(result);
      if (result.verified) {
        toast.success(`Face Verification Successful (${result.score}% match)`);
      } else {
        toast.error("Face verification is not matched. Please try again.");
      }
    } catch (err) {
      setVerifyResult({ verified: false, score: 0, errorMessage: err.message });
      toast.error(err.message || "Face verification failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const retryFaceScan = () => {
    setVerifyResult(null);
    setFaceImage(null);
    setStep(1);
  };

  // Step 2 → 3 — proceed to GPS only if verified
  const proceedToGPS = () => setStep(3);

  // Step 3 — get GPS
  const verifyGPS = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
        setStep(4);
      },
      (err) => {
        toast.error("GPS error: " + err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Step 4 — submit
  const submit = async () => {
    setLoading(true);
    try {
      await attendanceService.markAttendance({
        sessionId: activeSession._id || activeSession.id,
        faceImage,
        lat: location.lat,
        lng: location.lng,
      });
      toast.success("Attendance marked successfully!");
      setStep(5);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setStep(0); setActive(null); setFaceImage(null); setLocation(null);
    setCamReady(false); setVerifyResult(null);
  };

  return (
    <div className="animate-fade-up" style={{ maxWidth: 640, margin: "0 auto" }}>
      <StepBar current={step >= 5 ? 4 : step} />

      {/* Step 0 — start */}
      {step === 0 && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
            <Camera size={28} color="#818cf8" />
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Mark Your Attendance</h2>
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
            You'll need to scan your face for verification and share your GPS location. Ensure your camera and location are enabled.
          </p>
          <button className="btn btn-primary btn-lg" onClick={loadSession} disabled={loading} style={{ margin: "0 auto" }}>
            {loading ? <><Loader2 size={15} className="animate-spin" /> Checking session…</> : <>Check Active Session <ChevronRight size={15} /></>}
          </button>
        </div>
      )}

      {/* Step 1 — face capture */}
      {step === 1 && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Face Recognition Scan</p>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Position your face within the frame. Ensure good lighting — no sunglasses or face coverings.</p>
          </div>
          {activeSession && (
            <div style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{activeSession.subject}</p>
                <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>Faculty: {activeSession.facultyName}</p>
              </div>
              <span className="chip chip-green"><span className="dot-live" /> Live</span>
            </div>
          )}
          <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(99,102,241,0.3)", aspectRatio: "4/3", background: "#000", marginBottom: 16, maxWidth: "100%" }}>
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              onUserMedia={() => setCamReady(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(99,102,241,0.4)", borderRadius: 14, pointerEvents: "none" }}>
              <div className="scan-line" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={reset}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={!camReady} onClick={captureFace}>
              <Camera size={15} /> Capture Face & Verify
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Face Verification result */}
      {step === 2 && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          {loading ? (
            <>
              <Loader2 size={36} className="animate-spin" style={{ color: "#818cf8", margin: "0 auto 20px" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Verifying your face…</p>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Comparing with the face stored in the database</p>
            </>
          ) : verifyResult?.verified ? (
            <>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "2px solid rgba(16,185,129,0.3)", display: "grid", placeItems: "center", margin: "0 auto 20px", boxShadow: "0 0 32px rgba(16,185,129,0.2)" }}>
                <ShieldCheck size={34} color="#10b981" />
              </div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 19, fontWeight: 800, color: "#34d399", marginBottom: 8 }}>✅ Face Verification Successful</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>Match score: <strong style={{ color: "#34d399" }}>{verifyResult.score}%</strong> (Required: 60%+)</p>
              <button className="btn btn-primary" onClick={proceedToGPS} style={{ margin: "0 auto" }}>
                Continue to GPS Verification <ChevronRight size={15} />
              </button>
            </>
          ) : (
            <>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(244,63,94,0.12)", border: "2px solid rgba(244,63,94,0.3)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
                <XCircle size={34} color="#f43f5e" />
              </div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 19, fontWeight: 800, color: "#f87171", marginBottom: 8 }}>❌ Face Verification Failed</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 6, maxWidth: 360, margin: "0 auto 6px" }}>
                Face verification is not matched. Please try again.
              </p>
              {verifyResult?.score != null && (
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 24 }}>Match score: {verifyResult.score}% (Required: 60%+)</p>
              )}
              <button className="btn btn-primary" onClick={retryFaceScan} style={{ margin: "0 auto" }}>
                <RefreshCw size={14} /> Try Again
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 3 — GPS */}
      {step === 3 && (
        <div className="card" style={{ padding: 28 }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>GPS Location Verification</p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 28 }}>Confirming you are within the allowed radius of the classroom. Do not block your browser location access.</p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, marginBottom: 28 }}>
            <div style={{ position: "relative", width: 160, height: 160 }}>
              {[1, 0.68, 0.38].map((s, i) => (
                <div key={i} style={{
                  position: "absolute", top: `${(1-s)*80}px`, left: `${(1-s)*80}px`,
                  width: s*160, height: s*160, borderRadius: "50%",
                  border: `1px solid rgba(99,102,241,${0.12 + i*0.1})`,
                  background: `rgba(99,102,241,${0.02 + i*0.025})`
                }} />
              ))}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#10b981" }}>
                <MapPin size={28} color="#10b981" />
              </div>
              <div style={{ position: "absolute", top: "28%", left: "62%", width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981", animation: "pulse-dot 2s infinite" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#34d399" }}>Tap below to verify location</p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>You must be within range of the registered classroom</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={retryFaceScan}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={loading} onClick={verifyGPS}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Getting location…</> : <><MapPin size={14} /> Verify My Location</>}
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — confirm */}
      {step === 4 && (
        <div className="card" style={{ padding: 28 }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Confirm & Submit</p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>Review details and submit your attendance.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              { label: "Subject",         val: activeSession?.subject, color: "#34d399" },
              { label: "Face Verified",   val: `✓ ${verifyResult?.score}% match`, color: "#34d399" },
              { label: "GPS Location",    val: location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "—", color: "#34d399" },
              { label: "Student",         val: user?.name,              color: "var(--text)" },
              { label: "Time",            val: new Date().toLocaleTimeString(), color: "var(--text)" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface2)", borderRadius: 10, padding: "12px 16px" }}>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={loading} onClick={submit}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <>Submit Attendance <CheckCircle size={14} /></>}
            </button>
          </div>
        </div>
      )}

      {/* Step 5 — success */}
      {step === 5 && (
        <div className="card animate-fade-in" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "2px solid rgba(16,185,129,0.3)", display: "grid", placeItems: "center", margin: "0 auto 20px", boxShadow: "0 0 32px rgba(16,185,129,0.2)" }}>
            <CheckCircle size={34} color="#10b981" />
          </div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, fontWeight: 800, color: "#34d399", marginBottom: 8 }}>Attendance Marked!</h3>
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 6 }}>
            Subject: <strong style={{ color: "var(--text)" }}>{activeSession?.subject}</strong>
          </p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 32 }}>Face ✓ {verifyResult?.score}% · GPS ✓ · {new Date().toLocaleTimeString()}</p>
          <button className="btn btn-ghost" onClick={reset} style={{ margin: "0 auto" }}>
            <RefreshCw size={14} /> Mark Another Session
          </button>
        </div>
      )}
    </div>
  );
}
