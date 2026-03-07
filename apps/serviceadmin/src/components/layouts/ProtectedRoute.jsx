import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken, getLoginAt, clearToken } from "../../lib/auth.js";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getToken();
  const loginAt = getLoginAt();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!loginAt) {
    clearToken();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}