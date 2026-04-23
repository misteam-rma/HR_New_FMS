import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employee from "./pages/Employee";
import MyAttendance from "./pages/MyAttendance";
import CompanyCalendar from "./pages/CompanyCalendar";
import ProtectedRoute from "./components/ProtectedRoute";
import Attendance from "./pages/Attendance";
import AttendanceDaily from "./pages/AttendanceDaily";
import LeaveManagement from "./pages/LeaveManagement";
import License from "./pages/License";
import Noc108 from "./pages/Noc108";
import Reimbursement from "./pages/Reimbursement";
import Feedback from "./pages/Feedback";
import Artical from "./pages/Artical";
import ArticalAttendence from "./pages/ArticalAttendence";

function App() {
  return (
    <div className="gradient-bg min-h-screen">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="employee"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Employee />
                </ProtectedRoute>
              }
            />
            <Route path="my-attendance" element={<MyAttendance />} />
            <Route
              path="attendance/daily"
              element={
                <ProtectedRoute>
                  <AttendanceDaily />
                </ProtectedRoute>
              }
            />
            <Route
              path="attendance/monthly"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route path="company-calendar" element={<CompanyCalendar />} />
            <Route
              path="leave-management"
              element={
                <ProtectedRoute requiredRole="admin">
                  <LeaveManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="license"
              element={
                <ProtectedRoute>
                  <License />
                </ProtectedRoute>
              }
            />
            <Route
              path="108-noc"
              element={
                <ProtectedRoute>
                  <Noc108 />
                </ProtectedRoute>
              }
            />
            <Route
            path="reimbursement"
            element={
              <ProtectedRoute>
                <Reimbursement />
              </ProtectedRoute>
            }
            />
            <Route
              path="feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="artical"
              element={
                <ProtectedRoute>
                  <Artical />
                </ProtectedRoute>
              }
            />
            <Route
              path="article-attendance"
              element={
                <ProtectedRoute>
                  <ArticalAttendence />
                </ProtectedRoute>
              }
            />
            <Route
              path="leave-request"
              element={
                <ProtectedRoute>
                  <LeaveManagement />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
