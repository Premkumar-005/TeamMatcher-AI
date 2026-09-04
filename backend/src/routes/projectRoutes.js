import express from 'express';
import { body } from 'express-validator';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getMyProjects,
  getProjectMatch,
  getRecommendedProjects
} from '../controllers/projectController.js';
import {
  applyToProject,
  getProjectApplications
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply JWT authentication to all project routes
router.use(protect);

// Projects Discovery & Filtering (All authenticated users)
router.get('/', getProjects);

// Worker-specific recommendation endpoint
router.get('/recommended', requireRole('WORKER'), getRecommendedProjects);

// User's own projects (Owner: created; Worker: applied/joined)
router.get('/my', getMyProjects);

// Project Details
router.get('/:id', getProjectById);

// Worker Compatibility Match for Project
router.get('/:projectId/match', requireRole('WORKER'), getProjectMatch);

// Project Creation (OWNER ONLY)
router.post(
  '/',
  requireRole('OWNER'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Project title is required'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Project description is required'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Project category is required'),
    body('teamSize')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Team size must be a positive integer')
  ],
  createProject
);

// Project Management (OWNER ONLY)
router.put('/:id', requireRole('OWNER'), updateProject);
router.delete('/:id', requireRole('OWNER'), deleteProject);
router.put('/:id/status', requireRole('OWNER'), updateProjectStatus);

// Nested Application Routes on Project
router.post('/:projectId/apply', requireRole('WORKER'), applyToProject);
router.get('/:projectId/applications', requireRole('OWNER'), getProjectApplications);

export default router;
