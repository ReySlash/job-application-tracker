import { Outlet } from 'react-router';
import TopBar from '../components/TopBar';
import ThemeToggle from '../components/ThemeToggle';

function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 bg-slate-50 shadow-sm dark:bg-slate-950">
        <TopBar action={<ThemeToggle />} />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
