import express from 'express';
import { body } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
  updateUserSkills,
  changePassword,
  getWorkers
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/me', getUserProfile);

router.put(
  '/me',
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty'),
    body('experienceLevel')
      .optional()
      .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
      .withMessage('Experience level must be Beginner, Intermediate, Advanced, or Expert')
  ],
  updateUserProfile
);

router.put(
  '/me/skills',
  [
    body('skills')
      .isArray()
      .withMessage('Skills must be an array')
  ],
  updateUserSkills
);

router.put(
  '/me/password',
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],
  changePassword
);

router.get('/workers', getWorkers);

export default router;
