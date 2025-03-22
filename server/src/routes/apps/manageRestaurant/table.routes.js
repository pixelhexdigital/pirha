import { Router } from "express";
import {
  deleteTableById,
  deleteTablesByIds,
  registerTables,
  updateTableById,
  updateTables,
  fetchTables,
  downloadTableQr,
  getTableOrders,
} from "../../../controllers/apps/manageRestaurant/table.controllers.js";
import { verifyJWT } from "../../../middlewares/auth.middlewares.js";

const router = Router();

// Get list of tables for a restaurant
router.route("/").get(verifyJWT, fetchTables);

router.route("/detail").get(verifyJWT, getTableOrders);

router.route("/qr-download").post(verifyJWT, downloadTableQr);

// Register tables for a restaurant
router.route("/register").post(verifyJWT, registerTables);

// Delete a specific table by ID
router.route("/:id").delete(verifyJWT, deleteTableById);

// Batch delete tables by array of IDs
router.route("/delete-batch").post(verifyJWT, deleteTablesByIds);

// Edit a specific table by ID
router.route("/:id").patch(verifyJWT, updateTableById);

// Batch edit tables by array of objects containing ID and updates
router.route("/edit-batch").post(verifyJWT, updateTables);

export default router;
