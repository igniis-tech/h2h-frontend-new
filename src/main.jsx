// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./app.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Callback from "./pages/auth/Callback";
import Policy from "./pages/Policy";
import Refund from "./pages/Refund";
import { AuthProvider } from "./context/AuthContext";

function Layout({ children }) {
  return (
    <div className="min-h-screen font-body bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />

          {/* Legal */}
          <Route path="/policy" element={<Layout><Policy /></Layout>} />
          <Route path="/refund" element={<Layout><Refund /></Layout>} />

          {/* ⬇️ MUST exist publicly and match your redirect_uri */}
          <Route path="/auth/callback" element={<Layout><Callback /></Layout>} />

          {/* Authed */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <Layout>
                <div className="py-20 text-center">
                  <h1 className="text-3xl font-extrabold">404</h1>
                  <p className="text-white/70 mt-2">This page does not exist.</p>
                </div>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
