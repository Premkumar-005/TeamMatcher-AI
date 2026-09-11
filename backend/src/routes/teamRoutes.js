import express from 'express';
import { body } from 'express-validator';
import {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  updateMemberRole,
  removeTeamMember,
  leaveTeam,
  acceptTeamInvite
} from '../controllers/teamController.js';
import workspaceRoutes from './workspaceRoutes.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply auth protection to all team routes
router.use(protect);

// Get User's Teams
router.get('/my', getMyTeams);

// Explicit Team Creation (OWNER ONLY)
router.post(
  '/',
  requireRole('OWNER'),
  [
    body('projectId')
      .notEmpty()
      .withMessage('Project ID is required')
  ],
  createTeam
);

// Team Details (Owner or confirmed Member)
router.get('/:id', getTeamById);

// Team Management (OWNER ONLY)
router.put('/:id', requireRole('OWNER'), updateTeam);
router.delete('/:id', requireRole('OWNER'), deleteTeam);
router.put('/:id/members/:userId/role', requireRole('OWNER'), updateMemberRole);
router.delete('/:id/members/:userId', requireRole('OWNER'), removeTeamMember);

// Leave Team (WORKER ONLY)
router.put('/:id/leave', requireRole('WORKER'), leaveTeam);

// Accept Team Invitation (WORKER ONLY)
router.put('/:id/accept-invite', requireRole('WORKER'), acceptTeamInvite);

// Mount Team Workspace Sub-routes (Tasks, Messages, Files)
router.use('/:teamId', workspaceRoutes);

export default router;
