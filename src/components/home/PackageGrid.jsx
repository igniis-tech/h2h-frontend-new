import React, { useEffect, useState } from "react";
import { request, formatINR } from "../../api/client";
import { Link } from "react-router-dom";

export default function PackageGrid({ showHeader = false }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    request("/packages")
      .then((d) => {
        const raw = Array.isArray(d) ? d : d?.packages || d?.data?.packages || d?.results || [];
        // Normalize features so every card gets a clean array of items
        const pkgs = (raw || []).map(normalizePackageItems);
        setPackages(pkgs);
      })
      .catch((error) => {
        console.error("Failed to load packages:", error);
        setError(error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border-2 border-earthy/60 bg-forest/5 p-8 animate-pulse"
          >
            <div className="h-6 bg-slate-700 rounded w-2/3 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-1/2 mb-6"></div>
            <div className="space-y-3 flex-grow">
              <div className="h-4 bg-slate-700/50 rounded w-full"></div>
              <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
              <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
            </div>
            <div className="h-12 bg-slate-700 rounded-lg mt-8"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Failed to load packages: {error}</p>
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>No packages available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {packages.map((p) => (
        <div
          key={p.id || p.name}
          className={`flex flex-col rounded-xl border-2 ${p.featured ? "border-primary bg-forest/10" : "border-earthy/60 bg-forest/5"
            } p-8`}
        >
          <h3 className="text-primary text-xl font-bold">{p.name}</h3>

          <p className="text-brandDark my-4 text-4xl font-black">
            {formatINR(p.price_inr || p.price || p.amount || 0)}
          </p>

          {/* DETAILS: tick on every new line, aligned via 2-col grid */}
          <ul className="flex-grow space-y-3 text-brandDark/80">
            {(p._items || []).map((it, idx) => (
              <li
                key={idx}
                className="grid grid-cols-[24px,1fr] items-start gap-2 leading-relaxed"
              >
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-emerald-600 text-xl"
                >
                  check_circle
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ul>

          <Link
            to={`/register?pkg=${p.id}`}
            state={{ pkgId: String(p.id) }}
            className={`mt-8 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 ${p.featured
                ? "bg-primary text-white hover:opacity-90"
                : "bg-primary/15 text-primary hover:bg-primary hover:text-white"
              } text-base font-bold leading-normal tracking-[0.015em] transition-all`}
          >
            <span className="truncate">{p.featured ? "Register Now" : "Book Now"}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}

/** Convert mixed data (string with semicolons / bullets or array) into a clean items array */
function normalizePackageItems(p) {
  let items = [];

  if (Array.isArray(p.items) && p.items.length) {
    items = p.items;
  } else {
    const text =
      (typeof p.description === "string" && p.description) ||
      (typeof p.details === "string" && p.details) ||
      "";
    // Split on semicolons, bullets, or newlines. (Don't split by comma—keeps phrases like "Pick up & Drop".)
    items = text
      .split(/[;\n\r•]+/g)
      .map((s) =>
        String(s)
          .replace(/^[\s\-–—•]+/, "")
          .replace(/[.;,\s]+$/g, "")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter(Boolean);
  }

  return { ...p, _items: items };
}


