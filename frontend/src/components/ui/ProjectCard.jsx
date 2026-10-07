import React from 'react';
import { Users, ArrowRight, Sparkles, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SkillTag from './SkillTag';

export default function ProjectCard({ project, onSelect, userSkills = [] }) {
  const navigate = useNavigate();
  const {
    title,
    name,
    category,
    description,
    difficulty,
    teamSize,
    requiredSkills = []
  } = project;

  const displayTitle = title || name || 'Project';
  const projectId = project.id || project._id;

  // Calculate real match percentage without hardcoded default
  let displayMatch = 0;
  if (typeof project.matchPercentage === 'number') {
    displayMatch = project.matchPercentage;
  } else if (typeof project.compatibility === 'number') {
    displayMatch = project.compatibility;
  } else if (requiredSkills.length > 0 && userSkills.length > 0) {
    const userSkillNames = new Set(
      userSkills.map((s) => (typeof s === 'string' ? s : s.name || s.skill || '').toLowerCase().trim()).filter(Boolean)
    );
    const matchedCount = requiredSkills.filter((req) => {
      const reqName = (typeof req === 'string' ? req : req.name || '').toLowerCase().trim();
      return userSkillNames.has(reqName);
    }).length;
    displayMatch = Math.round((matchedCount / requiredSkills.length) * 100);
  }

  const handleCardClick = () => {
    if (onSelect) onSelect(project);
    navigate(`/projects/${projectId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-[#0B0B0B] border border-[#1C1C1F] hover:border-[#2E2E33] transition-all rounded-xl p-5 flex flex-col justify-between h-full cursor-pointer group"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <span className="text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {category || 'Development'}
            </span>
            <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-indigo-400 transition-colors leading-snug">
              {displayTitle}
            </h3>
          </div>

          {/* Skill Match % Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>{displayMatch}% Match</span>
            </div>
            {difficulty && (
              <span className="text-[10px] text-[#71717A] mt-1 font-medium">{difficulty}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#9CA3AF] leading-relaxed mb-3.5 line-clamp-2">
          {description}
        </p>

        {/* Team Size info */}
        <div className="flex items-center gap-4 text-xs text-[#71717A] mb-3.5">
          {teamSize && (
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              {teamSize}
            </span>
          )}
          <span className="flex items-center gap-1.5 font-medium">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            {requiredSkills.length} Requirements
          </span>
        </div>

        {/* Required Skills list */}
        {requiredSkills.length > 0 && (
          <div className="space-y-1.5 mb-2">
            <span className="text-[10px] font-medium text-[#71717A] uppercase tracking-wider block">
              Required Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map((skill, idx) => {
                const skillName = typeof skill === 'string' ? skill : skill.name || '';
                const isMatched = userSkills.some((s) => {
                  const sName = typeof s === 'string' ? s : s.name || s.skill || '';
                  return sName.toLowerCase().trim() === skillName.toLowerCase().trim();
                });
                return (
                  <SkillTag
                    key={idx}
                    name={skillName}
                    variant={isMatched ? 'matched' : 'neutral'}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#1C1C1F] flex items-center justify-between mt-3">
        <span className="text-xs font-medium text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
          View Project Details
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}
