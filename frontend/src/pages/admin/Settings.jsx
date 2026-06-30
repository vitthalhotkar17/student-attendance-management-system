import { useState, useEffect } from "react";
import { db } from "../../services/api.js";
import { Settings2, MapPin, Clock, ScanFace, Save, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [settings, setSettings] = useState({ sessionDuration: 30, gpsRadius: 100, campusLat: "", campusLng: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = db.getSettings();
    setSettings({ ...settings, ...s, campusLat: s.campusLat ?? "", campusLng: s.campusLng ?? "" });
  }, []);

  const save = () => {
    setSaving(true);
    db.setSettings({ ...settings, campusLat: settings.campusLat ? +settings.campusLat : null, campusLng: settings.campusLng ? +settings.campusLng : null });
    setTimeout(() => { setSaving(false); toast.success("Settings saved!"); }, 600);
  };

  const reset = () => {
    const def = { sessionDuration: 30, gpsRadius: 100, campusLat: "", campusLng: "" };
    setSettings(def);
    db.setSettings({ ...def, campusLat: null, campusLng: null });
    toast("Settings reset to defaults");
  };

  const SliderCard = ({ icon: Icon, color, label, sub, field, min, max, step = 1, unit }) => (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}18`, display: "grid", placeItems: "center" }}>
          <Icon size={19} color={color} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{label}</p>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>{sub}</p>
        </div>
        <div style={{ marginLeft: "auto", background: "var(--surface2)", border: `1px solid ${color}30`, borderRadius: 8, padding: "4px 14px", fontSize: 15, fontWeight: 800, color }}>
          {settings[field]} {unit}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={settings[field]}
        onChange={(e) => setSettings((s) => ({ ...s, [field]: +e.target.value }))}
        style={{ width: "100%", accentColor: color, height: 5, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
        <span>{min} {unit}</span><span>{max} {unit}</span>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-up" style={{ maxWidth: 760 }}>
      {/* Hero */}
      <div className="hero-gradient" style={{ padding: "28px 32px", marginBottom: 24 }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>Admin · System Configuration</p>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>System Settings</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Configure GPS radius, session duration, and campus coordinates. Changes take effect immediately.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SliderCard icon={Clock}    color="#6366f1" label="Session Duration" sub="How long each session stays active" field="sessionDuration" min={5} max={120} step={5} unit="min" />
        <SliderCard icon={MapPin}   color="#10b981" label="GPS Radius"       sub="Maximum distance students can be from campus" field="gpsRadius" min={50} max={1000} step={50} unit="m" />

        {/* Campus coordinates */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(245,158,11,0.1)", display: "grid", placeItems: "center" }}>
              <Settings2 size={19} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Campus Coordinates</p>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>GPS centre point for geofencing</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div className="label">Latitude</div>
              <input type="number" className="input" step="0.0001" value={settings.campusLat}
                onChange={(e) => setSettings((s) => ({ ...s, campusLat: e.target.value }))}
                placeholder="e.g. 18.5204" />
            </div>
            <div>
              <div className="label">Longitude</div>
              <input type="number" className="input" step="0.0001" value={settings.campusLng}
                onChange={(e) => setSettings((s) => ({ ...s, campusLng: e.target.value }))}
                placeholder="e.g. 73.8567" />
            </div>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10 }}>
            💡 Open Google Maps, right-click your campus → "What's here?" to get coordinates.
          </p>
        </div>

        {/* Face threshold info */}
        <div className="card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(6,182,212,0.1)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <ScanFace size={19} color="#06b6d4" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>Face Match Threshold</p>
            <p style={{ fontSize: 12.5, color: "var(--muted)" }}>Currently using Euclidean distance threshold of <strong style={{ color: "#22d3ee" }}>0.40</strong> for 128-dim face descriptors. Configurable in backend <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 5, fontSize: 11 }}>face-api.js</code>.</p>
          </div>
          <span className="chip chip-cyan">Fixed · Backend</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={reset}><RotateCcw size={14} /> Reset Defaults</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : <><Save size={14} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}
