import { Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCog, ClipboardCheck, FileBarChart2,
  KeyRound, Settings2, BookOpen, ListChecks, Calendar, ShieldCheck, LogOut, Lock, Bell
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const items = [
  { to: "/admin",                  end: true,  label: "Dashboard",        icon: LayoutDashboard },
  { to: "/admin/students",                     label: "Students",          icon: Users,       badge: "Live" },
  { to: "/admin/faculty",                      label: "Faculty",           icon: UserCog },
  { to: "/admin/subjects",                     label: "Subjects",          icon: BookOpen },
  { to: "/admin/assign-subjects",              label: "Assign Subjects",   icon: ListChecks },
  { to: "/admin/sessions",                     label: "Sessions",          icon: Calendar },
  { to: "/admin/attendance",                   label: "Attendance",        icon: ClipboardCheck },
  { to: "/admin/notifications",                label: "Notifications",     icon: Bell },
  { to: "/admin/reports",                      label: "Reports",           icon: FileBarChart2 },
  { to: "/admin/student-password",             label: "Student Password",  icon: KeyRound },
  { to: "/admin/faculty-password",             label: "Faculty Password",  icon: ShieldCheck },
  { to: "/admin/reset-password",               label: "Reset Password",    icon: Lock },
  { to: "/admin/settings",                     label: "Settings",          icon: Settings2 },
  { action: "logout",                          label: "Logout",            icon: LogOut },
];

const titles = {
  "/admin": "Admin Dashboard",
  "/admin/students": "Manage Students",
  "/admin/faculty": "Manage Faculty",
  "/admin/subjects": "Subjects",
  "/admin/assign-subjects": "Assign Subjects",
  "/admin/sessions": "Session Management",
  "/admin/attendance": "Attendance Records",
  "/admin/notifications": "Notifications",
  "/admin/reports": "Reports & Analytics",
  "/admin/student-password": "Student Password Reset",
  "/admin/faculty-password": "Faculty Password Reset",
  "/admin/reset-password": "Reset Password",
  "/admin/settings": "System Settings",
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar items={items} brand="SAMS Admin" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar title={titles[pathname] || "Admin"} />
        <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
