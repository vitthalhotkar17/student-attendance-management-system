import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

export default function FaceCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const timerRef = useRef([]);
  const [status, setStatus] = useState("initializing");
  const [progress, setProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: "info", text: "Preparing camera feed…" });

  const resetFlow = useCallback(() => {
    setCapturedImage(null);
    setStatus("initializing");
    setProgress(0);
    setAlertMsg({ type: "info", text: "Preparing camera feed…" });
  }, []);

  useEffect(() => {
    resetFlow();
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [
      setTimeout(() => { setStatus("detecting"); setProgress(30); setAlertMsg({ type: "info", text: "Detecting facial landmarks…" }); }, 800),
      setTimeout(() => { setStatus("detected");  setProgress(65); setAlertMsg({ type: "success", text: "Face detected successfully." }); }, 1800),
      setTimeout(() => { setStatus("ready");     setProgress(100); setAlertMsg({ type: "success", text: "Ready — click Capture Face." }); }, 2600),
    ];
    return () => timerRef.current.forEach(clearTimeout);
  }, [resetFlow]);

  const capture = useCallback(() => {
    if (!webcamRef.current) { setAlertMsg({ type: "error", text: "Camera not available." }); return; }
    const img = webcamRef.current.getScreenshot();
    if (!img) { setAlertMsg({ type: "error", text: "Capture failed. Try again." }); return; }
    setCapturedImage(img);
    setStatus("captured");
    setAlertMsg({ type: "success", text: "Face captured. Retake if needed." });
    onCapture?.(img);
  }, [onCapture]);

  const alertColors = {
    info:    { bg: "rgba(6,182,212,0.08)",  border: "rgba(6,182,212,0.2)",   text: "#22d3ee" },
    success: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)",  text: "#34d399" },
    error:   { bg: "rgba(244,63,94,0.08)",  border: "rgba(244,63,94,0.2)",   text: "#fb7185" },
  };
  const ac = alertColors[alertMsg.type];

  return (
    <div className="space-y-4">
      {/* Camera box */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#000", border: "1px solid rgba(99,102,241,0.3)", aspectRatio: "4/3", maxWidth: 400 }}>
        {!capturedImage ? (
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <img src={capturedImage} alt="captured" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        {/* Scan overlay */}
        <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(99,102,241,0.4)", borderRadius: 16, pointerEvents: "none" }}>
          <div className="scan-line" />
          {/* Corners */}
          {[["top:12px","left:12px","border-top:2px solid #6366f1","border-left:2px solid #6366f1","border-radius:6px 0 0 0"],
            ["top:12px","right:12px","border-top:2px solid #6366f1","border-right:2px solid #6366f1","border-radius:0 6px 0 0"],
            ["bottom:12px","left:12px","border-bottom:2px solid #6366f1","border-left:2px solid #6366f1","border-radius:0 0 0 6px"],
            ["bottom:12px","right:12px","border-bottom:2px solid #6366f1","border-right:2px solid #6366f1","border-radius:0 0 6px 0"]].map((c, i) => (
            <div key={i} style={{ position: "absolute", width: 22, height: 22, ...Object.fromEntries(c.map(s => s.split(":"))) }} />
          ))}
        </div>
        {/* Status badge */}
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", borderRadius: 20, padding: "5px 14px", fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", color: status === "ready" || status === "captured" ? "#34d399" : status === "detecting" ? "#fbbf24" : "#94a3b8" }}>
          {status === "initializing" ? "Initializing…" : status === "detecting" ? "Detecting face…" : status === "detected" ? "Face found" : status === "ready" ? "✓ Ready to capture" : "✓ Captured"}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%`, background: progress === 100 ? "#10b981" : "linear-gradient(90deg,#6366f1,#818cf8)" }} />
      </div>

      {/* Alert */}
      <div style={{ background: ac.bg, border: `1px solid ${ac.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: ac.text }}>
        {alertMsg.text}
      </div>

      {/* Button */}
      <button type="button" onClick={capturedImage ? resetFlow : capture}
        className={`btn w-full ${capturedImage ? "btn-ghost" : "btn-primary"}`}
        disabled={status === "initializing" || status === "detecting"}>
        {capturedImage
          ? <><RefreshCw size={14} /> Retake Photo</>
          : <><Camera size={14} /> Capture Face</>}
      </button>
    </div>
  );
}
