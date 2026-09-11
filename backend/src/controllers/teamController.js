import { validationResult } from 'express-validator';
import Team from '../models/Team.js';
import Project from '../models/Project.js';
import ProjectApplication from '../models/ProjectApplication.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { calculateTeamSkillCoverage } from '../services/matchingService.js';

/**
 * @desc    Create a new team explicitly
 * @route   POST /api/teams
 * @access  Private (OWNER only)
 */
export const createTeam = async (req, res, next) => {
  try {
    const { name, projectId, teamSize } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required to create a team'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only create teams for your own projects'
      });
    }

    const existingTeam = await Team.findOne({ project: projectId });
    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: 'A team already exists for this project',
        data: { team: existingTeam }
      });
    }

    const team = await Team.create({
      name: name ? name.trim() : `${project.title} Sprint Team`,
      project: project._id,
      owner: req.user._id,
      teamSize: Number(teamSize) || project.teamSize || 4,
      members: []
    });

    return res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: {
        team
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all teams related to authenticated user (as Owner or Member)
 * @route   GET /api/teams/my
 * @access  Private
 */
export const getMyTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    })
      .populate('project', 'title description category status requiredSkills duration durationUnit')
      .populate('owner', 'name email company avatar')
      .populate('members.user', 'name email title avatar skills experienceLevel')
      .populate('tasks.assignee', 'name email avatar role title')
      .populate('messages.sender', 'name email avatar role title')
      .populate('messages.senderId', 'name email avatar role title')
      .sort({ updatedAt: -1 });

    // Ensure team members strictly reflect the real database relationship:
    // Project -> project.id -> Application.projectId -> Application.workerId -> User.id
    // Only workers with an ACCEPTED application for this specific project are included in Team Roster
    for (const team of teams) {
      const projectId = team.project?._id || team.project;
      if (projectId) {
        const acceptedApps = await ProjectApplication.find({
          project: projectId,
          status: 'ACCEPTED'
        }).select('worker');

        const acceptedWorkerIdSet = new Set(
          acceptedApps.map((a) => a.worker.toString())
        );

        const originalLength = team.members.length;
        team.members = team.members.filter((m) => {
          const workerId = (m.user?._id || m.user)?.toString();
          return workerId && acceptedWorkerIdSet.has(workerId);
        });

        if (team.members.length !== originalLength) {
          const validUserIds = team.members.map((m) => m.user?._id || m.user);
          await Team.updateOne(
            { _id: team._id },
            {
              $pull: {
                members: { user: { $nin: validUserIds } }
              }
            }
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single team details by ID
 * @route   GET /api/teams/:id
 * @access  Private (Owner or Team Member only)
 */
export const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('project')
      .populate('owner', 'name email company avatar bio')
      .populate('members.user', 'name email title avatar skills experienceLevel github linkedin portfolio')
      .populate('tasks.assignee', 'name avatar')
      .populate('messages.sender', 'name email avatar role title')
      .populate('messages.senderId', 'name email avatar role title')
      .populate('files.uploadedBy', 'name avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Ensure team members strictly reflect real ACCEPTED applications for this project
    const projectId = team.project?._id || team.project;
    if (projectId) {
      const acceptedApps = await ProjectApplication.find({
        project: projectId,
        status: 'ACCEPTED'
      }).select('worker');

      const acceptedWorkerIdSet = new Set(
        acceptedApps.map((a) => a.worker.toString())
      );

      const originalLength = team.members.length;
      team.members = team.members.filter((m) => {
        const workerId = (m.user?._id || m.user)?.toString();
        return workerId && acceptedWorkerIdSet.has(workerId);
      });

      if (team.members.length !== originalLength) {
        const validUserIds = team.members.map((m) => m.user?._id || m.user);
        await Team.updateOne(
          { _id: team._id },
          {
            $pull: {
              members: { user: { $nin: validUserIds } }
            }
          }
        );
      }
    }

    // Authorization check: User must be either Owner or Member
    const isOwner = team.owner._id.toString() === req.user._id.toString();
    const isMember = team.members.some(
      (m) => m.user && m.user._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have access to this team workspace'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        team,
        isOwner,
        isMember
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update team metadata
 * @route   PUT /api/teams/:id
 * @access  Private (Team OWNER only)
 */
export const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the team owner can update team settings'
      });
    }

    const { name, status, teamSize } = req.body;
    if (name) team.name = name.trim();
    if (status) team.status = status;
    if (teamSize) team.teamSize = Number(teamSize);

    await team.save();

    return res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: {
        team
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete team
 * @route   DELETE /api/teams/:id
 * @access  Private (Team OWNER only)
 */
export const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the team owner can delete this team'
      });
    }

    await team.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign role to a team member
 * @route   PUT /api/teams/:id/members/:userId/role
 * @access  Private (Team OWNER only)
 */
export const updateMemberRole = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the team owner can assign member roles'
      });
    }

    const memberIndex = team.members.findIndex(
      (m) => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this team'
      });
    }

    team.members[memberIndex].role = role.trim();
    await team.save();

    return res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      data: {
        team
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a member from team
 * @route   DELETE /api/teams/:id/members/:userId
 * @access  Private (Team OWNER only)
 */
export const removeTeamMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const team = await Team.findById(id).populate('project');
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the team owner can remove members'
      });
    }

    team.members = team.members.filter(
      (m) => m.user.toString() !== userId
    );

    // Recalculate skill coverage
    await team.populate('members.user', 'skills');
    const projectSkills = team.project ? team.project.requiredSkills : [];
    team.skillCoverage = calculateTeamSkillCoverage(team.members, projectSkills);

    await team.save();

    // Notify removed worker
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'SYSTEM_UPDATE',
      title: 'Team Update',
      message: `You were removed from ${team.name}.`,
      link: '/teams'
    });

    return res.status(200).json({
      success: true,
      message: 'Member removed from team successfully',
      data: {
        team
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Leave team
 * @route   PUT /api/teams/:id/leave
 * @access  Private (WORKER only)
 */
export const leaveTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).populate('project');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Rule: Owner cannot leave own team with this endpoint
    if (team.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Team owners cannot leave their own team. You can archive or delete the team instead.'
      });
    }

    const isMember = team.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    team.members = team.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );

    // Recalculate skill coverage
    await team.populate('members.user', 'skills');
    const projectSkills = team.project ? team.project.requiredSkills : [];
    team.skillCoverage = calculateTeamSkillCoverage(team.members, projectSkills);

    await team.save();

    // Notify owner
    await Notification.create({
      recipient: team.owner,
      sender: req.user._id,
      type: 'SYSTEM_UPDATE',
      title: 'Member Left Team',
      message: `${req.user.name} has left ${team.name}.`,
      link: `/teams`
    });

    return res.status(200).json({
      success: true,
      message: 'You have left the team successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Worker accepts team invitation
 * @route   PUT /api/teams/:id/accept-invite
 * @access  Private (WORKER only)
 */
export const acceptTeamInvite = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).populate('project');
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const projectId = team.project?._id || team.project;

    // Strict Rule: Worker must have an ACCEPTED application for this project in MongoDB
    const acceptedApp = await ProjectApplication.findOne({
      project: projectId,
      worker: req.user._id,
      status: 'ACCEPTED'
    });

    if (!acceptedApp) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You must have an accepted application for this project to join the team'
      });
    }

    // Add worker to team if not already present
    const isMember = team.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      const assignedRole = req.user.title || 'Technical Specialist';
      team.members.push({
        user: req.user._id,
        role: assignedRole,
        joinedAt: new Date()
      });

      await team.populate('members.user', 'skills');
      const projectSkills = team.project ? team.project.requiredSkills : [];
      team.skillCoverage = calculateTeamSkillCoverage(team.members, projectSkills);
      await team.save();
    }

    // Mark any unread team invitations for this project as read
    await Notification.updateMany(
      {
        recipient: req.user._id,
        relatedProject: projectId,
        type: 'TEAM_INVITATION',
        isRead: false
      },
      { $set: { isRead: true } }
    );

    // Notify project/team owner
    await Notification.create({
      recipient: team.owner,
      sender: req.user._id,
      type: 'TEAM_JOINED',
      title: 'Team Member Joined',
      message: `${req.user.name} accepted the invitation and joined ${team.name}.`,
      relatedProject: projectId,
      relatedEntity: team._id,
      link: '/teams'
    });

    return res.status(200).json({
      success: true,
      message: 'You have joined the team workspace successfully',
      data: {
        team
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  updateMemberRole,
  removeTeamMember,
  leaveTeam,
  acceptTeamInvite
};
