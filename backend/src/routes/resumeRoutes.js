import express from 'express';
import { uploadResumeFile, getResumeDetails } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply auth protection and WORKER role requirement
router.use(protect);
router.use(requireRole('WORKER'));

router.get('/me', getResumeDetails);
router.post('/upload', uploadResume.single('resume'), uploadResumeFile);

export default router;
