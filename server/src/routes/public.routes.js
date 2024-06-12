import { Router } from "express";
import {
  fetchEnum,
  getRestaurantById,
  getTableById,
  getMenuByRestaurantId,
} from "../controllers/public.controllers.js";

const router = Router();

router.route("/enums").get(fetchEnum);
router.route("/restaurants/:restaurantId").get(getRestaurantById);
router.route("/tables/:tableId").get(getTableById);
router.route("/menus/:restaurantId").get(getMenuByRestaurantId);

export default router;
