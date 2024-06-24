import { Router } from "express";
import {
  fetchEnum,
  getRestaurantById,
  getTableById,
  getMenuByRestaurantId,
} from "../controllers/public.controllers.js";
import { verifySubscription } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/enums").get(fetchEnum);
router
  .route("/restaurants/:restaurantId")
  .get(verifySubscription, getRestaurantById);
router.route("/tables/:tableId").get(getTableById);
router
  .route("/menus/:restaurantId")
  .get(verifySubscription, getMenuByRestaurantId);

export default router;
