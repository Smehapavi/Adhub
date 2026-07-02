import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerValidation, loginValidation, profileValidation } from '../utils/validators.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, profileValidation, validate, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

export default router;
