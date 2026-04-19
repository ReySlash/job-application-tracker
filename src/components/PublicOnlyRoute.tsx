import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';

function PublicOnlyRoute() {
  const { isAuthLoading, user } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Restoring your session...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
