import { Suspense } from "react";
import {
  Route,
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { ROUTES } from "routes/RouterConfig";
import { useSelector } from "react-redux";
import lazyLoad from "lazyLoad";

import { selectIsAuthenticated } from "store/AuthSlice";
const AuthPage = lazyLoad(() => import("pages/AuthPage"));
const CategoriesPage = lazyLoad(() => import("pages/MenuPages/CategoriesPage"));
const MenuPage = lazyLoad(() => import("pages/MenuPages/MenuPage"));
const OrderListPage = lazyLoad(() => import("pages/AdminPages/OrderListPage"));
const OrderDetailsPage = lazyLoad(
  () => import("pages/AdminPages/OrderDetailsPage")
);
const OnboardingPage = lazyLoad(() => import("pages/OnboardingPage/index.jsx"));
const ProtectedRoute = lazyLoad(() => import("components/ProtectedRoute"));
const DashboardPage = lazyLoad(() => import("pages/AdminPages/DashboardPage"));
const CategoriesManagementPage = lazyLoad(
  () => import("pages/AdminPages/MenuManagementPage/CategoriesManagement")
);
const ItemManagementPage = lazyLoad(
  () => import("pages/AdminPages/MenuManagementPage/ItemManagementPage")
);

const AuthenticatedRoutes = [
  { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
  { path: ROUTES.ORDER_LIST, element: <OrderListPage /> },
  { path: ROUTES.ORDER_DETAILS, element: <OrderDetailsPage /> },
  { path: ROUTES.ONBOARDING, element: <OnboardingPage /> },
  { path: ROUTES.MENU_MANAGEMENT, element: <ItemManagementPage /> },
  { path: ROUTES.CATEGORIES_MANAGEMENT, element: <CategoriesManagementPage /> },
];

const UnauthenticatedRoutes = [
  { path: ROUTES.AUTH, element: <AuthPage /> },
  { path: ROUTES.HOME, element: <CategoriesPage /> },
  {
    path: `${ROUTES.MENU}/:tableId/:restaurantId/:categoryName`,
    element: <MenuPage />,
  },
];

const MyRoutes = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME} />
          }
        />
        {AuthenticatedRoutes.map((route, index) => (
          <Route
            key={index}
            element={<ProtectedRoute isAuthenticated={isAuthenticated} />}
          >
            <Route {...route} />
          </Route>
        ))}
        {UnauthenticatedRoutes.map((route, index) => (
          <Route key={index} {...route} />
        ))}
      </Route>
    )
  );

  // return <RouterProvider router={router} />;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default MyRoutes;
