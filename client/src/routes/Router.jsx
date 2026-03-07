import { lazy, Suspense } from "react";
import {
  Route,
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { ROUTES } from "routes/RouterConfig";
import { useSelector } from "react-redux";

import {
  selectIsAuthenticated,
  selectIsOnboardingComplete,
} from "store/AuthSlice";

import ProtectedRoute from "components/ProtectedRoute";
import Spinner from "components/Spinner";

const AuthPage = lazy(() => import("pages/AuthPage"));
const CategoriesPage = lazy(() => import("pages/MenuPages/CategoriesPage"));
const MenuPage = lazy(() => import("pages/MenuPages/MenuPage"));
const OrderDetailsPage = lazy(() => import("pages/AdminPages/OrderDetailsPage"));
const OnboardingPage = lazy(() => import("pages/OnboardingPage"));
const DashboardPage = lazy(() => import("pages/AdminPages/DashboardPage"));
const CategoriesManagementPage = lazy(() =>
  import("pages/AdminPages/MenuManagementPage/CategoriesManagement")
);
const ItemManagementPage = lazy(() =>
  import("pages/AdminPages/MenuManagementPage/ItemManagementPage")
);
const KitchenPage = lazy(() => import("pages/KitchenPages"));
const OrdersPage = lazy(() => import("pages/OrdersPage"));
const Table = lazy(() => import("pages/TablesPage"));
const UserBillPage = lazy(() => import("pages/UserBillPage"));
const UserOrderHistoryPage = lazy(() => import("pages/UserOrderHistoryPage"));
const SettingPage = lazy(() => import("pages/SettingsPage"));

const SuspenseWrapper = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const AuthenticatedRoutes = [
  { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
  { path: ROUTES.ORDER, element: <OrdersPage /> },
  { path: ROUTES.ORDER_DETAILS, element: <OrderDetailsPage /> },
  { path: ROUTES.ONBOARDING, element: <OnboardingPage /> },
  { path: ROUTES.MENU_MANAGEMENT, element: <ItemManagementPage /> },
  {
    path: ROUTES.CATEGORIES_MANAGEMENT,
    element: <CategoriesManagementPage />,
  },
  { path: ROUTES.TABLES, element: <Table /> },
  { path: ROUTES.KITCHEN, element: <KitchenPage /> },
  { path: ROUTES.SETTINGS, element: <SettingPage /> },
];

const UnauthenticatedRoutes = [
  { path: ROUTES.AUTH, element: <AuthPage /> },
  { path: ROUTES.ROOT, element: <CategoriesPage /> },
  {
    path: `${ROUTES.MENU}/:tableId/:restaurantId/:categoryName`,
    element: <MenuPage />,
  },
  { path: `/bill/:tableId/:restaurantId`, element: <UserBillPage /> },
  {
    path: `/history/:tableId/:restaurantId`,
    element: <UserOrderHistoryPage />,
  },
];

const MyRoutes = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOnboardingComplete = useSelector(selectIsOnboardingComplete);

  const redirectRoute = isAuthenticated
    ? isOnboardingComplete
      ? ROUTES.DASHBOARD
      : ROUTES.ONBOARDING
    : ROUTES.ROOT;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="*" element={<Navigate to={redirectRoute} />} />
        {AuthenticatedRoutes.map((route, index) => (
          <Route
            key={index}
            element={<ProtectedRoute isAuthenticated={isAuthenticated} />}
          >
            <Route
              path={route.path}
              element={<SuspenseWrapper>{route.element}</SuspenseWrapper>}
            />
          </Route>
        ))}
        {UnauthenticatedRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={<SuspenseWrapper>{route.element}</SuspenseWrapper>}
          />
        ))}
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default MyRoutes;
