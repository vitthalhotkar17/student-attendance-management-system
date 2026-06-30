import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { reportService } from "../../services/reportService.js";
import { Download } from "lucide-react";

export default function FacultyReports() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  useEffect(() => { reportService.facultySummary(user.id).then(setSessions); }, [user.id]);
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold">My Session Reports</h3>
        <button onClick={()=>reportService.downloadCSV(sessions,"my-sessions.csv")} className="btn-primary"><Download size={16}/> Export CSV</button>
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
          <tr><th className="py-2">Subject</th><th>Started</th><th>Attendees</th><th>Status</th></tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b border-slate-50">
              <td className="py-3 font-medium">{s.subject}</td>
              <td className="text-slate-500">{new Date(s.startedAt).toLocaleString()}</td>
              <td>{s.attendees}</td>
              <td>{s.active ? <span className="chip bg-emerald-50 text-emerald-700">Active</span> : <span className="chip bg-slate-100 text-slate-600">Ended</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
