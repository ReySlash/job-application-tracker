import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';

function PublicOnlyRoute() {
  const { isAuthLoading, isPasswordRecovery, user } = useAuth();
  const location = useLocation();
  const isResetPasswordRoute = location.pathname === '/reset-password';

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Restoring your session...
      </div>
    );
  }

  if (user && !(isResetPasswordRoute && isPasswordRecovery)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
