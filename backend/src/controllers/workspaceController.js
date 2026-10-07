import mongoose from 'mongoose';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import path from 'path';
import fs from 'fs';

/**
 * Helper to verify user is owner or member of team
 */
const findTeamByIdOrProject = async (identifier) => {
  if (!identifier) return null;
  let team = null;
  if (mongoose.isValidObjectId(identifier)) {
    team = await Team.findById(identifier);
    if (!team) {
      team = await Team.findOne({ project: identifier });
    }
  }
  return team;
};

const verifyTeamAccess = (team, userId) => {
  const isOwner = (team.owner?._id || team.owner)?.toString() === userId.toString();
  const isMember = (team.members || []).some(
    (m) => (m.user?._id || m.user)?.toString() === userId.toString()
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
    let team = await findTeamByIdOrProject(req.params.teamId);
    if (team) {
      await team.populate('tasks.assignee', 'name email avatar role title');
    }

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    let tasks = (team.tasks || []).map((t) => {
      const tObj = t.toObject ? t.toObject() : t;
      return {
        ...tObj,
        _id: tObj._id,
        id: tObj._id,
        projectId: team.project,
        assignedTo: tObj.assignee
      };
    });

    // If Worker, only display tasks assigned to their real user ID (unless Team Leader)
    if (req.user && req.user.role === 'WORKER') {
      const isLeader = Boolean(team.leader && team.leader.toString() === req.user._id.toString());
      if (!isLeader) {
        tasks = tasks.filter((t) => {
          const aId = (t.assignee?._id || t.assignee)?.toString();
          return aId && aId === req.user._id.toString();
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
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

    const team = await findTeamByIdOrProject(req.params.teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    // Team Leader role check:
    // If a Team Leader is assigned to this team, ONLY the Team Leader can create and assign tasks.
    // If NO Team Leader has been assigned yet, only the Project Owner can create tasks.
    // Normal workers cannot create or assign tasks.
    const isOwner = team.owner.toString() === req.user._id.toString();
    const isLeader = Boolean(team.leader && team.leader.toString() === req.user._id.toString());

    if (team.leader) {
      if (!isLeader) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only the Team Leader can create and assign tasks'
        });
      }
    } else {
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only the Team Leader (or Project Owner) can create tasks'
        });
      }
    }

    // Validate assignee if provided (must be an accepted team member)
    if (assignee) {
      const isMember = team.members.some(
        (m) => m.user && m.user.toString() === assignee.toString()
      );
      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Tasks can only be assigned to accepted team members'
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

    // Emit real notification to the assigned worker if assigned
    if (assignee && assignee.toString() !== req.user._id.toString()) {
      try {
        let projectTitle = team.name;
        if (team.project) {
          const projectDoc = await Project.findById(team.project).select('title');
          if (projectDoc && projectDoc.title) {
            projectTitle = projectDoc.title;
          }
        }

        await Notification.create({
          recipient: assignee,
          sender: req.user._id,
          type: 'TASK_ASSIGNED',
          title: 'Task Assigned',
          message: `${req.user.name} assigned you the task "${newTask.title}" in "${projectTitle}".`,
          relatedProject: team.project,
          relatedEntity: createdTask._id,
          link: '/team-workspace?tab=tasks'
        });
      } catch (notifErr) {
        console.error('Error creating TASK_ASSIGNED notification:', notifErr);
      }
    }

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
 * @access  Private (Owner/Leader/Assigned Worker)
 */
export const updateTask = async (req, res, next) => {
  try {
    const { teamId, taskId } = req.params;
    const { title, description, status, priority, assignee, dueDate } = req.body;

    const team = await findTeamByIdOrProject(teamId);
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

    const isOwner = team.owner.toString() === req.user._id.toString();
    const isLeader = Boolean(team.leader && team.leader.toString() === req.user._id.toString());
    const isAssignee = Boolean(task.assignee && task.assignee.toString() === req.user._id.toString());

    // Normal worker permission check:
    // If not leader and not owner, they can ONLY update the status of tasks assigned to them!
    if (!isLeader && !isOwner) {
      if (!isAssignee) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update tasks assigned to you'
        });
      }
      if (title !== undefined || description !== undefined || priority !== undefined || assignee !== undefined || dueDate !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Normal team members can only update task status'
        });
      }
    }

    // Handle assignee update (Leader or Owner only)
    const prevAssignee = task.assignee ? task.assignee.toString() : null;
    let newlyAssignedWorker = null;

    if (assignee !== undefined && assignee !== null && assignee !== '') {
      const isMember = team.members.some(
        (m) => m.user && m.user.toString() === assignee.toString()
      );
      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Only accepted team members can be assigned to tasks'
        });
      }
      if (prevAssignee !== assignee.toString()) {
        newlyAssignedWorker = assignee.toString();
      }
      task.assignee = assignee;
    } else if (assignee === null || assignee === '') {
      task.assignee = null;
    }

    const prevStatus = task.status;
    if (title !== undefined && (isLeader || isOwner)) task.title = title.trim();
    if (description !== undefined && (isLeader || isOwner)) task.description = description.trim();
    // Only the assigned worker can change task status (Leader/Owner CANNOT start or complete tasks assigned to workers)
    if (status !== undefined) {
      if (!isAssignee) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Only the assigned worker can change task status"
        });
      }
      task.status = status;
    }
    if (priority !== undefined && (isLeader || isOwner)) task.priority = priority;
    if (dueDate !== undefined && (isLeader || isOwner)) task.dueDate = dueDate;

    await team.save();

    await team.populate('tasks.assignee', 'name email avatar role title');
    const updatedTask = team.tasks.id(taskId);

    // Resolve project title for notifications
    let projectTitle = team.name;
    if (team.project) {
      const projectDoc = await Project.findById(team.project).select('title');
      if (projectDoc && projectDoc.title) {
        projectTitle = projectDoc.title;
      }
    }

    // 1. Notify new assignee if task was reassigned
    if (newlyAssignedWorker && newlyAssignedWorker !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: newlyAssignedWorker,
          sender: req.user._id,
          type: 'TASK_ASSIGNED',
          title: 'Task Assigned',
          message: `${req.user.name} assigned you the task "${task.title}" in "${projectTitle}".`,
          relatedProject: team.project,
          relatedEntity: task._id,
          link: '/team-workspace?tab=tasks'
        });
      } catch (notifErr) {
        console.error('Error sending reassignment notification:', notifErr);
      }
    }

    // 2. Notify Team Leader AND Owner when worker updates task status to 'In Progress' or 'Done'
    if (status && status !== prevStatus && (status === 'In Progress' || status === 'Done')) {
      try {
        const recipientsToNotify = new Set();

        // Notify Project Owner if not the updater
        if (team.owner.toString() !== req.user._id.toString()) {
          recipientsToNotify.add(team.owner.toString());
        }

        // Notify Team Leader if exists and not the updater
        if (team.leader && team.leader.toString() !== req.user._id.toString()) {
          recipientsToNotify.add(team.leader.toString());
        }

        const notifType = status === 'In Progress' ? 'TASK_STARTED' : 'TASK_COMPLETED';
        const notifTitle = status === 'In Progress' ? 'Task Started' : 'Task Completed';
        const notifMsg = `${req.user.name} marked "${task.title}" as ${status} in "${projectTitle}".`;

        for (const recipientId of recipientsToNotify) {
          await Notification.create({
            recipient: recipientId,
            sender: req.user._id,
            type: notifType,
            title: notifTitle,
            message: notifMsg,
            relatedProject: team.project,
            relatedEntity: task._id,
            link: '/team-workspace?tab=tasks'
          });
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
 * @access  Private (Owner/Leader only)
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { teamId, taskId } = req.params;

    const team = await findTeamByIdOrProject(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!verifyTeamAccess(team, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not part of this team' });
    }

    const isOwner = team.owner.toString() === req.user._id.toString();
    const isLeader = Boolean(team.leader && team.leader.toString() === req.user._id.toString());

    if (!isLeader && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the Team Leader or Project Owner can delete tasks'
      });
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
    const team = await findTeamByIdOrProject(req.params.teamId);
    if (team) {
      await team.populate('messages.sender', 'name email avatar role title');
      await team.populate('messages.senderId', 'name email avatar role title');
    }

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

    const team = await findTeamByIdOrProject(req.params.teamId);
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
    const team = await findTeamByIdOrProject(req.params.teamId);
    if (team) {
      await team.populate('files.uploadedBy', 'name avatar');
    }

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
    const team = await findTeamByIdOrProject(req.params.teamId);
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

    const team = await findTeamByIdOrProject(teamId);
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
