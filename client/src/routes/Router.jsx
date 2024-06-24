import {
  Route,
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { ROUTES } from "routes/RouterConfig";
// import { useSelector } from "react-redux";

import CategoriesPage from "pages/MenuPages/CategoriesPage";
import MenuPage from "pages/MenuPages/MenuPage";

import OrderListPage from "pages/AdminPages/OrderListPage";
import OrderDetailsPage from "pages/AdminPages/OrderDetailsPage";
import ProtectedRoute from "components/ProtectedRoute";
import AuthPage from "pages/AuthPage";

const Routes = [
  { path: ROUTES.CATEGORIES, element: <CategoriesPage /> },
  { path: ROUTES.ORDER_LIST, element: <OrderListPage /> },
  { path: ROUTES.ORDER_DETAILS, element: <OrderDetailsPage /> },
  { path: `${ROUTES.MENU}/:category`, element: <MenuPage /> },
];

const AuthenticatedRoutes = [
  { path: ROUTES.ORDER_LIST, element: <OrderListPage /> },
  { path: ROUTES.ORDER_DETAILS, element: <OrderDetailsPage /> },
];

const UnauthenticatedRoutes = [
  { path: ROUTES.AUTH, element: <AuthPage /> },
  { path: ROUTES.HOME, element: <CategoriesPage /> },
  // { path: `${ROUTES.MENU}/:category`, element: <MenuPage /> },
  // pathname: `${ROUTES.MENU}/${tableId}/${restaurantId}/${name}`,
  {
    path: `${ROUTES.MENU}/:tableId/:restaurantId/:categoryName`,
    element: <MenuPage />,
  },
];

const MyRoutes = () => {
  // const isAuthenticated = useSelector(selectIsLoggedIn);
  const isAuthenticated = false;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? ROUTES.HOME : ROUTES.AUTH} />
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
