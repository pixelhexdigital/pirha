import {
  Route,
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { ROUTES } from "routes/RouterConfig";
import { useSelector } from "react-redux";

import AuthPage from "pages/AuthPage";
import MenuPage from "pages/MenuPages/MenuPage";
import CategoriesPage from "pages/MenuPages/CategoriesPage";
import OrderListPage from "pages/AdminPages/OrderListPage";
import OrderDetailsPage from "pages/AdminPages/OrderDetailsPage";
import OnboardingPage from "pages/OnboardingPage/index.jsx";
import ProtectedRoute from "components/ProtectedRoute";
import { selectIsAuthenticated } from "store/AuthSlice";
import DashboardPage from "pages/AdminPages/DashboardPage";

import CategoriesManagementPage from "pages/AdminPages/MenuManagementPage/CategoriesManagement";
import ItemManagementPage from "pages/AdminPages/MenuManagementPage/ItemManagementPage";

const Routes = [
  { path: ROUTES.CATEGORIES, element: <CategoriesPage /> },
  { path: ROUTES.ORDER_LIST, element: <OrderListPage /> },
  { path: ROUTES.ORDER_DETAILS, element: <OrderDetailsPage /> },
  { path: ROUTES.ONBOARDING, element: <OnboardingPage /> },
  { path: `${ROUTES.MENU}/:category`, element: <MenuPage /> },
];

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

  return <RouterProvider router={router} />;
};

export default MyRoutes;
