import { NavLink } from "react-router";

function SideBar() {
  return (
    <nav className="flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Menu</h2>
      <ul className="flex flex-col gap-2">
        <li className="w-full">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-center block px-4 py-2 rounded-md transition-colors ${isActive ? " bg-teal-600 text-white font-bold" : "text-gray-800 hover:bg-gray-300"}`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li className="w-full">
          <NavLink
            to="/applications"
            className={({ isActive }) =>
              `text-center block px-4 py-2 rounded-md transition-colors ${isActive ? " bg-teal-600 text-white font-bold" : "text-gray-800 hover:bg-gray-300"}`
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
