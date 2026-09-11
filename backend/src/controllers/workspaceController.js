import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import path from 'path';
import fs from 'fs';

/**
 * Helper to verify user is owner or member of team
 */
const verifyTeamAccess = (team, userId) => {
  const isOwner = team.owner.toString() === userId.toString();
  const isMember = team.members.some(
    (m) => m.user && m.user.toString() === userId.toString()
  );
  return isOwner || isMember;
};

// =================== TASKS ===================

/**
 * @desc    Get team tasks
 * @route   GET /api/teams/:teamId/tasks
 * @access  Private (Owner/Member)
 */
export const getTasks = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId).populate('tasks.assignee', 'name email avatar role title');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    return res.status(200).json({
      success: true,
      count: team.tasks.length,
      data: team.tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create team task
 * @route   POST /api/teams/:teamId/tasks
 * @access  Private (Owner/Member)
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, assignee, dueDate, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    // Validate assignee if provided (must be owner or accepted team member)
    if (assignee) {
      const isOwner = team.owner.toString() === assignee.toString();
      const isMember = team.members.some(
        (m) => m.user && m.user.toString() === assignee.toString()
      );
      if (!isOwner && !isMember) {
        return res.status(400).json({
          success: false,
          message: 'Only accepted team members can be assigned to tasks'
        });
      }
    }

    const newTask = {
      project: team.project,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      assignee: assignee || null,
      dueDate: dueDate || null,
      status: status || 'To Do'
    };

    team.tasks.push(newTask);
    await team.save();

    await team.populate('tasks.assignee', 'name email avatar role title');
    const createdTask = team.tasks[team.tasks.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: createdTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update team task
 * @route   PUT /api/teams/:teamId/tasks/:taskId
 * @access  Private (Owner/Member)
 */
export const updateTask = async (req, res, next) => {
  try {
    const { teamId, taskId } = req.params;
    const { title, description, status, priority, assignee, dueDate } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    const task = team.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (assignee !== undefined && assignee !== null && assignee !== '') {
      const isOwner = team.owner.toString() === assignee.toString();
      const isMember = team.members.some(
        (m) => m.user && m.user.toString() === assignee.toString()
      );
      if (!isOwner && !isMember) {
        return res.status(400).json({
          success: false,
          message: 'Only accepted team members can be assigned to tasks'
        });
      }
      task.assignee = assignee;
    } else if (assignee === null || assignee === '') {
      task.assignee = null;
    }

    const prevStatus = task.status;
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await team.save();

    await team.populate('tasks.assignee', 'name email avatar role title');
    const updatedTask = team.tasks.id(taskId);

    // Notify project/team owner when an assigned worker starts or completes a task
    if (status && status !== prevStatus) {
      try {
        const isOwner = team.owner.toString() === req.user._id.toString();
        // Only notify owner if the updater is not the owner themselves
        if (!isOwner) {
          // Resolve project title
          let projectTitle = team.name;
          if (team.project) {
            const projectDoc = await Project.findById(team.project).select('title');
            if (projectDoc && projectDoc.title) {
              projectTitle = projectDoc.title;
            }
          }

          if (status === 'In Progress') {
            await Notification.create({
              recipient: team.owner,
              sender: req.user._id,
              type: 'TASK_STARTED',
              title: 'Task Started',
              message: `${req.user.name} started "${task.title}" in "${projectTitle}".`,
              relatedProject: team.project,
              relatedEntity: task._id,
              link: `/team-workspace?tab=tasks`
            });
          } else if (status === 'Done') {
            await Notification.create({
              recipient: team.owner,
              sender: req.user._id,
              type: 'TASK_COMPLETED',
              title: 'Task Completed',
              message: `${req.user.name} completed "${task.title}" in "${projectTitle}".`,
              relatedProject: team.project,
              relatedEntity: task._id,
              link: `/team-workspace?tab=tasks`
            });
          }
        }
      } catch (notifErr) {
        console.error('Error creating task status notification:', notifErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete team task
 * @route   DELETE /api/teams/:teamId/tasks/:taskId
 * @access  Private (Owner/Member)
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { teamId, taskId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    team.tasks.pull({ _id: taskId });
    await team.save();

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// =================== MESSAGES ===================

/**
 * @desc    Get team chat messages
 * @route   GET /api/teams/:teamId/messages
 * @access  Private (Owner/Member)
 */
export const getMessages = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('messages.sender', 'name email avatar role title')
      .populate('messages.senderId', 'name email avatar role title');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    return res.status(200).json({
      success: true,
      count: team.messages.length,
      data: team.messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send team chat message
 * @route   POST /api/teams/:teamId/messages
 * @access  Private (Owner/Member)
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    const newMsg = {
      sender: req.user._id,
      senderId: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    };

    team.messages.push(newMsg);
    await team.save();

    await team.populate('messages.sender', 'name email avatar role title');
    await team.populate('messages.senderId', 'name email avatar role title');
    const createdMsg = team.messages[team.messages.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: createdMsg
    });
  } catch (error) {
    next(error);
  }
};

// =================== FILES ===================

/**
 * @desc    Get team files
 * @route   GET /api/teams/:teamId/files
 * @access  Private (Owner/Member)
 */
export const getFiles = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId).populate('files.uploadedBy', 'name avatar');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    return res.status(200).json({
      success: true,
      count: team.files.length,
      data: team.files
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload file to team workspace
 * @route   POST /api/teams/:teamId/files
 * @access  Private (Owner/Member)
 */
export const uploadFile = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    // Require a real uploaded file — reject requests without one
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a real file to upload.' });
    }

    const fileName = req.file.originalname;
    const fileUrl = `/uploads/workspace/${req.file.filename}`;
    // Format size: show MB if >= 1024 KB, otherwise KB
    const sizeKb = req.file.size / 1024;
    const fileSize = sizeKb >= 1024
      ? `${(sizeKb / 1024).toFixed(1)} MB`
      : `${sizeKb.toFixed(1)} KB`;

    const newFile = {
      name: fileName,
      url: fileUrl,
      size: fileSize,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    team.files.push(newFile);
    await team.save();

    await team.populate('files.uploadedBy', 'name avatar');
    const createdFile = team.files[team.files.length - 1];

    // Notify all other team members (owner + members, excluding uploader)
    try {
      let projectTitle = team.name;
      if (team.project) {
        const projectDoc = await Project.findById(team.project).select('title');
        if (projectDoc && projectDoc.title) {
          projectTitle = projectDoc.title;
        }
      }

      // Collect distinct user IDs of owner and members
      const recipientIds = new Set();
      if (team.owner && team.owner.toString() !== req.user._id.toString()) {
        recipientIds.add(team.owner.toString());
      }
      if (Array.isArray(team.members)) {
        for (const member of team.members) {
          if (member.user && member.user.toString() !== req.user._id.toString()) {
            recipientIds.add(member.user.toString());
          }
        }
      }

      const notifPromises = Array.from(recipientIds).map((recipientId) =>
        Notification.create({
          recipient: recipientId,
          sender: req.user._id,
          type: 'FILE_SHARED',
          title: 'New File Shared',
          message: `${req.user.name} shared "${fileName}" in "${projectTitle}".`,
          relatedProject: team.project,
          relatedEntity: createdFile._id,
          link: `/team-workspace?tab=files`
        })
      );
      await Promise.all(notifPromises);
    } catch (notifErr) {
      console.error('Error creating file shared notification:', notifErr);
    }

    return res.status(201).json({
      success: true,
      message: 'File shared in workspace successfully',
      data: createdFile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download a shared team file (forces browser download with correct filename)
 * @route   GET /api/teams/:teamId/files/:fileId/download
 * @access  Private (Owner/Member)
 */
export const downloadFile = async (req, res, next) => {
  try {
    const { teamId, fileId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    const fileRecord = team.files.id(fileId);
    if (!fileRecord) {
      return res.status(404).json({ success: false, message: 'File record not found' });
    }

    // Build absolute disk path from the stored relative URL
    // fileRecord.url looks like: /uploads/workspace/file-<timestamp>-<name>.ext
    const relativePath = fileRecord.url.replace(/^\//, ''); // strip leading slash
    const absolutePath = path.resolve(relativePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server storage' });
    }

    // Send file with attachment disposition so browser triggers download
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileRecord.name)}"`);
    res.download(absolutePath, fileRecord.name, (err) => {
      if (err) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getMessages,
  sendMessage,
  getFiles,
  uploadFile,
  downloadFile
};
