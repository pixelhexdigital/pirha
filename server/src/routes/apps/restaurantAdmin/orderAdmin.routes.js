import { Router } from "express";
import { verifyJWT } from "../../../middlewares/auth.middlewares.js";
import { updateOrder } from "../../../controllers/apps/restaurantAdmin/orderAdmin.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/:orderId").patch(updateOrder);

export default router;
