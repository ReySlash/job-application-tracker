import { Outlet } from 'react-router';
import SideBar from '../components/SideBar';
import { useState } from 'react';
import hamburgerIcon from '../assets/hamburgerIcon.svg';
import closeIcon from '../assets/closeIcon.svg';

function AppLayout() {
  const [sidebar, setSidebar] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebar(!sidebar);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <button
        onClick={toggleSidebar}
        className={`fixed top-1 z-40 rounded p-2 transition-all duration-300 ease-in-out ${
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
        className={`fixed top-0 left-0 z-30 h-full w-64 overflow-hidden border-r border-gray-200 bg-gray-50 shadow-sm transition-transform duration-300 ease-in-out ${
          sidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 pt-14">
          <SideBar />
        </div>
      </aside>
      <main className="h-full min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
