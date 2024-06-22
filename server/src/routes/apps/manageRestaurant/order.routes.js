import { Router } from "express";
import {
  verifyCustomer,
  verifySubscription,
} from "../../../middlewares/auth.middlewares.js";
import {
  createOrder,
  getOrderByCustomer,
} from "../../../controllers/apps/manageRestaurant/order.controllers.js";

const router = Router();

router
  .route("/")
  .get(verifyCustomer, getOrderByCustomer) // get list of orders of a customer
  .post(verifyCustomer, createOrder); // create new order for a customer

router
  .route("/:restaurantId")
  .post(verifySubscription, verifyCustomer, createOrder); // create new order for a customer

export default router;
