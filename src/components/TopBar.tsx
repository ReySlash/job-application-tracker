import type { ReactNode } from 'react';
import { Link } from 'react-router';

type Props = {
  action?: ReactNode;
};

function TopBar({ action }: Props) {
  return (
    <nav className="border-b border-slate-200 bg-white px-3 py-2 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="col-start-2 flex min-w-0 items-center justify-center gap-10 text-sm font-medium md:gap-20">
          <Link className="shrink-0 hover:text-teal-600 dark:hover:text-teal-300" to="/">
            Home
          </Link>
          <Link className="shrink-0 hover:text-teal-600 dark:hover:text-teal-300" to="/login">
            Login
          </Link>
          <Link className="shrink-0 hover:text-teal-600 dark:hover:text-teal-300" to="/signup">
            Signup
          </Link>
        </div>
        {action && <div className="col-start-3 justify-self-end">{action}</div>}
      </div>
    </nav>
  );
}
export default TopBar;
