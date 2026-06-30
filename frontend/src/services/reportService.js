import { api } from "./api.js";

export const reportService = {
  async overallSummary() {
    const { data } = await api.get("/admin/dashboard");
    const d = data.data;
    return {
      students: d.totalStudents,
      faculty: d.totalFaculty,
      sessions: d.totalSessions,
      attendance: d.totalAttendance,
    };
  },

  async studentSummary(studentId) {
    const { data } = await api.get(`/attendance/student/${studentId}`);
    return data.data || { records: [], summary: { total: 0, present: 0, absent: 0, percentage: 0 } };
  },

  async facultySummary(facultyId) {
    const { data } = await api.get(`/sessions?facultyId=${facultyId}`);
    return data.data?.sessions || [];
  },

  downloadCSV(rows, filename = "report.csv") {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
