import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { decodeToken, getToken, isTokenExpired, logoutAndRedirect } from "../lib/auth";

function AuthGuard() {
  const token = getToken();

  useEffect(() => {
    if (!token) return undefined;
    const payload = decodeToken(token);
    if (!payload?.exp) return undefined;
    const remaining = payload.exp * 1000 - Date.now();
    const timer = window.setTimeout(logoutAndRedirect, Math.max(remaining, 0));
    return () => window.clearTimeout(timer);
  }, [token]);

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default AuthGuard;