import { useEffect } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import { ROUTES } from "routes/RouterConfig";

const ProtectedRoute = ({ isAuthenticated }) => {
  const location = useLocation();

  const [searchParams] = useSearchParams();

  const restaurantId = searchParams.get("restaurantId");
  const tableId = searchParams.get("tableId");

  //  Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  if (!isAuthenticated && !restaurantId && !tableId) {
    return (
      <Navigate
        to={`${ROUTES.ROOT}?restaurantId=${restaurantId}&tableId=${tableId}`}
        replace
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
