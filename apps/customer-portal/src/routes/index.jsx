import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// pages
import Login from "../pages/Login";
import CustomerLayout from "../layouts/CustomerLayout";
import Home from "../pages/Home";
import Ledger from "../pages/Ledger";
import Transactions from "../pages/Transactions";

import { isAuthed } from "../lib/auth";

export default function AppRoutes() {
  return (
    <Routes>
      {/* portal.stareng.co.in hit -> login OR app */}
      <Route
        path="/"
        element={isAuthed() ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />}
      />

      <Route path="/login" element={<Login />} />

      {/* Protected area */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="ledger" element={<Ledger />} />
        <Route path="transactions" element={<Transactions />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}