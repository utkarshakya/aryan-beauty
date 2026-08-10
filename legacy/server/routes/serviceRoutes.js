import express from "express";
import {
  createService,
  getServices,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { protect, admin } from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  .get(getServices) // Public access
  .post(protect, admin, createService); // Only admins can create

router
  .route("/:id")
  .put(protect, admin, updateService) // Only admins can update
  .delete(protect, admin, deleteService); // Only admins can delete

export default router;
