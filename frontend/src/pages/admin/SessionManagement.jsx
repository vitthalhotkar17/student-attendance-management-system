import { useState } from "react";
import { db } from "../../services/api.js";
import toast from "react-hot-toast";
import { MapPin, Clock } from "lucide-react";

export default function SessionManagement() {
  const [s, setS] = useState(db.getSettings());
  const save = (e) => {
    e.preventDefault();
    db.setSettings(s); toast.success("Settings saved");
  };
  const captureGPS = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (p) => { setS((x) => ({ ...x, campusLat: p.coords.latitude, campusLng: p.coords.longitude })); toast.success("Campus location captured"); },
      (e) => toast.error(e.message),
      { enableHighAccuracy: true }
    );
  };
  return (
    <form onSubmit={save} className="card p-6 max-w-2xl space-y-5">
      <h3 className="font-display font-bold">Session & GPS Settings</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label"><Clock size={14} className="inline mr-1" /> Session Duration (minutes)</label>
          <input required type="number" min="5" max="240" className="input" value={s.sessionDuration} onChange={(e)=>setS({...s,sessionDuration:+e.target.value})}/>
        </div>
        <div>
          <label className="label"><MapPin size={14} className="inline mr-1" /> GPS Radius (meters)</label>
          <input required type="number" min="10" max="2000" className="input" value={s.gpsRadius} onChange={(e)=>setS({...s,gpsRadius:+e.target.value})}/>
        </div>
        <div>
          <label className="label">Campus Latitude</label>
          <input className="input" value={s.campusLat ?? ""} onChange={(e)=>setS({...s,campusLat:+e.target.value})}/>
        </div>
        <div>
          <label className="label">Campus Longitude</label>
          <input className="input" value={s.campusLng ?? ""} onChange={(e)=>setS({...s,campusLng:+e.target.value})}/>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={captureGPS} className="btn-ghost"><MapPin size={16}/> Capture my current GPS</button>
        <button className="btn-primary">Save settings</button>
      </div>
    </form>
  );
}
