import Project from '../models/Project.js';
import ProjectApplication from '../models/ProjectApplication.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { calculateTeamSkillCoverage } from '../services/matchingService.js';

/**
 * @desc    Apply to a project
 * @route   POST /api/projects/:projectId/apply
 * @access  Private (WORKER only)
 */
export const applyToProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { coverMessage } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Rule: Cannot apply to closed project
    if (project.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply to a closed project'
      });
    }

    // Rule: Cannot apply to own project
    if (project.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply to your own project'
      });
    }

    // Rule: Cannot apply if already a confirmed team member
    const existingTeam = await Team.findOne({
      project: project._id,
      'members.user': req.user._id
    });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this project team'
      });
    }

    // Rule: Cannot apply twice to the same project
    const existingApp = await ProjectApplication.findOne({
      project: project._id,
      worker: req.user._id
    });

    if (existingApp) {
      if (existingApp.status === 'PENDING') {
        return res.status(409).json({
          success: false,
          message: 'You have already submitted a pending application for this project'
        });
      }
      if (existingApp.status === 'ACCEPTED') {
        return res.status(400).json({
          success: false,
          message: 'Your application has already been accepted for this project'
        });
      }
      // If previously withdrawn or rejected, allow re-applying by updating status
      existingApp.status = 'PENDING';
      existingApp.coverMessage = coverMessage || existingApp.coverMessage;
      existingApp.appliedAt = new Date();
      await existingApp.save();

      // Notify project owner
      await Notification.create({
        recipient: project.owner,
        sender: req.user._id,
        type: 'APPLICATION_RECEIVED',
        title: 'New Worker Application',
        message: `${req.user.name} applied for "${project.title}"`,
        link: `/requests`
      });

      return res.status(200).json({
        success: true,
        message: 'Application re-submitted successfully',
        data: {
          application: existingApp
        }
      });
    }

    // Create new application
    const application = await ProjectApplication.create({
      project: project._id,
      worker: req.user._id,
      coverMessage: coverMessage || '',
      status: 'PENDING'
    });

    // Notify project owner
    await Notification.create({
      recipient: project.owner,
      sender: req.user._id,
      type: 'APPLICATION_RECEIVED',
      title: 'New Worker Application',
      message: `${req.user.name} applied for "${project.title}"`,
      link: `/requests`
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications submitted by current worker
 * @route   GET /api/applications/my
 * @access  Private (WORKER only)
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await ProjectApplication.find({ worker: req.user._id })
      .populate({
        path: 'project',
        populate: { path: 'owner', select: 'name email company avatar' }
      })
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw submitted application
 * @route   PUT /api/applications/:id/withdraw
 * @access  Private (WORKER only)
 */
export const withdrawApplication = async (req, res, next) => {
  try {
    const application = await ProjectApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify worker ownership
    if (application.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only withdraw your own applications'
      });
    }

    if (application.status === 'WITHDRAWN') {
      return res.status(400).json({
        success: false,
        message: 'Application is already withdrawn'
      });
    }

    application.status = 'WITHDRAWN';
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications for a specific project
 * @route   GET /api/projects/:projectId/applications
 * @access  Private (Project OWNER only)
 */
export const getProjectApplications = async (req, res, next) => {
  try {
    const { projectId } = req.params;

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
        message: 'Forbidden: Only the project owner can view applications for this project'
      });
    }

    const applications = await ProjectApplication.find({ project: projectId })
      .populate('worker', 'name email title avatar bio skills education experienceLevel experienceYears github linkedin portfolio resume resumeStatus')
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a worker's application & automatically add worker to Project Team
 * @route   PUT /api/applications/:id/accept
 * @access  Private (Project OWNER only)
 */
export const acceptApplication = async (req, res, next) => {
  try {
    const application = await ProjectApplication.findById(req.params.id)
      .populate('project')
      .populate('worker');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const project = application.project;
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found'
      });
    }

    // Verify that current user owns the project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project owner can accept applications'
      });
    }

    if (application.status === 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been accepted'
      });
    }

    // 1. Update application status
    application.status = 'ACCEPTED';
    await application.save();

    // 2. Find or Create the Team for this Project
    let team = await Team.findOne({ project: project._id });
    if (!team) {
      team = await Team.create({
        name: `${project.title} Sprint Team`,
        project: project._id,
        owner: req.user._id,
        teamSize: project.teamSize || 4,
        members: []
      });
    }

    // 3. Add worker to team if not already present
    const isMember = team.members.some(
      (m) => m.user.toString() === application.worker._id.toString()
    );

    if (!isMember) {
      const assignedRole = req.body.role || application.worker.title || 'Technical Specialist';
      team.members.push({
        user: application.worker._id,
        role: assignedRole,
        joinedAt: new Date()
      });
    }

    // 4. Recompute team skill coverage
    await team.populate('members.user', 'name email skills title avatar');
    const coverage = calculateTeamSkillCoverage(team.members, project.requiredSkills);
    team.skillCoverage = coverage;
    await team.save();

    // 5. Create notification for worker
    await Notification.create({
      recipient: application.worker._id,
      sender: req.user._id,
      type: 'APPLICATION_ACCEPTED',
      title: 'Application Accepted! 🎉',
      message: `Congratulations! You have been accepted to join "${project.title}" team.`,
      link: `/teams`
    });

    return res.status(200).json({
      success: true,
      message: 'Worker application accepted and added to team successfully',
      data: {
        application,
        team
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a worker's application
 * @route   PUT /api/applications/:id/reject
 * @access  Private (Project OWNER only)
 */
export const rejectApplication = async (req, res, next) => {
  try {
    const application = await ProjectApplication.findById(req.params.id)
      .populate('project')
      .populate('worker');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const project = application.project;
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project owner can reject applications'
      });
    }

    application.status = 'REJECTED';
    await application.save();

    // Notify worker
    await Notification.create({
      recipient: application.worker._id,
      sender: req.user._id,
      type: 'APPLICATION_REJECTED',
      title: 'Application Update',
      message: `Your application for "${project.title}" was not selected at this time.`,
      link: `/projects`
    });

    return res.status(200).json({
      success: true,
      message: 'Application rejected',
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  applyToProject,
  getMyApplications,
  withdrawApplication,
  getProjectApplications,
  acceptApplication,
  rejectApplication
};
