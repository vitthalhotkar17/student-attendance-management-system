import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Auth pages
import Login from "../pages/auth/Login.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";

// Layouts
import AdminLayout   from "../layouts/AdminLayout.jsx";
import FacultyLayout from "../layouts/FacultyLayout.jsx";
import StudentLayout from "../layouts/StudentLayout.jsx";

// Admin pages
import AdminDashboard        from "../pages/admin/Dashboard.jsx";
import AdminStudents         from "../pages/admin/Students.jsx";
import AdminFaculty          from "../pages/admin/Faculty.jsx";
import AdminAttendance       from "../pages/admin/Attendance.jsx";
import AdminReports          from "../pages/admin/Reports.jsx";
import AdminSessions         from "../pages/admin/SessionManagement.jsx";
import AdminRegStudent       from "../pages/admin/StudentRegistration.jsx";
import AdminAssign           from "../pages/admin/AssignSubjects.jsx";
import AdminSubjects         from "../pages/admin/Subjects.jsx";
import AdminStudentPwd       from "../pages/admin/StudentPasswordReset.jsx";
import AdminFacultyPwd       from "../pages/admin/FacultyPasswordReset.jsx";
import AdminProfile          from "../pages/admin/Profile.jsx";
import AdminSettings         from "../pages/admin/Settings.jsx";
import Notifications         from "../pages/admin/Notifications.jsx";

// Faculty pages
import FacultyDashboard  from "../pages/faculty/Dashboard.jsx";
import StartSession      from "../pages/faculty/StartSession.jsx";
import FacultyStudents   from "../pages/faculty/StudentsList.jsx";
import FacultyReports    from "../pages/faculty/Reports.jsx";
import FacultyProfile    from "../pages/faculty/Profile.jsx";

// Student pages
import StudentDashboard  from "../pages/student/Dashboard.jsx";
import MarkAttendance    from "../pages/student/MarkAttendance.jsx";
import StudentReports    from "../pages/student/Reports.jsx";
import StudentProfile    from "../pages/student/Profile.jsx";
import EditProfile       from "../pages/student/EditProfile.jsx";
import ResetPassword     from "../pages/common/ResetPassword.jsx";

export default function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <Loader />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"          element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/"               element={<Navigate to="/login" replace />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index                      element={<AdminDashboard />} />
        <Route path="students"            element={<AdminStudents />} />
        <Route path="students/register"   element={<AdminRegStudent />} />
        <Route path="faculty"             element={<AdminFaculty />} />
        <Route path="subjects"            element={<AdminSubjects />} />
        <Route path="assign-subjects"     element={<AdminAssign />} />
        <Route path="sessions"            element={<AdminSessions />} />
        <Route path="attendance"          element={<AdminAttendance />} />
        <Route path="notifications"       element={<Notifications />} />
        <Route path="reports"             element={<AdminReports />} />
        <Route path="student-password"    element={<AdminStudentPwd />} />
        <Route path="faculty-password"    element={<AdminFacultyPwd />} />
        <Route path="reset-password"      element={<ResetPassword />} />
        <Route path="profile"             element={<AdminProfile />} />
        <Route path="settings"            element={<AdminSettings />} />
      </Route>

      {/* Faculty */}
      <Route path="/faculty" element={<ProtectedRoute role="faculty"><FacultyLayout /></ProtectedRoute>}>
        <Route index                      element={<FacultyDashboard />} />
        <Route path="start-session"       element={<StartSession />} />
        <Route path="students"            element={<FacultyStudents />} />
        <Route path="notifications"       element={<Notifications />} />
        <Route path="reports"             element={<FacultyReports />} />
        <Route path="profile"             element={<FacultyProfile />} />
        <Route path="reset-password"      element={<ResetPassword />} />
      </Route>

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
        <Route index                      element={<StudentDashboard />} />
        <Route path="mark-attendance"     element={<MarkAttendance />} />
        <Route path="notifications"       element={<Notifications />} />
        <Route path="reports"             element={<StudentReports />} />
        <Route path="profile"             element={<StudentProfile />} />
        <Route path="edit-profile"        element={<EditProfile />} />
        <Route path="reset-password"      element={<ResetPassword />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
