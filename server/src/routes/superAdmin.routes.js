import { Router } from "express";
import { verifyAdmin } from "../middlewares/auth.middlewares.js";
import { changePlan } from "../controllers/superAdmin/subscription.controllers.js";

const router = Router();
router.use(verifyAdmin);

router.route("/subscriptions/changePlan").post(changePlan);

export default router;
