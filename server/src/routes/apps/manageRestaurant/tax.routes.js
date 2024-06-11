import { Router } from "express";
import { verifyJWT } from "../../../middlewares/auth.middlewares.js";
import {
  fetchTaxes,
  registerTax,
  updateTaxById,
} from "../../../controllers/apps/manageRestaurant/tax.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("").get(fetchTaxes).post(registerTax).patch(updateTaxById);

export default router;
