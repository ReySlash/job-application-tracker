import { Link } from "react-router";

function TopBar() {
  return (
    <nav className="flex flex-row justify-center gap-20 border-b border-slate-200 bg-white p-2 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <Link className="hover:text-teal-600 dark:hover:text-teal-300" to="/">Home</Link>
      <Link className="hover:text-teal-600 dark:hover:text-teal-300" to="/login">Login</Link>
      <Link className="hover:text-teal-600 dark:hover:text-teal-300" to="/signup">Signup</Link>
    </nav>
  );
}
export default TopBar;
