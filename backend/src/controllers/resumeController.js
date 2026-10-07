import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import calculateProfileCompletion from '../utils/calculateProfileCompletion.js';
import { parseResumeFile } from '../services/resumeService.js';
import { extractSkillsWithHuggingFace } from '../services/aiService.js';

/**
 * Helper: Synchronizes Hugging Face extracted skills with user.skills in MongoDB
 */
const syncExtractedSkillsToProfile = (user, extractedSkills) => {
  if (!extractedSkills) return;
  const existingMap = new Map();
  (user.skills || []).forEach((s) => {
    const name = typeof s === 'string' ? s : s?.name;
    if (name) existingMap.set(name.toLowerCase().trim(), s);
  });

  const updatedSkills = [...(user.skills || [])];
  const catNames = {
    languages: 'Languages',
    frameworks: 'Frameworks',
    databases: 'Databases',
    tools: 'Tools',
    softSkills: 'Soft Skills'
  };

  Object.entries(extractedSkills).forEach(([catKey, items]) => {
    if (Array.isArray(items)) {
      items.forEach((skillName) => {
        if (!skillName || typeof skillName !== 'string') return;
        const norm = skillName.toLowerCase().trim();
        if (!existingMap.has(norm)) {
          existingMap.set(norm, true);
          updatedSkills.push({
            name: skillName.trim(),
            proficiency: 85,
            level: 85,
            category: catNames[catKey] || 'Technical'
          });
        }
      });
    }
  });

  user.skills = updatedSkills;
};

/**
 * @desc    Upload Worker Resume (PDF/DOCX/DOC/TXT/RTF) + Text Extraction + Hugging Face AI Skill Extraction
 * @route   POST /api/resume/upload
 * @access  Private (WORKER only)
 */
export const uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a resume file. Accepted formats: PDF, DOCX, DOC, TXT, RTF (max 10 MB).'
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

    // Resolve absolute path to the saved file for text extraction
    const absoluteFilePath = req.file.path
      ? path.resolve(req.file.path)
      : path.resolve('uploads', 'resumes', req.file.filename);

    // --- 1. Multi-Format Text Extraction ---
    const parseResult = await parseResumeFile(absoluteFilePath);

    console.log(
      `[resumeController] Upload by user ${req.user._id}. ` +
      `Format: ${parseResult.format || 'unknown'}, ` +
      `Extraction status: ${parseResult.status}, ` +
      `Words: ${parseResult.wordCount}, Chars: ${parseResult.charCount}`
    );

    // Save resume file path and extracted raw text
    user.resume = relativePath;
    user.resumeRawText = parseResult.rawText || '';

    // --- 2. Hugging Face AI Skill Extraction ---
    let aiMessage = '';
    if (parseResult.status === 'TEXT_EXTRACTED' && parseResult.rawText) {
      user.resumeStatus = 'ANALYZING';
      const aiResult = await extractSkillsWithHuggingFace(parseResult.rawText);

      if (aiResult.success && aiResult.extractedSkills) {
        user.extractedSkills = aiResult.extractedSkills;
        syncExtractedSkillsToProfile(user, aiResult.extractedSkills);
        user.resumeStatus = 'ANALYZED';
        user.resumeAnalysisError = '';
        aiMessage = `Hugging Face AI skill extraction succeeded (${aiResult.totalSkillsCount} skills extracted).`;
      } else {
        // Safe error handling: do not crash, keep resume, store meaningful error state
        user.resumeStatus = 'ANALYSIS_FAILED';
        user.resumeAnalysisError = aiResult.error || 'Hugging Face skill extraction failed.';
        aiMessage = `Resume uploaded and text extracted, but Hugging Face AI skill extraction could not complete: ${user.resumeAnalysisError}`;
        console.warn(`[resumeController] AI extraction warning for user ${user._id}:`, user.resumeAnalysisError);
      }
    } else {
      user.resumeStatus = parseResult.status === 'DOC_LIMITED_SUPPORT' ? 'UPLOADED' : 'ANALYSIS_FAILED';
      user.resumeAnalysisError = parseResult.error || 'Text could not be extracted from uploaded document.';
      aiMessage = `Resume uploaded. ${user.resumeAnalysisError}`;
    }

    user.profileCompletion = calculateProfileCompletion(user);
    await user.save();

    return res.status(200).json({
      success: true,
      message: aiMessage,
      data: {
        resume: user.resume,
        resumeStatus: user.resumeStatus,
        resumeAnalysisError: user.resumeAnalysisError || '',
        resumeScore: user.resumeScore,
        profileCompletion: user.profileCompletion,
        extractedSkills: user.extractedSkills,
        extractionStatus: parseResult.status,
        format: parseResult.format || null,
        wordCount: parseResult.wordCount || 0,
        charCount: parseResult.charCount || 0,
        pageCount: parseResult.pageCount || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger or re-trigger Hugging Face AI skill extraction on currently uploaded resume
 * @route   POST /api/resume/analyze
 * @access  Private (WORKER only)
 */
export const analyzeWorkerResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.resumeRawText || user.resumeRawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No resume text available for analysis. Please upload a resume first.'
      });
    }

    user.resumeStatus = 'ANALYZING';
    await user.save();

    const aiResult = await extractSkillsWithHuggingFace(user.resumeRawText);

    if (aiResult.success && aiResult.extractedSkills) {
      user.extractedSkills = aiResult.extractedSkills;
      syncExtractedSkillsToProfile(user, aiResult.extractedSkills);
      user.resumeStatus = 'ANALYZED';
      user.resumeAnalysisError = '';
      user.profileCompletion = calculateProfileCompletion(user);
      await user.save();

      return res.status(200).json({
        success: true,
        message: `Hugging Face AI skill extraction complete (${aiResult.totalSkillsCount} skills extracted).`,
        data: {
          resumeStatus: user.resumeStatus,
          extractedSkills: user.extractedSkills,
          modelUsed: aiResult.modelUsed,
          totalSkillsCount: aiResult.totalSkillsCount
        }
      });
    } else {
      user.resumeStatus = 'ANALYSIS_FAILED';
      user.resumeAnalysisError = aiResult.error || 'Hugging Face AI extraction failed.';
      await user.save();

      return res.status(422).json({
        success: false,
        message: user.resumeAnalysisError,
        data: {
          resumeStatus: user.resumeStatus,
          resumeAnalysisError: user.resumeAnalysisError,
          code: aiResult.code
        }
      });
    }
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

    let fileSize = null;
    if (user.resume) {
      try {
        const filename = path.basename(user.resume);
        const filePath = path.resolve('uploads', 'resumes', filename);
        if (fs.existsSync(filePath)) {
          fileSize = fs.statSync(filePath).size;
        }
      } catch (statErr) {
        fileSize = null;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        resume: user.resume,
        resumeStatus: user.resumeStatus,
        resumeAnalysisError: user.resumeAnalysisError || '',
        resumeScore: user.resumeScore,
        extractedSkills: user.extractedSkills,
        hasRawText: !!(user.resumeRawText && user.resumeRawText.length > 0),
        rawTextWordCount: user.resumeRawText
          ? user.resumeRawText.split(/\s+/).filter(Boolean).length
          : 0,
        uploadedAt: user.updatedAt || user.createdAt,
        fileSize
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    View or download current worker's own uploaded resume
 * @route   GET /api/resume/file
 * @access  Private (WORKER only)
 */
export const viewWorkerResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('resume name email role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume file is currently unavailable.'
      });
    }

    // Resolve filename safely to prevent directory traversal
    const filename = path.basename(user.resume);
    const filePath = path.resolve('uploads', 'resumes', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file is currently unavailable.'
      });
    }

    const ext = path.extname(filename).toLowerCase();
    const mimeMap = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.txt': 'text/plain; charset=utf-8',
      '.rtf': 'application/rtf'
    };

    const contentType = mimeMap[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

export default {
  uploadResumeFile,
  analyzeWorkerResume,
  getResumeDetails,
  viewWorkerResume
};

