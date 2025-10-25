// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../state/auth";
// import { startSSO } from "../api/client";

// export default function NavBar() {
//   const { user, setUser } = useAuth();
//   const navigate = useNavigate();

//   async function handleLogin() {
//     // kicks off SSO redirect
//     startSSO();
//   }

//   async function handleLogout() {
//     // optional: call backend logout, but clear client state regardless
//     try {
//       // await api.logout(); // if you had it enabled server side
//     } catch {}
//     try { localStorage.removeItem("jwt"); } catch {}
//     try { sessionStorage.removeItem("jwt"); } catch {}
//     try { localStorage.removeItem("user_info"); } catch {}
//     try { sessionStorage.removeItem("user_info"); } catch {}
//     setUser(null);
//     navigate("/", { replace: true });
//   }

//   return (
//   <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur px-4 py-3">
//       <Link to="/" className="flex items-center gap-2">
//         <div className="size-6 rounded-full bg-primary" />
//         <span className="font-bold">Highway to Heal</span>
//       </Link>

//       <nav className="hidden md:flex items-center gap-6">
//         <a href="#about" className="hover:text-primary">About</a>
//         {/* <a href="#schedule" className="hover:text-primary">Schedule</a> */}
//         <a href="#artists" className="hover:text-primary">Artists</a>
//         {/* <a href="#location" className="hover:text-primary">Location</a> */}
//         <a href="#pricing" className="hover:text-primary">Pricing</a>
//         <Link to="/register" className="rounded-lg bg-primary text-white font-bold px-4 py-2">
//           Book Now
//         </Link>
//         {user ? (
//           <>
//             <Link to="/profile" className="hover:text-primary">Profile</Link>
//             <button onClick={handleLogout} className="hover:text-primary">Logout</button>
//           </>
//         ) : (
//           <button onClick={handleLogin} className="hover:text-primary">Login</button>
//         )}
//       </nav>
//     </header>
//   );
// }
import logo from "../assets/logo.png";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { startSSO } from "../api/client";
import { useAuth } from "../state/auth";
// import "./navbar.css"; // keep off if you don't want CSS to override Tailwind

function initialsFromProfile(profile) {
  const name = profile?.name || profile?.email || "";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
  const { token, logout, profile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [location]);

  const onHashClick = (e) => {
    const href = e.currentTarget.getAttribute("href");
    if (href?.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  };

  // (optional) If you want labels always black, set linkCls = "text-slate-800 ..."
  const linkBase = scrolled ? "text-slate-800" : "text-white";
  const linkCls = `${linkBase} hover:opacity-80 transition`;

  const handleLogin = async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      await startSSO();
    } catch (e) {
      console.error(e);
      setLoggingIn(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? "bg-white/95 shadow" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 md:px-10">
        {/* Left: logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Highway to Heal"
            className="h-10 w-auto object-contain hover:opacity-90 transition"
          />
        </Link>

        {/* Center: nav (desktop) */}
        <nav className="hidden md:flex items-center justify-center gap-10 text-base font-medium">
          <a href="#about" className={linkCls} onClick={onHashClick}>
            About
          </a>
          <a href="#journey" className={linkCls} onClick={onHashClick}>
            The Journey
          </a>
          <a href="#events" className={linkCls} onClick={onHashClick}>
            Event Details
          </a>
          <Link to="/booking" className={linkCls}>
            Book Now
          </Link>
          <a href="#contact" className={linkCls} onClick={onHashClick}>
            Contact
          </a>
        </nav>

        {/* Right: auth / profile (desktop) */}
        <div className="hidden md:flex items-center justify-end gap-3 relative">
          {token ? (
            <>
              {/* Avatar button */}
              <button
                type="button"
                className={`rounded-full w-9 h-9 grid place-items-center font-semibold ${
                  scrolled ? "bg-slate-900 text-black" : "bg-black/90 text-slate-900"
                } hover:scale-105 transition`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title={profile?.email || "Profile"}
              >
                {initialsFromProfile(profile)}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-slate-100 w-44 overflow-hidden">
                  <div className="px-3 py-2 text-xs text-slate-500">
                    {profile?.email || "Signed in"}
                  </div>
                  <Link
                    to="/booking"
                    className="block px-4 py-2 text-sm hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            // DESKTOP LOGIN — transparent bg, black border + black text
            <button
              type="button"
              className="rounded-full px-5 py-2 font-semibold border-2 border-black text-black bg-transparent hover:bg-black/5 transition disabled:opacity-70"
              onClick={handleLogin}
              disabled={loggingIn}
            >
              {loggingIn ? "Redirecting…" : "Login"}
            </button>
          )}
        </div>

        {/* Mobile: hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          className={`md:hidden rounded-lg p-2 ${scrolled ? "text-slate-800" : "text-white"}`}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="6" width="18" height="2" rx="1" />
            <rect x="3" y="11" width="18" height="2" rx="1" />
            <rect x="3" y="16" width="18" height="2" rx="1" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className={`md:hidden ${
            scrolled ? "bg-white/95" : "bg-black/70 backdrop-blur"
          } border-t border-white/10`}
        >
          <div className="container py-3">
            <nav className="flex flex-col gap-3 text-sm">
              <a
                href="#about"
                className={`${scrolled ? "text-slate-800" : "text-white"} py-1`}
                onClick={onHashClick}
              >
                About
              </a>
              <a
                href="#journey"
                className={`${scrolled ? "text-slate-800" : "text-white"} py-1`}
                onClick={onHashClick}
              >
                The Journey
              </a>
              <a
                href="#events"
                className={`${scrolled ? "text-slate-800" : "text-white"} py-1`}
                onClick={onHashClick}
              >
                Event Details
              </a>
              <Link
                to="/booking"
                className={`${scrolled ? "text-slate-800" : "text-white"} py-1`}
                onClick={() => setOpen(false)}
              >
                Book Now
              </Link>
              <a
                href="#contact"
                className={`${scrolled ? "text-slate-800" : "text-white"} py-1`}
                onClick={onHashClick}
              >
                Contact
              </a>

              <div className="pt-2">
                {token ? (
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full w-9 h-9 grid place-items-center font-semibold ${
                        scrolled
                          ? "bg-slate-900 text-white"
                          : "bg-white/90 text-slate-900"
                      }`}
                      title={profile?.email || "Profile"}
                    >
                      {initialsFromProfile(profile)}
                    </div>
                    <button
                      type="button"
                      className="btn-dark"
                      onClick={() => {
                        setOpen(false);
                        logout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  // MOBILE LOGIN — transparent bg, black border + black text
                  <button
                    type="button"
                    className="w-full rounded-full px-5 py-2 font-semibold border-2 border-black text-black bg-transparent hover:bg-black/5 transition disabled:opacity-70"
                    onClick={async () => {
                      setOpen(false);
                      await handleLogin();
                    }}
                    disabled={loggingIn}
                  >
                    {loggingIn ? "Redirecting…" : "Login"}
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
