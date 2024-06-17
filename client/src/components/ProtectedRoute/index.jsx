import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { ROUTES } from "routes/RouterConfig";

const ProtectedRoute = ({ isAuthenticated }) => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
