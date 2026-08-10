import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';
import { validateRegistration, validateLogin, handleValidationErrors } from '../validators/userValidator.js';
import { protect } from "../middlewares/auth.js"

const router = express.Router();

router.post('/register', validateRegistration, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.post('/logout', protect, logoutUser);

export default router;