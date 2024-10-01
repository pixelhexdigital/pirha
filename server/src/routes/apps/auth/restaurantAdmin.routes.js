import { Router } from "express";
import {
  updateAvatar,
  updateCoverImage,
  updateSocialProfile,
} from "../../../controllers/apps/auth/restaurantAdmin.controllers.js";
import {
  getLoggedInUserOrIgnore,
  verifyJWT,
} from "../../../middlewares/auth.middlewares.js";
import { upload } from "../../../middlewares/multer.middlewares.js";
import {
  getProfileByUserNameValidator,
  updateSocialProfileValidator,
} from "../../../validators/apps/social-media/profile.validators.js";
import { validate } from "../../../validators/validate.js";
import { getDashboard } from "../../../controllers/apps/restaurantAdmin/adminDashboard.controllers.js";
import {
  getOrders,
  updateOrder,
} from "../../../controllers/apps/restaurantAdmin/orderAdmin.controllers.js";
import {
  fetchTaxes,
  registerTax,
  updateTaxById,
} from "../../../controllers/apps/manageRestaurant/tax.controllers.js";
import { generateCustomerBill } from "../../../controllers/apps/manageRestaurant/bill.controllers.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .patch(updateSocialProfileValidator(), validate, updateSocialProfile);

router.route("/dashboard").get(getDashboard);

router.route("/taxes").get(fetchTaxes).post(registerTax).patch(updateTaxById);

router.route("/orders").get(getOrders);
router.route("/orders/:orderId").patch(updateOrder);

router.route("/bills/:customerId").patch(generateCustomerBill);

router
  .route("/cover-image")
  .patch(upload.single("coverImage"), updateCoverImage);

router.route("/avatar").patch(upload.single("avatar"), updateAvatar);

export default router;
