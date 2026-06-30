import { api } from "./api.js";

export const attendanceService = {
  // ── Sessions ──────────────────────────────────────────────────────────────

  async getActiveSession() {
    const { data } = await api.get("/sessions/active");
    return data.data?.session || null;
  },

  async listSessions() {
    const { data } = await api.get("/sessions");
    return data.data?.sessions || [];
  },

  async startSession({ subject, lat, lng }) {
    const { data } = await api.post("/sessions/start", { subject, lat, lng });
    return data.data.session;
  },

  async stopSession(id) {
    const { data } = await api.put(`/sessions/end/${id}`);
    return data.data;
  },

  // ── Attendance ────────────────────────────────────────────────────────────

  async markAttendance({ sessionId, faceImage, lat, lng }) {
    const { data } = await api.post("/attendance/mark", { sessionId, faceImage, lat, lng });
    return data.data;
  },

  async getHistory() {
    const { data } = await api.get("/attendance/history");
    return data.data?.records || [];
  },

  async listAttendance(filter = {}) {
    const params = new URLSearchParams(filter).toString();
    const { data } = await api.get(`/attendance/report${params ? "?" + params : ""}`);
    return data.data?.records || [];
  },

  async getStudentAttendance(studentId) {
    const { data } = await api.get(`/attendance/student/${studentId}`);
    return data.data || { records: [], summary: {} };
  },

  async getSessionAttendance(sessionId) {
    const { data } = await api.get(`/attendance/session/${sessionId}`);
    return data.data?.records || [];
  },
};

// Haversine distance in meters (kept for GPS UI)
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
