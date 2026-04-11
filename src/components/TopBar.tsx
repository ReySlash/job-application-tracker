import { Link } from "react-router";

function TopBar() {
  return (
    <nav className="p-2 flex flex-row gap-20 justify-center">
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
    </nav>
  );
}
export default TopBar;
