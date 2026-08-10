import express from 'express';

import { createAppointment, getAppointments, updateAppointment, deleteAppointment } from '../controllers/appointmentController.js';
import { validateCreateAppointment, validateUpdateAppointment } from '../validators/appointmentValidator.js';
import { handleValidationErrors } from '../validators/userValidator.js'
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAppointments) // Get appointment
  .post(validateCreateAppointment, handleValidationErrors, createAppointment); // Create appointment

router
  .route("/:id")
  .put(validateUpdateAppointment, handleValidationErrors, updateAppointment) // Update appointment
  .delete(deleteAppointment); // Delete appointment

export default router;