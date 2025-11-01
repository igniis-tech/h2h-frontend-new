import logo from "../assets/logo.png";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { startSSO } from "../api/client";

// Works for both shapes: { user: {...} } and a flat { ... }
function getPerson(p) { return (p && (p.user || p.data || p)) || null; }
function bestName(p) {
  const u = getPerson(p);
  return u?.profile?.full_name || u?.name || u?.username || u?.email || "";
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
function displayOf(p) { return bestName(p); }

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout, profile, isAuthed, loading } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const avatarBtnRef = useRef(null);
  const menuRef = useRef(null);
  const firstMenuItemRef = useRef(null);
  const secondMenuItemRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // Scroll style
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > 10;
        setScrolled((prev) => (prev !== next ? next : prev));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => { setOpen(false); setMenuOpen(false); }, [location]);

  // Close avatar menu on outside click or Escape; focus first item on open
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      const t = e.target;
      if (!menuRef.current || !avatarBtnRef.current) return;
      if (menuRef.current.contains(t) || avatarBtnRef.current.contains(t)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setMenuOpen(false);
        avatarBtnRef.current?.focus();
      } else if (e.key === "ArrowDown" || e.key === "Down") {
        e.preventDefault();
        (firstMenuItemRef.current || secondMenuItemRef.current)?.focus();
      } else if (e.key === "ArrowUp" || e.key === "Up") {
        e.preventDefault();
        (secondMenuItemRef.current || firstMenuItemRef.current)?.focus();
      }
    };
    const to = setTimeout(() => firstMenuItemRef.current?.focus(), 0);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(to);
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const onHashClick = useCallback((e) => {
    const href = e.currentTarget.getAttribute("href");
    if (href?.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  }, []);

  const toggleMobile = useCallback(() => setOpen((o) => !o), []);
  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);

  const handleLogin = useCallback(async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    try { await startSSO(); }
    finally { if (mountedRef.current) setLoggingIn(false); }
  }, [loggingIn]);

  const handleLogout = useCallback(async () => {
    try { await logout(); } catch {}
    navigate("/", { replace: true });
  }, [logout, navigate]);

  const initials = useMemo(() => initialsFrom(profile), [profile]);

  const linkBase = scrolled ? "text-slate-800" : "text-white";
  const linkCls = useMemo(
    () => `${linkBase} hover:opacity-80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40`,
    [linkBase]
  );

  const showAvatar = !!isAuthed;
  const menuId = "user-menu";
  const mobileMenuId = "mobile-menu";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "bg-white/95 shadow" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" className="flex items-center gap-3" aria-label="Go to homepage">
          <img src={logo} alt="Highway to Heal" className="h-10 w-auto object-contain hover:opacity-90 transition" decoding="async" />
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-10 text-base font-medium" role="navigation" aria-label="Primary">
          <a href="#about" className={linkCls} onClick={onHashClick}>About</a>
          <a href="#journey" className={linkCls} onClick={onHashClick}>The Journey</a>
          <a href="#events" className={linkCls} onClick={onHashClick}>Event Details</a>
          <Link to="/register" className={linkCls}>Book Now</Link>
        </nav>

        <div className="hidden md:flex items-center justify-end gap-3 relative min-w-[120px]">
          {showAvatar ? (
            <>
              <button
                ref={avatarBtnRef}
                type="button"
                className={`rounded-full w-9 h-9 grid place-items-center font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  scrolled ? "bg-slate-900 text-black" : "bg-white/90 text-slate-900"
                } hover:scale-105 transition`}
                onClick={toggleMenu}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                title={displayOf(profile)}
              >
                {initials ? initials : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M12 12c2.8 0 5-2.7 5-6s-2.2-5-5-5-5 2.7-5 6 2.2 5 5 5Zm0 2c-4.4 0-8 2.7-8 6v1h16v-1c0-3.3-3.6-6-8-6Z"/>
                  </svg>
                )}
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  id={menuId}
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-slate-100 w-44 overflow-hidden"
                >
                  <div className="px-3 py-2 text-xs text-slate-500 truncate" title={displayOf(profile)}>
                    {displayOf(profile)}
                  </div>
                  <Link
                    ref={firstMenuItemRef}
                    to="/dashboard"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-black hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    ref={secondMenuItemRef}
                    type="button"
                    role="menuitem"
                    className="w-full text-left text-black px-4 py-2 text-sm hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
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
              className="rounded-full px-5 py-2 font-semibold border-2 border-black text-black bg-transparent hover:bg-black/5 transition disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40"
              onClick={handleLogin}
              disabled={loggingIn || loading}
              aria-busy={loggingIn ? "true" : "false"}
            >
              {loggingIn ? "Redirecting…" : "Login"}
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-controls={mobileMenuId}
          aria-expanded={open}
          className={`md:hidden rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            scrolled ? "text-slate-800" : "text-white"
          }`}
          onClick={toggleMobile}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <rect x="3" y="6" width="18" height="2" rx="1" />
            <rect x="3" y="11" width="18" height="2" rx="1" />
            <rect x="3" y="16" width="18" height="2" rx="1" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          id={mobileMenuId}
          className={`md:hidden ${scrolled ? "bg-white/95" : "bg-black/70 backdrop-blur"} border-t border-white/10`}
          role="navigation"
          aria-label="Primary mobile"
        >
          <div className="container py-3">
            <nav className="flex flex-col gap-3 text-sm">
              <a href="#about" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>About</a>
              <a href="#journey" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>The Journey</a>
              <a href="#events" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={onHashClick}>Event Details</a>
              <Link to="/register" className={`${scrolled ? "text-slate-800" : "text-white"} py-1`} onClick={() => setOpen(false)}>Book Now</Link>

              {/* UPDATED MOBILE USER SECTION */}
              <div className="pt-3">
                {showAvatar ? (
                  <div className="flex flex-col gap-3">
                    {/* avatar + name */}
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-full w-9 h-9 grid place-items-center font-semibold bg-white/90 text-slate-900"
                        title={displayOf(profile)}
                        aria-hidden="true"
                      >
                        {initials ? initials : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                            <path d="M12 12c2.8 0 5-2.7 5-6s-2.2-5-5-5-5 2.7-5 6 2.2 5 5 5Zm0 2c-4.4 0-8 2.7-8 6v1h16v-1c0-3.3-3.6-6-8-6Z"/>
                          </svg>
                        )}
                      </div>
                      <div className={`${scrolled ? "text-slate-800" : "text-white"} min-w-0`}>
                        <div className="text-sm font-medium truncate">{displayOf(profile)}</div>
                        <div className="text-xs opacity-70">Signed in</div>
                      </div>
                    </div>

                    {/* actions */}
                    <Link
                      to="/dashboard"
                      className="w-full rounded-full px-5 py-2 font-semibold bg-white text-black border border-slate-200 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40"
                      onClick={() => setOpen(false)}
                    >
                      My Bookings
                    </Link>

                    <button
                      type="button"
                      className="w-full rounded-full px-5 py-2 font-semibold bg-white text-black border border-slate-200 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40"
                      onClick={async () => { setOpen(false); await handleLogout(); }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-full px-5 py-2 font-semibold border-2 border-black text-black bg-transparent hover:bg-black/5 transition disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40"
                    onClick={async () => { setOpen(false); await handleLogin(); }}
                    disabled={loggingIn || loading}
                    aria-busy={loggingIn ? "true" : "false"}
                  >
                    {loggingIn ? "Redirecting…" : "Login"}
                  </button>
                )}
              </div>
              {/* END UPDATED MOBILE USER SECTION */}
            </nav>
          </div>
        </div>
      )}
      
    </header>
  );
}
