import { NavLink } from "react-router";

function SideBar() {
  return (
    <nav className="flex flex-col gap-4">
      <h2 className="mb-4 text-center text-xl font-bold text-gray-800 dark:text-slate-100">Menu</h2>
      <ul className="flex flex-col gap-2">
        <li className="w-full">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block rounded-md px-4 py-2 text-center transition-colors ${isActive ? " bg-teal-600 font-bold text-white" : "text-gray-800 hover:bg-gray-300 dark:text-slate-200 dark:hover:bg-slate-800"}`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li className="w-full">
          <NavLink
            to="/applications"
            className={({ isActive }) =>
              `block rounded-md px-4 py-2 text-center transition-colors ${isActive ? " bg-teal-600 font-bold text-white" : "text-gray-800 hover:bg-gray-300 dark:text-slate-200 dark:hover:bg-slate-800"}`
            }
          >
            Applications
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default SideBar;
