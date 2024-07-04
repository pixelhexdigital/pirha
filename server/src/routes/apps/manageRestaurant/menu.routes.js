import { Router } from "express";
import {
  verifyJWT,
  verifySubscription,
} from "../../../middlewares/auth.middlewares.js";
import {
  fetchMenus,
  fetchMenuByRestraurnt,
  deleteMenuById,
  addCategory,
  updateCategory,
  deleteCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateItemImage,
  updateCategoryImage,
  activateMenuItem,
  deactivateMenuItem,
  activateMenuCategory,
  deactivateMenuCategory,
  fetchMyMenu,
} from "../../../controllers/apps/manageRestaurant/menu.controllers.js";
import { upload } from "../../../middlewares/multer.middlewares.js";

const router = Router();

// Get list of menus for a restaurant
// router.route("/").get(verifyJWT, fetchMenus);

//Get menu by the restaurant
router.route("/").get(verifyJWT, fetchMyMenu);
//Get menu by the restaurant
router.route("/:restaurantId").get(verifySubscription, fetchMenuByRestraurnt);

// Delete all menu of restaurant
router.route("/:id").delete(verifyJWT, deleteMenuById);

// category routes
router.route("/categories").post(verifyJWT, addCategory); // add category for menu

router
  .route("/categories/:categoryId")
  .patch(verifyJWT, updateCategory) // update category for menu
  .delete(verifyJWT, deleteCategory); // delete category for menu

router
  .route("/categories/:categoryId/activate")
  .patch(verifyJWT, activateMenuCategory);

router
  .route("/categories/:categoryId/deactivate")
  .patch(verifyJWT, deactivateMenuCategory);

router
  .route("/categories/:categoryId/image")
  .patch(verifyJWT, upload.single("categoryImage"), updateCategoryImage);
// menu item routes
router.route("/categories/:categoryId/items").post(verifyJWT, addMenuItem); //add menu item for a category in menu

router
  .route("/categories/:categoryId/items/:itemId")
  .patch(verifyJWT, updateMenuItem) // update menu item for a category in menu
  .delete(verifyJWT, deleteMenuItem); // delete menu item for a category in menu

router
  .route("/categories/:categoryId/items/:itemId/activate")
  .patch(verifyJWT, activateMenuItem);

router
  .route("/categories/:categoryId/items/:itemId/deactivate")
  .patch(verifyJWT, deactivateMenuItem);

router
  .route("/categories/:categoryId/items/:itemId/image")
  .patch(verifyJWT, upload.single("itemImage"), updateItemImage);

export default router;
