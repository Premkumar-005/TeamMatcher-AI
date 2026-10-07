/**
 * Deterministic Matching Service for TeamMatcher
 *
 * Integrates Real Hugging Face Resume Extracted Skills:
 * - Primary source: extractedSkills from analyzed resume (languages, frameworks, databases, tools, softSkills)
 * - Fallback: manual profile skills
 */

/**
 * Normalizes skill name for reliable comparison
 * @param {string} name
 * @returns {string}
 */
export const normalizeSkillName = (name) => {
  if (!name) return '';
  return name.trim().toLowerCase();
};

/**
 * Resolves effective skills for matching:
 * Primary source: extractedSkills from analyzed resume
 * Fallback: manual profile skills
 *
 * @param {Object|Array} worker - Worker user object or array of skills
 * @returns {Array} Array of skill objects [{ name, proficiency, level, source }]
 */
export const getEffectiveWorkerSkills = (worker) => {
  if (!worker) return [];

  // If worker is already an array of skills, return as-is
  if (Array.isArray(worker)) return worker;

  const userObj = worker.toObject ? worker.toObject() : worker;

  // 1. Primary Source: extractedSkills from analyzed resume
  const extracted = userObj.extractedSkills;
  const hasExtractedSkills =
    extracted &&
    (
      (Array.isArray(extracted.languages) && extracted.languages.length > 0) ||
      (Array.isArray(extracted.frameworks) && extracted.frameworks.length > 0) ||
      (Array.isArray(extracted.databases) && extracted.databases.length > 0) ||
      (Array.isArray(extracted.tools) && extracted.tools.length > 0) ||
      (Array.isArray(extracted.softSkills) && extracted.softSkills.length > 0)
    );

  if (hasExtractedSkills) {
    const skillsList = [];
    const seen = new Set();

    // Map any manual proficiencies if the user also rated them manually
    const manualMap = new Map();
    (userObj.skills || []).forEach((s) => {
      if (!s) return;
      const name = typeof s === 'string' ? s : s.name;
      const prof = typeof s === 'object' && s.proficiency !== undefined ? s.proficiency : s.level || 80;
      if (name) manualMap.set(normalizeSkillName(name), Number(prof) || 80);
    });

    const addCategorySkills = (items, category) => {
      if (!Array.isArray(items)) return;
      items.forEach((item) => {
        if (!item || typeof item !== 'string') return;
        const norm = normalizeSkillName(item);
        if (!seen.has(norm)) {
          seen.add(norm);
          const prof = manualMap.has(norm) ? manualMap.get(norm) : 80;
          skillsList.push({
            name: item.trim(),
            category,
            proficiency: prof,
            level: prof,
            source: 'RESUME_AI'
          });
        }
      });
    };

    addCategorySkills(extracted.languages, 'Languages');
    addCategorySkills(extracted.frameworks, 'Frameworks');
    addCategorySkills(extracted.databases, 'Databases');
    addCategorySkills(extracted.tools, 'Tools');
    addCategorySkills(extracted.softSkills, 'SoftSkills');

    if (skillsList.length > 0) {
      return skillsList;
    }
  }

  // 2. Fallback: manual profile skills
  return userObj.skills || [];
};

/**
 * Calculate deterministic compatibility between a worker and a project
 *
 * @param {Array|Object} workerOrSkills - Worker object or array of worker skill objects
 * @param {Array} projectRequiredSkills - Array of required skill objects [{ name, requiredLevel }]
 * @returns {Object} Deterministic match metrics
 */
export const calculateProjectMatch = (workerOrSkills = [], projectRequiredSkills = []) => {
  const workerSkills = Array.isArray(workerOrSkills)
    ? workerOrSkills
    : getEffectiveWorkerSkills(workerOrSkills);

  if (!projectRequiredSkills || projectRequiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchingSkills: [],
      missingSkills: [],
      qualificationStatus: 'QUALIFIED',
      skillBreakdown: []
    };
  }

  // Create lookup map for worker skills
  const workerSkillMap = new Map();
  (workerSkills || []).forEach((s) => {
    if (!s) return;
    const name = typeof s === 'string' ? s : s.name;
    const prof = typeof s === 'object' && s.proficiency !== undefined ? s.proficiency : s.level || 80;
    if (name) {
      workerSkillMap.set(normalizeSkillName(name), {
        name,
        proficiency: Number(prof) || 80
      });
    }
  });

  const matchingSkills = [];
  const missingSkills = [];
  const skillBreakdown = [];
  let totalScore = 0;

  projectRequiredSkills.forEach((reqSkill) => {
    const reqName = typeof reqSkill === 'string' ? reqSkill : reqSkill.name;
    const reqLevel = (typeof reqSkill === 'object' && reqSkill.requiredLevel !== undefined)
      ? Number(reqSkill.requiredLevel)
      : 70;

    const normalizedReq = normalizeSkillName(reqName);
    const workerSkill = workerSkillMap.get(normalizedReq);

    if (workerSkill) {
      const proficiency = workerSkill.proficiency;
      const meetsLevel = proficiency >= reqLevel;

      // Calculate skill score contribution (scaled by proficiency vs required)
      const ratio = Math.min(1.2, proficiency / Math.max(reqLevel, 1));
      const skillScore = Math.min(100, Math.round(ratio * 100));
      totalScore += skillScore;

      matchingSkills.push(reqName);
      skillBreakdown.push({
        name: reqName,
        requiredLevel: reqLevel,
        workerProficiency: proficiency,
        isMatch: true,
        meetsLevel,
        gap: Math.max(0, reqLevel - proficiency)
      });
    } else {
      missingSkills.push(reqName);
      skillBreakdown.push({
        name: reqName,
        requiredLevel: reqLevel,
        workerProficiency: 0,
        isMatch: false,
        meetsLevel: false,
        gap: reqLevel
      });
    }
  });

  const rawMatchPercentage = Math.round(totalScore / projectRequiredSkills.length);
  const matchPercentage = Math.max(0, Math.min(100, rawMatchPercentage));

  let qualificationStatus = 'NOT_QUALIFIED';
  if (matchPercentage >= 75) {
    qualificationStatus = 'QUALIFIED';
  } else if (matchPercentage >= 40) {
    qualificationStatus = 'PARTIAL';
  }

  return {
    matchPercentage,
    matchingSkills,
    missingSkills,
    qualificationStatus,
    skillBreakdown
  };
};

/**
 * Calculate team skill coverage across all confirmed team members
 *
 * @param {Array} teamMembers - Array of user objects or member objects
 * @param {Array} projectRequiredSkills - Array of required skill objects
 * @returns {Object} Team skill coverage metrics
 */
export const calculateTeamSkillCoverage = (teamMembers = [], projectRequiredSkills = []) => {
  if (!projectRequiredSkills || projectRequiredSkills.length === 0) {
    return {
      percentage: 100,
      coveredSkills: [],
      missingSkills: []
    };
  }

  // Aggregate all unique skills possessed by all team members (supporting resume extracted skills)
  const teamSkillsSet = new Set();
  (teamMembers || []).forEach((member) => {
    const userObj = member.user || member;
    const skills = getEffectiveWorkerSkills(userObj);
    skills.forEach((s) => {
      const name = typeof s === 'string' ? s : s.name;
      if (name) {
        teamSkillsSet.add(normalizeSkillName(name));
      }
    });
  });

  const coveredSkills = [];
  const missingSkills = [];

  projectRequiredSkills.forEach((reqSkill) => {
    const reqName = typeof reqSkill === 'string' ? reqSkill : reqSkill.name;
    const normalizedReq = normalizeSkillName(reqName);

    if (teamSkillsSet.has(normalizedReq)) {
      coveredSkills.push(reqName);
    } else {
      missingSkills.push(reqName);
    }
  });

  const percentage = Math.round((coveredSkills.length / projectRequiredSkills.length) * 100);

  return {
    percentage: Math.min(100, percentage),
    coveredSkills,
    missingSkills
  };
};

/**
 * Rank open projects for a worker based on deterministic match percentage
 *
 * @param {Array|Object} workerOrSkills - Worker object or array of skills
 * @param {Array} projects - List of open projects
 * @returns {Array} Projects sorted by matchPercentage descending
 */
export const rankProjectsForWorker = (workerOrSkills = [], projects = []) => {
  const workerSkills = Array.isArray(workerOrSkills)
    ? workerOrSkills
    : getEffectiveWorkerSkills(workerOrSkills);

  return projects
    .map((project) => {
      const projectObj = project.toObject ? project.toObject() : project;
      const match = calculateProjectMatch(workerSkills, projectObj.requiredSkills || []);
      return {
        ...projectObj,
        matchMetrics: match,
        matchPercentage: match.matchPercentage
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};

export default {
  normalizeSkillName,
  getEffectiveWorkerSkills,
  calculateProjectMatch,
  calculateTeamSkillCoverage,
  rankProjectsForWorker
};
