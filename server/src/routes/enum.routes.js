import { Router } from "express";
import { fetchEnum } from "../controllers/enum.controllers.js";

const router = Router();

router.route("/").get(fetchEnum);

export default router;
