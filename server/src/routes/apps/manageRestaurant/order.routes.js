import { Router } from "express";
import { verifyCustomer } from "../../../middlewares/auth.middlewares.js";
import {
  addOrder,
  createOrder,
  generateBill,
  getOrderByCustomer,
} from "../../../controllers/apps/manageRestaurant/order.controllers.js";

const router = Router();

router
  .route("/")
  .get(verifyCustomer, getOrderByCustomer) // get list of orders of a customer
  .post(verifyCustomer, createOrder); // create new order for a customer

router.route("/addOrder").post(verifyCustomer, addOrder); // add more items in existing order
router.route("/generateBill").get(verifyCustomer, generateBill); // generate bill for the order

export default router;
