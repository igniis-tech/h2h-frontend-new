// src/components/common/WhatsAppFAB.jsx
import React from "react";

export default function WhatsAppFAB({
  phone = "+919836007110", // ← replace with your number
  message = "Hi! I’d like to know more about Highway to Heal.",
  label = "Chat on WhatsApp",
  className = "",
}) {
  const digits = String(phone).replace(/[^\d]/g, "");
  const text =
    typeof window !== "undefined" ? `${message} (${window.location.href})` : message;
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;

  // Official logo from Wikipedia (vector)
  const iconUrl =
    "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`fixed z-50 bottom-5 right-5 md:bottom-8 md:right-8 ${className}`}
    >
      <span className="sr-only">{label}</span>

      {/* pulse */}
      <span className="absolute inset-0 -z-10 rounded-full animate-ping bg-[#25D366]/40 h-14 w-14 md:h-16 md:w-16" />

      <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-white shadow-lg hover:scale-105 active:scale-95 transition">
        <img
          src={iconUrl}
          alt=""
          className="h-8 w-8 md:h-9 md:w-9"
          referrerPolicy="no-referrer"
          draggable={false}
        />
      </div>
    </a>
  );
}
