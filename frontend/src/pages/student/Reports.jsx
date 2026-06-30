import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { reportService } from "../../services/reportService.js";
import { Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function StudentReports() {
  const { user } = useAuth();
  const [s, setS] = useState(null);
  useEffect(() => { reportService.studentSummary(user.id).then(setS); }, [user.id]);
  if (!s) return null;
  const data = [{ name: "Present", value: s.present }, { name: "Absent", value: s.absent }];
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="card p-6 lg:col-span-1">
        <h3 className="font-display font-bold">Overall</h3>
        <div className="h-60">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={50} outerRadius={80}>
                <Cell fill="#10b981" /><Cell fill="#f43f5e" />
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-3xl font-bold">{s.percentage}%</p>
        <p className="text-center text-slate-500 text-sm">Attendance rate</p>
      </div>
      <div className="card p-5 lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold">Records</h3>
          <button onClick={()=>reportService.downloadCSV(s.records,"attendance.csv")} className="btn-primary"><Download size={16}/> Export</button>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
            <tr><th className="py-2">Session</th><th>Status</th><th>Location</th><th>Time</th></tr>
          </thead>
          <tbody>
            {s.records.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-slate-400">No records</td></tr>}
            {s.records.map((r) => (
              <tr key={r.id} className="border-b border-slate-50">
                <td className="py-3 font-medium">{r.sessionId}</td>
                <td><span className="chip bg-emerald-50 text-emerald-700">{r.status}</span></td>
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
