import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  // Check if admin is authenticated
  const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
  const loginTime = sessionStorage.getItem('adminLoginTime');

  // Optional: Add session timeout (e.g., 2 hours)
  if (isAdminAuthenticated && loginTime) {
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);

    // Expire session after 2 hours
    if (hoursSinceLogin > 2) {
      sessionStorage.removeItem('adminAuthenticated');
      sessionStorage.removeItem('adminLoginTime');
      return <Navigate to="/admin-login" replace />;
    }
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;