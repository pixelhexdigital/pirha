import { Router } from "express";
import {
  verifyCustomer,
  verifyJWT,
} from "../../../middlewares/auth.middlewares.js";
import {
  logoutCustomer,
  handleCustomer,
  updateCustomer,
} from "../../../controllers/apps/manageRestaurant/customer.controllers.js";

const router = Router();

router
  .route("/")
  .get(verifyJWT) // Get customer by restaurant
  .patch(verifyCustomer, updateCustomer); // Update customer details

router.route("/login").post(handleCustomer); // Login customer by mobile number

router.route("/logout").get(verifyCustomer, logoutCustomer); // Logout customer

export default router;
