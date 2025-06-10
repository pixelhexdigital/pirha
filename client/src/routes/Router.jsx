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
import AuthPage from "pages/AuthPage";
import CategoriesPage from "pages/MenuPages/CategoriesPage";
import MenuPage from "pages/MenuPages/MenuPage";
import OrderDetailsPage from "pages/AdminPages/OrderDetailsPage";
import OnboardingPage from "pages/OnboardingPage";
import DashboardPage from "pages/AdminPages/DashboardPage";
import CategoriesManagementPage from "pages/AdminPages/MenuManagementPage/CategoriesManagement";
import ItemManagementPage from "pages/AdminPages/MenuManagementPage/ItemManagementPage";
import KitchenPage from "pages/KitchenPages";
import OrdersPage from "pages/OrdersPage";
import Table from "pages/TablesPage";
import UserBillPage from "pages/UserBillPage";
import UserOrderHistoryPage from "pages/UserOrderHistoryPage";
import SettingPage from "pages/SettingsPage";

const AuthenticatedRoutes = [
  { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
  { path: ROUTES.ORDER, element: <OrdersPage /> },
  // { path: ROUTES.ORDER_LIST, element: <OrderListPage /> },
  { path: ROUTES.ORDER_DETAILS, element: <OrderDetailsPage /> },
  { path: ROUTES.ONBOARDING, element: <OnboardingPage /> },
  { path: ROUTES.MENU_MANAGEMENT, element: <ItemManagementPage /> },
  { path: ROUTES.CATEGORIES_MANAGEMENT, element: <CategoriesManagementPage /> },
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
    : ROUTES.AUTH;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="*" element={<Navigate to={redirectRoute} />} />
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
  return <RouterProvider router={router} />;
};

export default MyRoutes;
