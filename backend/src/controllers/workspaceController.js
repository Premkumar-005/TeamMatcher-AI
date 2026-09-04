import Team from '../models/Team.js';

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
    const team = await Team.findById(req.params.teamId).populate('tasks.assignee', 'name avatar role');

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

    const newTask = {
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      assignee: assignee || null,
      dueDate: dueDate || null,
      status: status || 'To Do',
      createdAt: new Date()
    };

    team.tasks.push(newTask);
    await team.save();

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

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await team.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
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
    const team = await Team.findById(req.params.teamId).populate('messages.sender', 'name avatar role title');

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
      text: text.trim(),
      createdAt: new Date()
    };

    team.messages.push(newMsg);
    await team.save();

    await team.populate('messages.sender', 'name avatar role title');
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

    let fileName = req.body.name || 'Workspace Document';
    let fileUrl = '';
    let fileSize = '120 KB';

    if (req.file) {
      fileName = req.file.originalname;
      fileUrl = `/uploads/workspace/${req.file.filename}`;
      fileSize = `${(req.file.size / 1024).toFixed(1)} KB`;
    } else if (req.body.name) {
      fileUrl = `/uploads/workspace/doc-${Date.now()}.pdf`;
    } else {
      return res.status(400).json({ success: false, message: 'Please provide a file or file name' });
    }

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

    return res.status(201).json({
      success: true,
      message: 'File shared in workspace successfully',
      data: createdFile
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
  uploadFile
};
