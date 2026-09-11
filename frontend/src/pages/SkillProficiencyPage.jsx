import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, Save, GitCompare, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';

export default function SkillProficiencyPage() {
  const { user, updateUserSkills, addToast } = useApp();
  const [editingSkills, setEditingSkills] = useState(user.skills || []);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setEditingSkills(user.skills || []);
  }, [user.skills]);

  const handleSliderChange = (name, newLevel) => {
    const val = parseInt(newLevel, 10);
    setEditingSkills((prev) =>
      prev.map((s) => (s.name === name ? { ...s, level: val, proficiency: val } : s))
    );
  };

  const handleSave = async () => {
    await updateUserSkills(editingSkills);
    setIsEditing(false);
  };

  return (
    <DashboardLayout title="Skill Proficiency" maxWidth="max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium mb-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Profile Benchmarks</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Technical Proficiency</h2>
          <p className="text-xs text-[#9CA3AF]">
            Proficiency levels derived from resume parsing and custom self-assessments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isEditing ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              icon={Save}
            >
              Save Changes
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
              icon={Sliders}
            >
              Adjust Proficiency
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/skill-gap')}
            icon={GitCompare}
          >
            Skill Gap
          </Button>
        </div>
      </div>

      {/* Skill Progress Indicators Card */}
      <Card className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Proficiency Breakdown</h3>
          <span className="text-xs text-[#71717A] font-mono">{editingSkills.length} Verified Competencies</span>
        </div>

        <div className="space-y-4">
          {editingSkills.map((sk) => (
            <div key={sk.name} className="space-y-1.5 p-3 rounded-lg bg-[#0E0E10] border border-[#1C1C1F]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{sk.name}</span>
                <span className="font-mono font-medium text-[#A1A1AA]">{sk.level}%</span>
              </div>

              <ProgressBar
                value={sk.level}
                color={sk.level >= 80 ? 'bg-indigo-500' : 'bg-[#52525B]'}
                height="h-1.5"
              />

              {isEditing && (
                <div className="pt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={sk.level}
                    onChange={(e) => handleSliderChange(sk.name, e.target.value)}
                    className="w-full h-1 bg-[#1A1A1E] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
