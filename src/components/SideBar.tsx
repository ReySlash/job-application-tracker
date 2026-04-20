import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { resetDemoApplications } from '../api/applications';
import { useAuth } from '../hooks/useAuth';
import { queryClient } from '../lib/queryClient';
import ThemeToggle from './ThemeToggle';

function SideBar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [demoResetMessage, setDemoResetMessage] = useState<string | null>(null);
  const [demoResetError, setDemoResetError] = useState<string | null>(null);
  const isDemoUser = Boolean(user?.is_anonymous);

  const handleResetDemo = async () => {
    if (!user || !isDemoUser || isResettingDemo) return;

    setDemoResetError(null);
    setDemoResetMessage(null);
    setIsResettingDemo(true);

    try {
      await resetDemoApplications(user.id);
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      setDemoResetMessage('Demo data restored.');
    } catch (error) {
      setDemoResetError(error instanceof Error ? error.message : 'Failed to reset demo data.');
    } finally {
      setIsResettingDemo(false);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setSignOutError(null);

    if (!confirm('Are you sure you want to sign out?')) return;

    setIsSigningOut(true);

    try {
      await signOut();
      queryClient.clear();
      navigate('/login', { replace: true });
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="flex flex-col gap-4">
      <h2 className="mb-4 text-center text-xl font-bold text-gray-800 dark:text-slate-100">Menu</h2>
      <div className="flex justify-center">
        <ThemeToggle />
      </div>
      <ul className="flex flex-col gap-2">
        <li className="w-full">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block rounded-md px-4 py-2 text-center transition-colors ${isActive ? 'bg-teal-600 font-bold text-white' : 'text-gray-800 hover:bg-gray-300 dark:text-slate-200 dark:hover:bg-slate-800'}`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li className="w-full">
          <NavLink
            to="/applications"
            className={({ isActive }) =>
              `block rounded-md px-4 py-2 text-center transition-colors ${isActive ? 'bg-teal-600 font-bold text-white' : 'text-gray-800 hover:bg-gray-300 dark:text-slate-200 dark:hover:bg-slate-800'}`
            }
          >
            Applications
          </NavLink>
        </li>
      </ul>
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-slate-700">
        {user?.email && (
          <p className="mb-3 truncate text-center text-sm text-gray-500 dark:text-slate-400">
            {user.email}
          </p>
        )}
        {isDemoUser && (
          <p className="mb-3 text-center text-sm text-slate-500 dark:text-slate-400">
            Demo workspace
          </p>
        )}
        {demoResetMessage && (
          <p
            className="mb-3 rounded border border-green-300 bg-green-100 px-3 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/70 dark:text-green-200"
            role="status"
          >
            {demoResetMessage}
          </p>
        )}
        {demoResetError && (
          <p
            className="mb-3 rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200"
            role="alert"
          >
            {demoResetError}
          </p>
        )}
        {signOutError && (
          <p
            className="mb-3 rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200"
            role="alert"
          >
            {signOutError}
          </p>
        )}
        {isDemoUser && (
          <button
            type="button"
            disabled={isResettingDemo}
            onClick={handleResetDemo}
            className="mb-3 w-full rounded-md border border-teal-300 px-4 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-950/50"
          >
            {isResettingDemo ? 'Resetting...' : 'Reset demo data'}
          </button>
        )}
        <button
          type="button"
          disabled={isSigningOut}
          onClick={handleSignOut}
          className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </nav>
  );
}

export default SideBar;
