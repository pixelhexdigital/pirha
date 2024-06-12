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

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .patch(updateSocialProfileValidator(), validate, updateSocialProfile);

router.route("/dashboard").get(getDashboard);

router
  .route("/cover-image")
  .patch(upload.single("coverImage"), updateCoverImage);

router.route("/avatar").patch(upload.single("avatar"), updateAvatar);

export default router;
