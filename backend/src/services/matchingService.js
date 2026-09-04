/**
 * Deterministic Matching Service for TeamMatcher
 *
 * NOTE: As per project guidelines, this module uses deterministic backend logic.
 * AI / Hugging Face resume analysis will be integrated in a future phase.
 */

/**
 * Normalizes skill name for reliable comparison
 * @param {string} name
 * @returns {string}
 */
const normalizeSkillName = (name) => {
  if (!name) return '';
  return name.trim().toLowerCase();
};

/**
 * Calculate deterministic compatibility between a worker and a project
 *
 * @param {Array} workerSkills - Array of worker skill objects [{ name, proficiency, level }]
 * @param {Array} projectRequiredSkills - Array of required skill objects [{ name, requiredLevel }]
 * @returns {Object} Deterministic match metrics
 */
export const calculateProjectMatch = (workerSkills = [], projectRequiredSkills = []) => {
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
 * @param {Array} teamMembers - Array of user objects with their skills
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

  // Aggregate all unique skills possessed by all team members
  const teamSkillsSet = new Set();
  (teamMembers || []).forEach((member) => {
    const userObj = member.user || member;
    const skills = userObj.skills || [];
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
 * @param {Array} workerSkills - Worker's skills
 * @param {Array} projects - List of open projects
 * @returns {Array} Projects sorted by matchPercentage descending
 */
export const rankProjectsForWorker = (workerSkills = [], projects = []) => {
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
  calculateProjectMatch,
  calculateTeamSkillCoverage,
  rankProjectsForWorker
};
