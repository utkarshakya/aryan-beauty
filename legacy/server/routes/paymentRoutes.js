import express from "express";
import {protect} from "../middlewares/auth.js"
import { createPaymentOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.use(protect);

router
    .route('/order')
    .post(createPaymentOrder);

router
    .route('/verify')
    .post(verifyPayment);

export default router;