
// src/components/Navbar.jsx
import logo from "../assets/logo.png";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { startSSO } from "../api/client";

function initialsFromProfile(profile) {
  const name = profile?.name || profile?.email || "";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
const emailOf = (p) => p?.email || p?.preferred_username || p?.name || "Signed in";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, login, token, profile, isAuthed } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const location = useLocation();

  const authed = typeof isAuthed === "boolean" ? isAuthed : !!(token || profile);

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

  const linkBase = scrolled ? "text-slate-800" : "text-white";
  const linkCls = `${linkBase} hover:opacity-80 transition`;

  const handleLogin = async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      if (typeof login === "function") await login();
      else await startSSO();
    } catch (e) {
      console.error(e);
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch (e) { console.error(e); }
    // Go to a neutral page to avoid /login auto-redirects
    navigate("/", { replace: true });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "bg-white/95 shadow" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Highway to Heal" className="h-10 w-auto object-contain hover:opacity-90 transition" />
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-10 text-base font-medium">
          <a href="#about" className={linkCls} onClick={onHashClick}>About</a>
          <a href="#journey" className={linkCls} onClick={onHashClick}>The Journey</a>
          <a href="#events" className={linkCls} onClick={onHashClick}>Event Details</a>
          <Link to="/booking" className={linkCls}>Book Now</Link>
          <a href="#contact" className={linkCls} onClick={onHashClick}>Contact</a>
        </nav>

        <div className="hidden md:flex items-center justify-end gap-3 relative">
          {authed ? (
            <>
              <button
                type="button"
                className={`rounded-full w-9 h-9 grid place-items-center font-semibold ${scrolled ? "bg-slate-900 text-white" : "bg-white/90 text-slate-900"} hover:scale-105 transition`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title={emailOf(profile)}
              >
                {initialsFromProfile(profile)}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-slate-100 w-44 overflow-hidden">
                  <div className="px-3 py-2 text-xs text-slate-500">{emailOf(profile)}</div>
                  <Link to="/dashboard" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                    My Bookings
                  </Link>
                  <button type="button" className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
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

      {open && (
        <div className={`md:hidden ${scrolled ? "bg-white/95" : "bg-black/70 backdrop-blur"} border-t border-white/10`}>
          <div className="container py-3">
            <nav className="flex flex-col gap-3 text-sm">
              <a href="#about" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>About</a>
              <a href="#journey" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>The Journey</a>
              <a href="#events" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>Event Details</a>
              <Link to="/booking" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={() => setOpen(false)}>Book Now</Link>
              <a href="#contact" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>Contact</a>

              <div className="pt-2">
                {authed ? (
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full w-9 h-9 grid place-items-center font-semibold ${scrolled ? "bg-slate-900 text-white" : "bg-white/90 text-slate-900"}`} title={emailOf(profile)}>
                      {initialsFromProfile(profile)}
                    </div>
                    <button type="button" className="btn-dark" onClick={handleLogout}>Logout</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-full px-5 py-2 font-semibold border-2 border-black text-black bg-transparent hover:bg-black/5 transition disabled:opacity-70"
                    onClick={async () => { setOpen(false); await handleLogin(); }}
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
