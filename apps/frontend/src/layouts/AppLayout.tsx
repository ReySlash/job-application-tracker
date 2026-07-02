import { Outlet, useNavigate } from 'react-router';
import SideBar from '../components/SideBar';
import { useRef, useState } from 'react';
import hamburgerIcon from '../assets/hamburgerIcon.svg';
import closeIcon from '../assets/closeIcon.svg';
import SignoutDialog from '../components/SignoutDialog';
import { useAuth } from '../hooks/useAuth';
import { queryClient } from '../lib/queryClient';

export type AppLayoutOutletContext = {
  closeSidebar: () => void;
  registerMobileOverlayCloser: (closer: (() => void) | null) => void;
};

function AppLayout() {
  const [sidebar, setSidebar] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [signoutDialogOpen, setSignoutDialogOpen] = useState(false);
  const mobileOverlayCloserRef = useRef<(() => void) | null>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const toggleSidebar = () => {
    setSidebar((currentSidebarOpen) => {
      if (!currentSidebarOpen) {
        mobileOverlayCloserRef.current?.();
      }

      return !currentSidebarOpen;
    });
  };

  const openSignOutDialog = () => {
    setSidebar(false);
    setSignOutError(null);
    setSignoutDialogOpen(true);
  };

  const closeSignOutDialog = () => {
    if (isSigningOut) return;

    setSignOutError(null);
    setSignoutDialogOpen(false);
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setSignOutError(null);

    setIsSigningOut(true);

    try {
      await signOut();
      queryClient.clear();
      navigate('/login', { replace: true });
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : 'Failed to sign out. Please try again.',
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const outletContext: AppLayoutOutletContext = {
    closeSidebar: () => setSidebar(false),
    registerMobileOverlayCloser: (closer) => {
      mobileOverlayCloserRef.current = closer;
    },
  };

  return (
    <>
      <div className="relative h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <button
          onClick={toggleSidebar}
          className={`fixed top-1 z-40 rounded p-2 transition-all duration-300 ease-in-out dark:invert ${
            sidebar ? 'left-52' : 'left-3'
          }`}
        >
          <img
            className={`${sidebar ? 'h-6' : 'h-8'} transition-all duration-300 ease-in-out hover:scale-110 hover:cursor-pointer`}
            src={sidebar ? closeIcon : hamburgerIcon}
            alt={sidebar ? 'close sidebar' : 'open sidebar'}
          />
        </button>
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebar(false)}
          className={`fixed inset-0 z-20 bg-black/30 transition-opacity duration-200 ${
            sidebar ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
        <aside
          aria-hidden={!sidebar}
          className={`fixed top-0 left-0 z-30 h-full w-64 overflow-hidden border-r border-gray-200 bg-gray-50 shadow-sm transition-transform duration-300 ease-in-out dark:border-slate-700 dark:bg-slate-900 ${
            sidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-4 pt-14">
            <SideBar openDialog={openSignOutDialog} isSigningOut={isSigningOut} />
          </div>
        </aside>
        <main className="h-full min-w-0 overflow-auto">
          <Outlet context={outletContext} />
        </main>
      </div>

      {signoutDialogOpen && (
        <SignoutDialog
          onClose={closeSignOutDialog}
          signOut={handleSignOut}
          isSigningOut={isSigningOut}
          error={signOutError}
        />
      )}
    </>
  );
}

export default AppLayout;
