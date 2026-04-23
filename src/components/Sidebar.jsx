import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  UserCheck,
  AlarmClockCheck,
  Users,
  Calendar,
  FileText as LeaveIcon,
  User as ProfileIcon,
  LogOut as LogOutIcon,
  X,
  Copyright,
  User,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  NotebookPen,
  BookPlus,
  Clock,
  MessageSquare,
  Newspaper,
  BookOpen,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();

  // Safely read user from localStorage with reactivity
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Re-read user if localStorage changes (e.g. after login in another tab)
  useEffect(() => {
    const syncUser = () => {
      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const [attendanceOpen, setAttendanceOpen] = useState(true);

  const adminMenuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/employee", icon: Users, label: "Employee" },
    {
      label: "Attendance",
      icon: Clock,
      isNested: true,
      isOpen: attendanceOpen,
      onToggle: () => setAttendanceOpen(!attendanceOpen),
      subItems: [
        { path: "/attendance/daily", label: "Daily" },
        { path: "/attendance/monthly", label: "Monthly" },
      ],
    },
    {
      path: "/article-attendance",
      icon: BookOpen,
      label: "Article Attendance",
    },

    
    { path: "/108-noc", icon: FileText, label: "108 NOC" },
    { path: "/reimbursement", icon: NotebookPen, label: "Reimbaursment" },
    { path: "/artical", icon: Newspaper, label: "Articles" },

    { path: "/feedback", icon: MessageSquare, label: "Feedback" },
    { path: "/leave-management", icon: BookPlus, label: "Leave Mgmt" },
    { path: "/company-calendar", icon: Calendar, label: "Calendar" },
    { path: "/license", icon: AlarmClockCheck, label: "License" },
  ];

  const employeeMenuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    {
      label: "Attendance",
      icon: Clock,
      isNested: true,
      isOpen: attendanceOpen,
      onToggle: () => setAttendanceOpen(!attendanceOpen),
      subItems: [
        { path: "/attendance/daily", label: "Daily" },
        { path: "/attendance/monthly", label: "Monthly" },
      ],
    },
    {
      path: "/article-attendance",
      icon: BookOpen,
      label: "Article Attendance",
    },
    { path: "/108-noc", icon: FileText, label: "108 NOC" },
    { path: "/reimbursement", icon: NotebookPen, label: "Reimbaursment" },
    { path: "/artical", icon: Newspaper, label: "Articles" },
    { path: "/feedback", icon: MessageSquare, label: "Feedback" },
    { path: "/leave-request", icon: LeaveIcon, label: "Leave Request" },
    { path: "/company-calendar", icon: Calendar, label: "Calendar" },
    { path: "/license", icon: Copyright, label: "License" },
  ];

  // WORKAROUND: Show admin menu to all authenticated users.
  // Individual pages are still protected by <ProtectedRoute requiredRole="admin">.
  // To re-enable role-based menu filtering, fix column H (Role) in your
  // Login Master Google Sheet to 'admin' for admin users, then uncomment below.
  //
  // const userRole = (user?.role || "").toLowerCase().trim();
  // const isAdmin = userRole === "admin" || user?.Admin === "Yes";
  const isAdmin = !!user; // All logged-in users see admin menu; routes remain protected
  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full ${
          isCollapsed ? "w-20" : "w-64"
        } glass-sidebar text-slate-300 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Collapse Toggle Button (Desktop Only) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute -right-3 top-8 bg-indigo-600 text-white rounded-full p-1 shadow-lg z-50 hover:bg-indigo-500 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Logo Section */}
          <div
            className={`p-6 border-b border-white/5 flex items-center ${
              isCollapsed ? "justify-center px-0" : "justify-between"
            } bg-white/1 overflow-hidden transition-all duration-300`}
          >
            <div className="flex items-center gap-3">
              <div className="relative group/logo">
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg blur-[6px] opacity-40 group-hover/logo:opacity-75 transition-opacity" />
                <div className="relative w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg transform group-hover/logo:scale-105 transition-transform duration-500">
                  <Users size={20} className="text-white" />
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col animate-in fade-in zoom-in duration-300">
                  <span className="text-[17px] font-black text-white tracking-widest leading-none uppercase">
                    HR Connect
                  </span>
                  <span className="text-[8px] font-bold text-indigo-400/80 uppercase tracking-[0.2em] mt-1">
                    Management Hub
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-4 px-3 space-y-1 scrollbar-hide ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
            {menuItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.isNested ? (
                  <div className="space-y-1 relative group/nav">
                    <button
                      onClick={item.onToggle}
                      title={isCollapsed ? item.label : ""}
                      className={`w-full flex items-center ${
                        isCollapsed ? "justify-center" : "justify-between px-4"
                      } py-3 rounded-xl transition-all duration-300 group hover:bg-white/5 hover:text-white border-l-2 border-transparent`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          size={20}
                          className="group-hover:scale-110 group-hover:text-indigo-400 transition-all"
                        />
                        {!isCollapsed && (
                          <span className="text-sm font-semibold tracking-wide">
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <div
                          className={`transition-transform duration-300 ${
                            item.isOpen ? "rotate-180" : ""
                          }`}
                        >
                          <ChevronDown size={14} className="opacity-40" />
                        </div>
                      )}
                    </button>

                    {/* Inline Expandable Menu for Expanded Sidebar */}
                    {!isCollapsed && item.isOpen && (
                      <div className="pl-6 pt-1 space-y-1 relative animate-in slide-in-from-top-2 duration-300">
                        <div className="sub-menu-line" />
                        {item.subItems.map((sub) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                              relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ml-4
                              ${
                                isActive
                                  ? "bg-indigo-600/10 text-indigo-400 font-black shadow-glow-indigo"
                                  : "text-slate-500 hover:bg-white/5 hover:text-white font-medium"
                              }
                            `}
                          >
                            {({ isActive }) => (
                              <>
                                {isActive && (
                                  <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                )}
                                <span
                                  className={`text-[13px] tracking-wide transition-all ${
                                    isActive ? "translate-x-1" : ""
                                  }`}
                                >
                                  {sub.label}
                                </span>
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}

                    {/* Flyout Menu for Collapsed Sidebar */}
                    {isCollapsed && (
                      <div className="absolute left-full top-0 ml-2 w-48 bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 z-50">
                        <div className="p-3 border-b border-white/10">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                        </div>
                        <div className="p-2 space-y-1">
                          {item.subItems.map((sub) => (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              onClick={onClose}
                              className={({ isActive }) => `
                                block px-3 py-2 text-sm rounded-lg transition-colors font-semibold tracking-wide
                                ${isActive ? "bg-indigo-600/20 text-indigo-400" : "text-slate-300 hover:bg-white/10 hover:text-white"}
                              `}
                            >
                              {sub.label}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    title={isCollapsed ? item.label : ""}
                    className={({ isActive }) => `
                      relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-300 group overflow-hidden
                      ${
                        isActive
                          ? "bg-indigo-600 text-white font-bold nav-link-glow shadow-indigo-500/30"
                          : "hover:bg-white/5 hover:text-white text-slate-400 font-medium"
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <div className="nav-indicator" />}
                        <item.icon
                          size={20}
                          className={`transition-all duration-300 ${
                            isActive
                              ? "scale-110 text-white"
                              : "group-hover:scale-110 group-hover:text-indigo-400 text-slate-400"
                          }`}
                        />
                        {!isCollapsed && (
                          <span
                            className={`text-sm tracking-wide transition-all ${
                              isActive ? "translate-x-1" : ""
                            }`}
                          >
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-white/5 bg-white/1 mt-auto">
            <div className={`bg-indigo-900/10 border border-white/5 rounded-2xl ${isCollapsed ? 'p-2' : 'p-4'} mb-3 group/profile hover:bg-indigo-900/20 transition-all duration-300`}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center border-2 border-white/10 shadow-lg group-hover/profile:scale-105 transition-all duration-300">
                    <User size={20} className="text-slate-300" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                    <p className="text-[13px] font-black text-white truncate uppercase tracking-tight">
                      {user?.name || user?.code || "Guest User"}
                    </p>
                    <p className="text-[9px] font-bold text-indigo-400/70 truncate uppercase tracking-widest mt-0.5">
                      {user?.role === "admin" ? "Administrator" : "Team Member"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`group flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 w-full px-4 py-3'} rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 font-bold text-[11px] uppercase tracking-[0.2em]`}
              title={isCollapsed ? "Sign Out" : ""}
            >
              <div className="p-1 rounded-lg group-hover:bg-rose-500/10 transition-colors">
                <LogOutIcon size={18} />
              </div>
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
