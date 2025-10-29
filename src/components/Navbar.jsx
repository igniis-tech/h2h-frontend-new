// src/components/Navbar.jsx
import logo from "../assets/logo.png";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { startSSO } from "../api/client";

/* ----------------------- helpers ----------------------- */
// Works for both shapes: { user: {...} } and a flat { ... }
function getPerson(p) {
  return (p && (p.user || p.data || p)) || null;
}
function bestName(p) {
  const u = getPerson(p);
  return (
    u?.profile?.full_name ||
    u?.name ||
    u?.username ||
    u?.email ||
    ""
  );
}
function initialsFrom(p) {
  const name = bestName(p);
  if (!name) return null;
  const base = name.includes("@") ? name.split("@")[0] : name;
  const parts = base.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  if (parts.length === 1) return (parts[0][0] || "").toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function displayOf(p) {
  return bestName(p);
}
/* ------------------------------------------------------- */

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // from AuthContext
  const { logout, login, token, profile, isAuthed, loading, refresh } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // Wake up quickly after SSO callback (in case profile hasn’t hydrated yet)
  useEffect(() => {
    if (isAuthed && !profile && !loading) {
      // one opportunistic probe; AuthContext already handles most cases
      refresh?.().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, loading]);

  // scroll styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus on route change
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
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
    navigate("/", { replace: true });
  };

  const person = useMemo(() => getPerson(profile), [profile]);
  const initials = useMemo(() => initialsFrom(profile), [profile]);

  // show avatar area whenever we’re authed (token or profile)
  const showAvatar = !!isAuthed;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? "bg-white/95 shadow" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Highway to Heal"
            className="h-10 w-auto object-contain hover:opacity-90 transition"
          />
        </Link>

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
          <Link to="/register" className={linkCls}>
            Book Now
          </Link>
          <a href="#contact" className={linkCls} onClick={onHashClick}>
            Contact
          </a>
        </nav>

        {/* Right side actions */}
        <div className="hidden md:flex items-center justify-end gap-3 relative min-w-[120px]">
          {showAvatar ? (
            <>
              <button
                type="button"
                className={`rounded-full w-9 h-9 grid place-items-center font-semibold ${
                  scrolled ? "bg-slate-900 text-white" : "bg-white/90 text-slate-900"
                } hover:scale-105 transition`}
                onClick={() => setMenuOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title={displayOf(profile)}
              >
                {initials ? (
                  initials
                ) : (
                  // fallback user glyph while we wait for profile/initials
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 12c2.8 0 5-2.7 5-6s-2.2-5-5-5-5 2.7-5 6 2.2 5 5 5Zm0 2c-4.4 0-8 2.7-8 6v1h16v-1c0-3.3-3.6-6-8-6Z"/>
                  </svg>
                )}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-slate-100 w-44 overflow-hidden">
                  <div
                    className="px-3 py-2 text-xs text-slate-500 truncate"
                    title={displayOf(profile)}
                  >
                    {displayOf(profile)}
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    onClick={handleLogout}
                  >
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
              disabled={loggingIn || loading}
            >
              {loggingIn ? "Redirecting…" : "Login"}
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          className={`md:hidden rounded-lg p-2 ${scrolled ? "text-slate-800" : "text-white"}`}
          onClick={() => setOpen(o => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="6" width="18" height="2" rx="1" />
            <rect x="3" y="11" width="18" height="2" rx="1" />
            <rect x="3" y="16" width="18" height="2" rx="1" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          className={`md:hidden ${
            scrolled ? "bg-white/95" : "bg-black/70 backdrop-blur"
          } border-t border-white/10`}
        >
          <div className="container py-3">
            <nav className="flex flex-col gap-3 text-sm">
              <a href="#about" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>About</a>
              <a href="#journey" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>The Journey</a>
              <a href="#events" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>Event Details</a>
              <Link to="/register" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={() => setOpen(false)}>Book Now</Link>
              <a href="#contact" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>Contact</a>

              <div className="pt-2">
                {showAvatar ? (
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full w-9 h-9 grid place-items-center font-semibold ${
                        scrolled ? "bg-slate-900 text-white" : "bg-white/90 text-slate-900"
                      }`}
                      title={displayOf(profile)}
                    >
                      {initials ? initials : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M12 12c2.8 0 5-2.7 5-6s-2.2-5-5-5-5 2.7-5 6 2.2 5 5 5Zm0 2c-4.4 0-8 2.7-8 6v1h16v-1c0-3.3-3.6-6-8-6Z"/>
                        </svg>
                      )}
                    </div>
                    <button type="button" className="btn-dark" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-full px-5 py-2 font-semibold border-2 border-black text-black bg-transparent hover:bg-black/5 transition disabled:opacity-70"
                    onClick={async () => { setOpen(false); await handleLogin(); }}
                    disabled={loggingIn || loading}
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
