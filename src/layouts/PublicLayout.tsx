import { Outlet } from "react-router";
import TopBar from "../components/TopBar";

function PublicLayout() {
  return (
    <>
      <header>
        <TopBar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default PublicLayout;
