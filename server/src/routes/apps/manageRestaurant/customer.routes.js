import { Router } from "express";
import {
  verifyCustomer,
  verifyJWT,
} from "../../../middlewares/auth.middlewares.js";
import {
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  updateCustomer,
} from "../../../controllers/apps/manageRestaurant/customer.controllers.js";

const router = Router();

router
  .route("/")
  .get(verifyJWT) // Get customer by restaurant
  .post(registerCustomer) // Register customer if mobile number not existed else login
  .patch(verifyCustomer, updateCustomer); // Update customer details

router.route("/login").post(loginCustomer); // Login customer by mobile number

router.route("/logout").get(verifyCustomer, logoutCustomer); // Logout customer

export default router;
