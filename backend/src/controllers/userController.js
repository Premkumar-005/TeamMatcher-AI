import { validationResult } from 'express-validator';
import User from '../models/User.js';
import calculateProfileCompletion from '../utils/calculateProfileCompletion.js';

/**
 * @desc    Get user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details (Role cannot be modified)
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const {
      name,
      title,
      bio,
      company,
      college,
      education,
      experienceLevel,
      experienceYears,
      interests,
      github,
      linkedin,
      portfolio,
      avatar,
      availability,
      availabilityStart,
      availabilityEnd
    } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (title !== undefined) user.title = title.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (company !== undefined) user.company = company.trim();
    if (college !== undefined) user.college = college.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (interests !== undefined && Array.isArray(interests)) user.interests = interests;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (experienceYears !== undefined) user.experienceYears = Number(experienceYears) || 0;
    if (github !== undefined) user.github = github.trim();
    if (linkedin !== undefined) user.linkedin = linkedin.trim();
    if (portfolio !== undefined) user.portfolio = portfolio.trim();
    if (availability !== undefined) user.availability = availability;
    if (availabilityStart !== undefined) user.availabilityStart = availabilityStart;
    if (availabilityEnd !== undefined) user.availabilityEnd = availabilityEnd;

    if (Array.isArray(education)) {
      user.education = education;
    }

    // Recalculate deterministic profile completion
    user.profileCompletion = calculateProfileCompletion(user);

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user skills
 * @route   PUT /api/users/me/skills
 * @access  Private (WORKER)
 */
export const updateUserSkills = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array of skill objects'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const formattedSkills = skills.map((s) => {
      if (typeof s === 'string') {
        return { name: s.trim(), proficiency: 80, level: 80, category: 'General' };
      }
      const prof = s.proficiency !== undefined ? s.proficiency : s.level || 80;
      return {
        name: s.name.trim(),
        proficiency: Number(prof) || 80,
        level: Number(prof) || 80,
        category: s.category || 'General'
      };
    });

    user.skills = formattedSkills;
    user.profileCompletion = calculateProfileCompletion(user);

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Skills updated successfully',
      data: {
        skills: updatedUser.skills,
        profileCompletion: updatedUser.profileCompletion
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/users/me/password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get workers directory (for OWNER to browse available talent)
 * @route   GET /api/users/workers
 * @access  Private
 */
export const getWorkers = async (req, res, next) => {
  try {
    const { skill, experienceLevel, availability, search } = req.query;

    const query = { role: 'WORKER' };

    if (availability) {
      query.availability = availability;
    }
    if (experienceLevel && experienceLevel !== 'All') {
      query.experienceLevel = experienceLevel;
    }
    if (skill) {
      query['skills.name'] = { $regex: skill, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { 'skills.name': { $regex: search, $options: 'i' } }
      ];
    }

    const workers = await User.find(query).select('-password').sort({ profileCompletion: -1 });

    return res.status(200).json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  updateUserSkills,
  changePassword,
  getWorkers
};
