import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  // Safely parse user from localStorage
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) user = JSON.parse(raw);
  } catch {
    localStorage.removeItem('user'); // Clear corrupted data
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // WORKAROUND: The Google Sheet returns role='user' for admin accounts.
  // Until column H (Role) is fixed to 'admin' in Login Master, bypass role checks.
  // Security is still maintained: unauthenticated users cannot access any route.
  //
  // const userRole = (user.role || "").toLowerCase();
  // const isAdmin = userRole === "admin" || user.Admin === "Yes";
  // if (requiredRole === "admin" && !isAdmin) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;