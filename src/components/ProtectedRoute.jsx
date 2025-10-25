import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function Protected({ children }) {
  // support both `booting` (older API) and `loading` (current AuthContext)
  const { user, booting, loading } = useAuth();
  const location = useLocation();

  const isBooting = typeof booting !== "undefined" ? booting : loading;

  if (isBooting) {
    return <div className="min-h-[50vh] grid place-items-center">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
