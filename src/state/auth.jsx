// Re-export the context implementation from `src/context/AuthContext.jsx`.
// This file previously duplicated the implementation and caused duplicate-named
// exports (AuthProvider, useAuth). Keep a single source of truth in
// `src/context/AuthContext.jsx` and re-export its named exports here.
export { AuthProvider, useAuth } from "../context/AuthContext.jsx";
