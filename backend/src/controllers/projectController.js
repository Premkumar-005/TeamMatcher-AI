import { validationResult } from 'express-validator';
import Project from '../models/Project.js';
import ProjectApplication from '../models/ProjectApplication.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { calculateProjectMatch, rankProjectsForWorker } from '../services/matchingService.js';

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (OWNER only)
 */
export const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      requiredSkills,
      preferredExperienceLevel,
      minimumExperience,
      teamSize,
      duration,
      durationUnit,
      startDate,
      applicationDeadline,
      location,
      workMode,
      budget,
      recommendedRoles,
      status
    } = req.body;

    // Format required skills
    let formattedRequiredSkills = [];
    if (Array.isArray(requiredSkills)) {
      formattedRequiredSkills = requiredSkills.map((s) => {
        if (typeof s === 'string') {
          return { name: s.trim(), requiredLevel: 70, category: 'Technical' };
        }
        return {
          name: s.name.trim(),
          requiredLevel: Number(s.requiredLevel) || 70,
          category: s.category || 'Technical'
        };
      });
    }

    const projectData = {
      title: title.trim(),
      description: description.trim(),
      owner: req.user._id,
      category: category ? category.trim() : 'General Software',
      requiredSkills: formattedRequiredSkills,
      preferredExperienceLevel: preferredExperienceLevel || 'Intermediate',
      minimumExperience: Number(minimumExperience) || 1,
      teamSize: Number(teamSize) || 4,
      duration: Number(duration) || 4,
      durationUnit: durationUnit || 'weeks',
      startDate: startDate || null,
      applicationDeadline: applicationDeadline || null,
      location: location || 'Remote',
      workMode: workMode || 'Remote',
      budget: budget || { amount: 0, currency: 'USD', type: 'Fixed' },
      recommendedRoles: Array.isArray(recommendedRoles) ? recommendedRoles : [],
      status: status || 'OPEN'
    };

    const project = await Project.create(projectData);
    await project.populate('owner', 'name email company avatar');

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all available projects with multi-parameter filtering
 * @route   GET /api/projects
 * @access  Private (All authenticated users)
 */
export const getProjects = async (req, res, next) => {
  try {
    const {
      category,
      skill,
      experienceLevel,
      workMode,
      location,
      status,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    // By default, show OPEN projects unless a specific status is requested
    if (status) {
      query.status = status;
    } else {
      query.status = 'OPEN';
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (experienceLevel && experienceLevel !== 'All') {
      query.preferredExperienceLevel = experienceLevel;
    }

    if (workMode && workMode !== 'All') {
      query.workMode = workMode;
    }

    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (skill) {
      query['requiredSkills.name'] = { $regex: skill, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'requiredSkills.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('owner', 'name email company avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // If logged in as WORKER, attach deterministic match metrics to each project
    let resultData = projects;
    if (req.user && req.user.role === 'WORKER') {
      const workerSkills = req.user.skills || [];
      resultData = projects.map((p) => {
        const pObj = p.toObject();
        const match = calculateProjectMatch(workerSkills, pObj.requiredSkills);
        return {
          ...pObj,
          matchPercentage: match.matchPercentage,
          matchingSkills: match.matchingSkills,
          missingSkills: match.missingSkills,
          qualificationStatus: match.qualificationStatus
        };
      });
    }

    return res.status(200).json({
      success: true,
      count: resultData.length,
      total,
      data: resultData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get project details by ID
 * @route   GET /api/projects/:id
 * @access  Private (All authenticated users)
 */
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'owner',
      'name email company bio avatar linkedin github'
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const projectObj = project.toObject();

    // Check if worker has already applied or if there is an existing team
    if (req.user && req.user.role === 'WORKER') {
      const existingApplication = await ProjectApplication.findOne({
        project: project._id,
        worker: req.user._id
      });
      projectObj.userApplication = existingApplication || null;

      const match = calculateProjectMatch(req.user.skills || [], projectObj.requiredSkills);
      projectObj.matchMetrics = match;
      projectObj.matchPercentage = match.matchPercentage;
    }

    // Check if a team exists for this project
    const team = await Team.findOne({ project: project._id }).populate('members.user', 'name avatar role skills');
    projectObj.team = team || null;

    return res.status(200).json({
      success: true,
      data: {
        project: projectObj
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project details
 * @route   PUT /api/projects/:id
 * @access  Private (Project OWNER only)
 */
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Verify ownership
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not the owner of this project'
      });
    }

    const {
      title,
      description,
      category,
      requiredSkills,
      preferredExperienceLevel,
      minimumExperience,
      teamSize,
      duration,
      durationUnit,
      startDate,
      applicationDeadline,
      location,
      workMode,
      budget,
      recommendedRoles,
      status
    } = req.body;

    if (title !== undefined) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (category !== undefined) project.category = category.trim();
    if (preferredExperienceLevel !== undefined) project.preferredExperienceLevel = preferredExperienceLevel;
    if (minimumExperience !== undefined) project.minimumExperience = Number(minimumExperience);
    if (teamSize !== undefined) project.teamSize = Number(teamSize);
    if (duration !== undefined) project.duration = Number(duration);
    if (durationUnit !== undefined) project.durationUnit = durationUnit;
    if (startDate !== undefined) project.startDate = startDate;
    if (applicationDeadline !== undefined) project.applicationDeadline = applicationDeadline;
    if (location !== undefined) project.location = location;
    if (workMode !== undefined) project.workMode = workMode;
    if (budget !== undefined) project.budget = budget;
    if (recommendedRoles !== undefined && Array.isArray(recommendedRoles)) project.recommendedRoles = recommendedRoles;
    if (status !== undefined) project.status = status;

    if (Array.isArray(requiredSkills)) {
      project.requiredSkills = requiredSkills.map((s) => ({
        name: typeof s === 'string' ? s.trim() : s.name.trim(),
        requiredLevel: (typeof s === 'object' && s.requiredLevel !== undefined) ? Number(s.requiredLevel) : 70,
        category: s.category || 'Technical'
      }));
    }

    const updatedProject = await project.save();
    await updatedProject.populate('owner', 'name email company avatar');

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: updatedProject
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Project OWNER only)
 */
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not the owner of this project'
      });
    }

    // Clean up applications and team related to project
    await ProjectApplication.deleteMany({ project: project._id });
    await Team.deleteMany({ project: project._id });
    await project.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Project and associated team data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project status (DRAFT, OPEN, IN_PROGRESS, COMPLETED, CLOSED)
 * @route   PUT /api/projects/:id/status
 * @access  Private (Project OWNER only)
 */
export const updateProjectStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not the owner of this project'
      });
    }

    project.status = status;
    await project.save();

    return res.status(200).json({
      success: true,
      message: `Project status changed to ${status}`,
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's projects
 *          OWNER: returns projects created by owner
 *          WORKER: returns projects worker has applied to or joined
 * @route   GET /api/projects/my
 * @access  Private
 */
export const getMyProjects = async (req, res, next) => {
  try {
    if (req.user.role === 'OWNER') {
      const projects = await Project.find({ owner: req.user._id })
        .populate('owner', 'name email company avatar')
        .sort({ createdAt: -1 });

      // Attach application counts and team status to each project
      const enrichedProjects = await Promise.all(
        projects.map(async (p) => {
          const pObj = p.toObject();
          const pendingCount = await ProjectApplication.countDocuments({
            project: p._id,
            status: 'PENDING'
          });
          const totalApps = await ProjectApplication.countDocuments({
            project: p._id
          });
          const team = await Team.findOne({ project: p._id });

          return {
            ...pObj,
            pendingApplicationsCount: pendingCount,
            totalApplicationsCount: totalApps,
            team: team || null
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: enrichedProjects.length,
        data: enrichedProjects
      });
    } else {
      // Worker: fetch applications and joined teams
      const applications = await ProjectApplication.find({ worker: req.user._id })
        .populate({
          path: 'project',
          populate: { path: 'owner', select: 'name email company avatar' }
        })
        .sort({ appliedAt: -1 });

      const appliedProjects = applications
        .filter((app) => app.project)
        .map((app) => ({
          ...app.project.toObject(),
          applicationStatus: app.status,
          appliedAt: app.appliedAt,
          applicationId: app._id
        }));

      return res.status(200).json({
        success: true,
        count: appliedProjects.length,
        data: appliedProjects
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get deterministic project compatibility score for a worker
 * @route   GET /api/projects/:projectId/match
 * @access  Private (WORKER only)
 */
export const getProjectMatch = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const workerSkills = req.user.skills || [];
    const match = calculateProjectMatch(workerSkills, project.requiredSkills);

    return res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recommended projects for worker (deterministic ranking)
 * @route   GET /api/projects/recommended
 * @access  Private (WORKER only)
 */
export const getRecommendedProjects = async (req, res, next) => {
  try {
    const openProjects = await Project.find({ status: 'OPEN' })
      .populate('owner', 'name email company avatar')
      .limit(30);

    const workerSkills = req.user.skills || [];
    const ranked = rankProjectsForWorker(workerSkills, openProjects);

    return res.status(200).json({
      success: true,
      count: ranked.length,
      data: ranked
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getMyProjects,
  getProjectMatch,
  getRecommendedProjects
};
