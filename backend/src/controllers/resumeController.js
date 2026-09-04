import User from '../models/User.js';
import calculateProfileCompletion from '../utils/calculateProfileCompletion.js';

/**
 * @desc    Upload Worker Resume (PDF)
 * @route   POST /api/resume/upload
 * @access  Private (WORKER only)
 */
export const uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid PDF resume file'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const relativePath = `/uploads/resumes/${req.file.filename}`;

    user.resume = relativePath;
    user.resumeStatus = 'UPLOADED';
    user.resumeScore = 0; // Intentionally 0 / clean placeholder for future Hugging Face model
    user.profileCompletion = calculateProfileCompletion(user);

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully. Securely stored for future AI skill extraction.',
      data: {
        resume: user.resume,
        resumeStatus: user.resumeStatus,
        resumeScore: user.resumeScore,
        profileCompletion: user.profileCompletion
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current worker's resume details
 * @route   GET /api/resume/me
 * @access  Private (WORKER only)
 */
export const getResumeDetails = async (req, res, next) => {
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
        resume: user.resume,
        resumeStatus: user.resumeStatus,
        resumeScore: user.resumeScore,
        extractedSkills: user.extractedSkills
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadResumeFile,
  getResumeDetails
};
