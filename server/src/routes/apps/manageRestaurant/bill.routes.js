import { Router } from "express";
import { verifyCustomer } from "../../../middlewares/auth.middlewares.js";
import {
  generateBillForTable,
  generateCustomerBill,
} from "../../../controllers/apps/manageRestaurant/bill.controllers.js";

const router = Router();

router
  .route("/:restaurantId/generateBill")
  .post(verifyCustomer, generateCustomerBill);

router
  .route("/:tableId/generateTableBill")
  .post(verifyCustomer, generateBillForTable);

export default router;
