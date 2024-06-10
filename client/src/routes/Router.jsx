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
import Layout from "components/Layout";
import OrderListPage from "pages/AdminPages/OrderListPage";
import OrderDetailsPage from "pages/AdminPages/OrderDetailsPage";

const Routes = [
  { path: ROUTES.CATEGORIES, element: <CategoriesPage /> },
  { path: ROUTES.ORDER_LIST, element: <OrderListPage /> },
  { path: ROUTES.ORDER_DETAILS, element: <OrderDetailsPage /> },
  { path: `${ROUTES.MENU}/:category`, element: <MenuPage /> },
];

const MyRoutes = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="*" element={<Navigate to={ROUTES.CATEGORIES} />} />
        <Route element={<Layout />}>
          {Routes.map((route, index) => (
            <Route key={index} {...route} />
          ))}
        </Route>
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default MyRoutes;
