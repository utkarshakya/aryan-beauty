import express from "express";
import { notificationSender } from "../controllers/notificationController.js";

const router = express.Router();

router.route("/send").post(notificationSender);

export default router;
