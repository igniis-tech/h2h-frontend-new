// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null;
  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }
  return children;
}
