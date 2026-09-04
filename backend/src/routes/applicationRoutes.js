import express from 'express';
import {
  applyToProject,
  getMyApplications,
  withdrawApplication,
  getProjectApplications,
  acceptApplication,
  rejectApplication
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply auth protection to all application routes
router.use(protect);

// Worker Applications
router.get('/my', requireRole('WORKER'), getMyApplications);
router.put('/:id/withdraw', requireRole('WORKER'), withdrawApplication);

// Owner Application Management
router.put('/:id/accept', requireRole('OWNER'), acceptApplication);
router.put('/:id/reject', requireRole('OWNER'), rejectApplication);

// Nested routes will also be mounted on /api/projects/:projectId/apply and /api/projects/:projectId/applications

export default router;
