import { validationResult } from 'express-validator';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import calculateProfileCompletion from '../utils/calculateProfileCompletion.js';

/**
 * @desc    Register a new user (OWNER or WORKER)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
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
      name,
      email,
      password,
      role,
      title,
      company,
      bio,
      college,
      institution,
      degree,
      education,
      skills,
      selectedSkills,
      interests,
      experienceLevel,
      experienceYears,
      github,
      linkedin,
      portfolio,
      availability
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Validate Role strictly
    const normalizedRole = (role || '').toUpperCase().trim();
    if (!['OWNER', 'WORKER'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be explicitly either OWNER or WORKER',
        errors: [{ field: 'role', message: 'Role must be either OWNER or WORKER' }]
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Format skills if sent as array of strings or objects
    let formattedSkills = [];
    if (Array.isArray(skills) && skills.length > 0) {
      formattedSkills = skills.map((s) => {
        if (typeof s === 'string') {
          return { name: s, proficiency: 80, level: 80, category: 'General' };
        }
        const prof = s.proficiency !== undefined ? s.proficiency : s.level || 80;
        return {
          name: s.name,
          proficiency: Number(prof) || 80,
          level: Number(prof) || 80,
          category: s.category || 'General'
        };
      });
    } else if (Array.isArray(selectedSkills) && selectedSkills.length > 0) {
      formattedSkills = selectedSkills.map((s) => ({
        name: typeof s === 'string' ? s : s.name,
        proficiency: 80,
        level: 80,
        category: 'Core'
      }));
    }

    // Format education
    let formattedEducation = [];
    if (Array.isArray(education) && education.length > 0) {
      formattedEducation = education;
    } else if (degree || institution || college) {
      formattedEducation = [
        {
          degree: degree || 'Degree',
          institution: institution || college || 'University',
          year: 'Present',
          gpa: ''
        }
      ];
    }

    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: normalizedRole,
      title: title || (normalizedRole === 'OWNER' ? 'Project Owner' : 'Full Stack Engineer'),
      company: company || (normalizedRole === 'OWNER' ? institution || college : ''),
      bio: bio || '',
      college: college || institution || '',
      education: formattedEducation,
      skills: formattedSkills,
      interests: Array.isArray(interests) ? interests : [],
      experienceLevel: experienceLevel || 'Intermediate',
      experienceYears: Number(experienceYears) || 0,
      github: github || '',
      linkedin: linkedin || '',
      portfolio: portfolio || '',
      availability: availability || 'AVAILABLE',
      resumeScore: 0,
      resumeStatus: 'NOT_UPLOADED'
    };

    userData.profileCompletion = calculateProfileCompletion(userData);

    // Create user in MongoDB
    const user = await User.create(userData);
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user and explicitly select password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);
    const userResponse = user.toJSON();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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

export default {
  register,
  login,
  getMe
};
