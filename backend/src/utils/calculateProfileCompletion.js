/**
 * Deterministic Profile Completion Calculation
 * Evaluates profile completeness based on user role (OWNER vs WORKER).
 *
 * @param {Object} user - User document or payload
 * @returns {number} Profile completion percentage (0 - 100)
 */
export const calculateProfileCompletion = (user) => {
  if (!user) return 0;
  let score = 0;

  if (user.role === 'OWNER') {
    // Owner Profile Criteria (5 criteria @ 20% each)
    if (user.name && user.name.trim().length > 0) score += 20;
    if (user.bio && user.bio.trim().length > 0) score += 20;
    if (user.company && user.company.trim().length > 0) score += 20;
    if (user.linkedin || user.portfolio || user.github) score += 20;
    if (user.avatar && !user.avatar.includes('default')) score += 20;
  } else {
    // Worker Profile Criteria (Deterministic breakdown)
    // 1. Basic Info (Name 10%, Bio 10%) = 20%
    if (user.name && user.name.trim().length > 0) score += 10;
    if (user.bio && user.bio.trim().length > 0) score += 10;

    // 2. Skills (20%)
    if (Array.isArray(user.skills) && user.skills.length > 0) score += 20;

    // 3. Interests (10%)
    if (Array.isArray(user.interests) && user.interests.length > 0) score += 10;

    // 4. Education / College (10%)
    const hasEducation =
      (user.college && user.college.trim().length > 0) ||
      (Array.isArray(user.education) && user.education.length > 0);
    if (hasEducation) score += 10;

    // 5. Experience / Seniority (10%)
    if (user.experienceLevel || user.experienceYears > 0) score += 10;

    // 6. Online Links (GitHub / LinkedIn / Portfolio) = 10%
    if (user.github || user.linkedin || user.portfolio) score += 10;

    // 7. Resume Uploaded (10%)
    if (user.resume || user.resumeStatus === 'UPLOADED' || user.resumeStatus === 'ANALYZED') {
      score += 10;
    }
  }

  return Math.min(100, Math.max(0, score));
};

export default calculateProfileCompletion;
