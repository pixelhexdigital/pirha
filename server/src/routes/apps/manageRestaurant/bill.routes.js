import { Router } from "express";
import { verifyCustomer } from "../../../middlewares/auth.middlewares.js";
import { generateCustomerBill } from "../../../controllers/apps/manageRestaurant/bill.controllers.js";

const router = Router();

router
  .route("/:restaurantId/generateBill")
  .post(verifyCustomer, generateCustomerBill);

export default router;
