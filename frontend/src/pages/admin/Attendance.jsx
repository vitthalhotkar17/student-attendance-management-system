import { useEffect, useState } from "react";
import { attendanceService } from "../../services/attendanceService.js";

export default function AdminAttendance() {
  const [list, setList] = useState([]);
  useEffect(() => { attendanceService.listAttendance().then(setList); }, []);
  return (
    <div className="card p-5">
      <h3 className="font-display font-bold mb-4">All Attendance Records ({list.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
            <tr><th className="py-2">Student</th><th>Session</th><th>Status</th><th>Face</th><th>GPS</th><th>Time</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan="6" className="py-12 text-center text-slate-400">No records</td></tr>}
            {list.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 font-medium">{r.studentName}</td>
                <td className="text-slate-500">{r.sessionId}</td>
                <td><span className="chip bg-emerald-50 text-emerald-700">{r.status}</span></td>
                <td><span className="chip bg-blue-50 text-blue-700">{r.faceVerified ? "Verified" : "—"}</span></td>
                <td className="text-slate-500">{r.lat?.toFixed(4)}, {r.lng?.toFixed(4)}</td>
                <td className="text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
