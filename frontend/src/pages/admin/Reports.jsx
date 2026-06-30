import { useEffect, useState } from "react";
import { reportService } from "../../services/reportService.js";
import { attendanceService } from "../../services/attendanceService.js";
import { Download } from "lucide-react";

export default function AdminReports() {
  const [stats, setStats] = useState({});
  const [recs, setRecs] = useState([]);
  useEffect(() => {
    reportService.overallSummary().then(setStats);
    attendanceService.listAttendance().then(setRecs);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-4">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="card p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">{k}</p>
            <p className="text-3xl font-bold mt-2">{v}</p>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold">Attendance Export</h3>
          <button onClick={() => reportService.downloadCSV(recs, "attendance.csv")} className="btn-primary"><Download size={16}/> Download CSV</button>
        </div>
        <p className="text-sm text-slate-500">{recs.length} records ready to export.</p>
      </div>
    </div>
  );
}
