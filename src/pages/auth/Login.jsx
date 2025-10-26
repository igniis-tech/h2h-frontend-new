// // src/pages/auth/Login.jsx (or wherever your login component lives)
// import { useEffect, useState } from "react";
// import { startSSO } from "../../api/client";

// export default function Login() {
//   const [loggingIn, setLoggingIn] = useState(false);

//   useEffect(() => {
//     const forced = sessionStorage.getItem("forceLoggedOut") === "1";
//     if (!forced) {
//       // normal behaviour: auto-start SSO
//       startSSO();
//     }
//     // If forced, render a button so user explicitly starts SSO again.
//   }, []);

//   const begin = async () => {
//     // explicit user action → allow SSO again
//     try { sessionStorage.removeItem("forceLoggedOut"); } catch {}
//     setLoggingIn(true);
//     await startSSO();
//     setLoggingIn(false);
//   };

//   return (
//     <div className="min-h-[60vh] grid place-items-center">
//       <button
//         type="button"
//         className="rounded-full px-5 py-2 font-semibold border-2 border-black text-black bg-transparent hover:bg-black/5 transition disabled:opacity-70"
//         onClick={begin}
//         disabled={loggingIn}
//       >
//         {loggingIn ? "Redirecting…" : "Sign in"}
//       </button>
//     </div>
//   );
// }



// src/pages/auth/Login.jsx
import { useEffect } from "react";
import { startSSO } from "../../api/client";

export default function Login() {
  useEffect(() => {
    // If user just logged out, do NOT auto-redirect.
    if (sessionStorage.getItem("forceLoggedOut") === "1") return;
    startSSO();
  }, []);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <p className="opacity-80">Redirecting to secure login…</p>
    </div>
  );
}
