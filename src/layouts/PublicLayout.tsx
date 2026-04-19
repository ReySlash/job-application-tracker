import { Outlet } from "react-router";
import TopBar from "../components/TopBar";
import ThemeToggle from "../components/ThemeToggle";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header>
        <div className="relative">
          <TopBar />
          <div className="absolute top-2 right-3">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
