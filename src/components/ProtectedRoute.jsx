import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function Protected({ children }) {
  const { token, profile, isAuthed } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
