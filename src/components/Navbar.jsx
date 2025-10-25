import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { startSSO } from "../api/client";

export default function NavBar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogin() {
    // kicks off SSO redirect
    startSSO();
  }

  async function handleLogout() {
    // optional: call backend logout, but clear client state regardless
    try {
      // await api.logout(); // if you had it enabled server side
    } catch {}
    try { localStorage.removeItem("jwt"); } catch {}
    try { sessionStorage.removeItem("jwt"); } catch {}
    try { localStorage.removeItem("user_info"); } catch {}
    try { sessionStorage.removeItem("user_info"); } catch {}
    setUser(null);
    navigate("/", { replace: true });
  }

  return (
  <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur px-4 py-3">
      <Link to="/" className="flex items-center gap-2">
        <div className="size-6 rounded-full bg-primary" />
        <span className="font-bold">Highway to Heal</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6">
        <a href="#about" className="hover:text-primary">About</a>
        {/* <a href="#schedule" className="hover:text-primary">Schedule</a> */}
        <a href="#artists" className="hover:text-primary">Artists</a>
        {/* <a href="#location" className="hover:text-primary">Location</a> */}
        <a href="#pricing" className="hover:text-primary">Pricing</a>
        <Link to="/register" className="rounded-lg bg-primary text-white font-bold px-4 py-2">
          Book Now
        </Link>
        {user ? (
          <>
            <Link to="/profile" className="hover:text-primary">Profile</Link>
            <button onClick={handleLogout} className="hover:text-primary">Logout</button>
          </>
        ) : (
          <button onClick={handleLogin} className="hover:text-primary">Login</button>
        )}
      </nav>
    </header>
  );
}
