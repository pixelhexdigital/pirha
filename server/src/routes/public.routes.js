import { Router } from "express";
import {
  fetchEnum,
  getRestaurantById,
  getTableById,
} from "../controllers/public.controllers.js";

const router = Router();

router.route("/enums").get(fetchEnum);
router.route("/restaurants/:restaurantId").get(getRestaurantById);
router.route("/tables/:tableId").get(getTableById);

export default router;
