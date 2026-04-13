import { Outlet } from "react-router";
import SideBar from "../components/SideBar";
import { useState } from "react";
import hamburgerIcon from "../assets/hamburgerIcon.svg";
import closeIcon from "../assets/closeIcon.svg";
import ApplicationsProvider from "../providers/ApplicationsProvider";

function AppLayout() {
  const [sidebar, setSidebar] = useState<boolean>(true);

  const toggleSidebar = () => {
    setSidebar(!sidebar);
  };

  return (
    <div className="relative flex h-screen overflow-hidden">
      <button
        onClick={toggleSidebar}
        className={`absolute top-1 z-10 rounded p-2 transition-all duration-300 ease-in-out ${
          sidebar ? "left-52" : "left-3"
        }`}
      >
        <img
          className={`${sidebar ? "h-6" : "h-8"} transition-all duration-300 ease-in-out hover:cursor-pointer`}
          src={sidebar ? closeIcon : hamburgerIcon}
          alt={sidebar ? "close sidebar" : "open sidebar"}
        />
      </button>
      <aside
        className={`bg-gray-50 border-gray-200 transition-all duration-300 ease-in-out ${
          sidebar
            ? "w-64 border-r opacity-100 shadow-sm"
            : "w-0 border-r-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-4 pt-14">
          <SideBar />
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto">
        <ApplicationsProvider>
          <Outlet />
        </ApplicationsProvider>
      </main>
    </div>
  );
}

export default AppLayout;
