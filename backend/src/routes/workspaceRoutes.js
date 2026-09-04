import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getMessages,
  sendMessage,
  getFiles,
  uploadFile
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadWorkspaceFile } from '../middleware/uploadMiddleware.js';

const router = express.Router({ mergeParams: true });

// Apply JWT authentication
router.use(protect);

// Tasks
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);

// Messages
router.get('/messages', getMessages);
router.post('/messages', sendMessage);

// Files
router.get('/files', getFiles);
router.post('/files', uploadWorkspaceFile.single('file'), uploadFile);

export default router;
