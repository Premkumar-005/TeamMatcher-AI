import React, { useState } from 'react';
import { User, Code2, Globe, Download, Award, Briefcase, GraduationCap, Save, Edit3, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import SkillTag from '../components/ui/SkillTag';
import Button from '../components/ui/Button';

export default function UserProfilePage() {
  const { user, updateUserProfile, updateUserSkills, addToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('80');

  const [formData, setFormData] = useState({
    name: user.name || '',
    title: user.title || 'Full Stack Engineer',
    bio: user.bio || '',
    github: user.github || '',
    linkedin: user.linkedin || '',
    experienceLevel: user.experienceLevel || 'Intermediate'
  });

  // Sync form data whenever user state updates
  React.useEffect(() => {
    setFormData({
      name: user.name || '',
      title: user.title || 'Full Stack Engineer',
      bio: user.bio || '',
      github: user.github || '',
      linkedin: user.linkedin || '',
      experienceLevel: user.experienceLevel || 'Intermediate'
    });
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateUserProfile(formData);
    setIsEditing(false);
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const currentSkills = user.skills || [];
    const exists = currentSkills.some(
      (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );
    if (exists) {
      addToast('Skill Exists', `${newSkillName} is already in your skills list.`, 'info');
      return;
    }

    const updated = [
      ...currentSkills,
      {
        name: newSkillName.trim(),
        proficiency: parseInt(newSkillLevel, 10),
        level: parseInt(newSkillLevel, 10),
        category: 'Custom'
      }
    ];
    await updateUserSkills(updated);
    setNewSkillName('');
  };

  const handleRemoveSkill = async (skillNameToRemove) => {
    const currentSkills = user.skills || [];
    const updated = currentSkills.filter((s) => s.name !== skillNameToRemove);
    await updateUserSkills(updated);
  };

  const handleDownloadResume = () => {
    addToast('Resume Downloaded', `TeamMatcher_Resume_${(user.name || 'User').replace(/\s+/g, '_')}.pdf downloaded.`, 'info');
  };

  return (
    <DashboardLayout title="Developer Profile" maxWidth="max-w-5xl">
      {/* Header Banner Card */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-xl object-cover ring-1 ring-[#27272A] shrink-0"
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{user.name}</h2>
              <p className="text-xs font-medium text-indigo-400 mt-0.5">{user.title}</p>
              <p className="text-xs text-[#9CA3AF] mt-1 max-w-xl leading-relaxed">{user.bio}</p>

              <div className="flex flex-wrap gap-4 text-xs text-[#71717A] font-mono mt-3">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" /> github.com/{user.github}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> linkedin.com/in/{user.linkedin}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadResume}
              icon={Download}
            >
              Download PDF
            </Button>
            <Button
              variant={isEditing ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              icon={Edit3}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Inline Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-[#1C1C1F] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 saas-input"
                />
              </div>
              <div>
                <label className="block text-[#A1A1AA] font-medium mb-1">Role Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 saas-input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[#A1A1AA] font-medium mb-1">Professional Bio</label>
                <textarea
                  value={formData.bio}
                  rows={2}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 saas-input text-xs resize-none"
                />
              </div>
              <div>
                <label className="block text-[#A1A1AA] font-medium mb-1">GitHub Username</label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full px-3 py-2 saas-input"
                />
              </div>
              <div>
                <label className="block text-[#A1A1AA] font-medium mb-1">LinkedIn Handle</label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full px-3 py-2 saas-input"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" icon={Save}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Skills Manager */}
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-5 rounded-2xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" /> Extracted & Custom Skills
            </h3>
            <span className="text-xs text-[#71717A] font-medium">
              {user.skills.length} Competencies
            </span>
          </div>

          {/* Skill Input Control */}
          <form onSubmit={handleAddSkill} className="flex items-center gap-2 pb-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Next.js, PyTorch, GraphQL)..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="flex-1 px-3 py-1.5 saas-input text-xs"
            />
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="px-2.5 py-1.5 saas-input text-xs w-28 bg-[#0B0B0B]"
            >
              <option value="90">Expert (90%)</option>
              <option value="80">Advanced (80%)</option>
              <option value="70">Intermediate (70%)</option>
              <option value="50">Beginner (50%)</option>
            </select>
            <Button type="submit" variant="primary" size="sm" icon={Plus}>
              Add
            </Button>
          </form>

          {/* Skills Tags Grid */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(user.skills || []).map((skill) => (
              <SkillTag
                key={skill.name}
                name={skill.name}
                variant="neutral"
                level={`${skill.proficiency !== undefined ? skill.proficiency : skill.level || 80}%`}
                onRemove={() => handleRemoveSkill(skill.name)}
              />
            ))}
          </div>
        </div>

        {/* Experience & Education Sidebar */}
        <div className="space-y-4">
          {/* Projects History */}
          <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1C1C1F] pb-2">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Extracted Projects
            </h3>
            <div className="space-y-2.5 text-xs">
              {(user.projects || []).map((p) => (
                <div key={p.name} className="p-3 rounded-lg bg-[#0E0E10] border border-[#1C1C1F]">
                  <h4 className="font-medium text-white">{p.name}</h4>
                  <p className="text-indigo-400 text-[11px] mt-0.5">{p.role}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tech?.map((t) => (
                      <span key={t} className="text-[10px] bg-[#141414] text-[#A1A1AA] px-1.5 py-0.2 rounded border border-[#1F1F23]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Certs */}
          <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1C1C1F] pb-2">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Education & Certs
            </h3>
            <div className="space-y-2 text-xs">
              {(user.education || []).map((e) => (
                <div key={e.degree || e.institution} className="p-3 rounded-lg bg-[#0E0E10] border border-[#1C1C1F]">
                  <h4 className="font-medium text-white">{e.degree}</h4>
                  <p className="text-[#71717A] text-[11px]">{e.institution} {e.year ? `• ${e.year}` : ''}</p>
                </div>
              ))}
              {(user.certifications || []).map((c) => (
                <div key={c.name} className="p-3 rounded-lg bg-[#0E0E10] border border-[#1C1C1F]">
                  <h4 className="font-medium text-white">{c.name}</h4>
                  <p className="text-[#71717A] text-[11px]">{c.issuer} {c.date ? `(${c.date})` : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
