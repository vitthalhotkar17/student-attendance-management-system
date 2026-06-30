import { Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, ScanFace, FileBarChart2, User, LogOut, Lock, Bell } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const items = [
  { to: "/student",                 end: true, label: "Dashboard",        icon: LayoutDashboard },
  { to: "/student/mark-attendance",            label: "Mark Attendance",   icon: ScanFace, badge: "Live" },
  { to: "/student/notifications",              label: "Notifications",     icon: Bell },
  { to: "/student/reports",                    label: "Attendance Report", icon: FileBarChart2 },
  { to: "/student/profile",                    label: "Profile",           icon: User },
  { to: "/student/reset-password",             label: "Reset Password",    icon: Lock },
  { action: "logout",                       label: "Logout",            icon: LogOut },
];
const titles = {
  "/student": "Student Dashboard", "/student/edit-profile": "Edit Profile",
  "/student/mark-attendance": "Mark Attendance", "/student/reports": "Attendance Report",
  "/student/notifications": "Notifications",
  "/student/profile": "Profile", "/student/reset-password": "Reset Password",
};

export default function StudentLayout() {
  const { pathname } = useLocation();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar items={items} brand="SAMS Student" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar title={titles[pathname] || "Student"} />
        <main style={{ flex: 1, padding: 28 }}><Outlet /></main>
        <Footer />
      </div>
    </div>
  );
}
