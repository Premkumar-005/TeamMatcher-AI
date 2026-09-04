import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FolderGit2, PlusCircle, X, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import ProjectCard from '../components/ui/ProjectCard';
import Button from '../components/ui/Button';

export default function ProjectRequirementsPage() {
  const { projects, setSelectedProject, user, createNewProject } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // New Project Form State (Owner)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'Computer Vision & AI',
    skillsInput: 'React, Node.js, MongoDB, Tailwind CSS',
    teamSize: 4,
    duration: 6,
    durationUnit: 'weeks',
    workMode: 'Remote',
    budgetAmount: 4000
  });

  const categories = [
    'All',
    'Computer Vision & AI',
    'FinTech & Cloud Infrastructure',
    'Healthcare & SaaS',
    'Developer Tools & SaaS',
    'Web3 & Distributed Systems'
  ];

  const isOwner = user?.role === 'OWNER';

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.description.trim()) return;

    setCreating(true);
    const skillsArray = newProject.skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ name: s, requiredLevel: 75 }));

    const res = await createNewProject({
      title: newProject.title,
      description: newProject.description,
      category: newProject.category,
      requiredSkills: skillsArray,
      teamSize: Number(newProject.teamSize) || 4,
      duration: Number(newProject.duration) || 6,
      durationUnit: newProject.durationUnit,
      workMode: newProject.workMode,
      budget: { amount: Number(newProject.budgetAmount) || 0, currency: 'USD', type: 'Fixed' }
    });

    setCreating(false);
    if (res?.success) {
      setShowCreateModal(false);
      setNewProject({
        title: '',
        description: '',
        category: 'Computer Vision & AI',
        skillsInput: 'React, Node.js, MongoDB, Tailwind CSS',
        teamSize: 4,
        duration: 6,
        durationUnit: 'weeks',
        workMode: 'Remote',
        budgetAmount: 4000
      });
    }
  };

  const filteredProjects = projects.filter((p) => {
    const titleMatch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const skillsMatch = (p.requiredSkills || []).some((s) =>
      (typeof s === 'string' ? s : s.name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesSearch = titleMatch || descMatch || skillsMatch;
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout title="Projects Directory">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Projects Directory
            </h2>
            {isOwner && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Owner Mode
              </span>
            )}
          </div>
          <p className="text-xs text-[#9CA3AF]">
            {isOwner
              ? 'Post and oversee engineering project scopes, define required tech stacks, and review applicant queues.'
              : 'Browse open software projects, check deterministic compatibility scores, and submit applications to project owners.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 w-fit">
            {projects.length} Active Projects
          </span>
          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              icon={PlusCircle}
            >
              Post Project
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-3.5 sm:p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search by title, description, or skill tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 saas-input text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#71717A] font-medium">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 saas-input text-xs"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#0B0B0B]">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Card Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={(p) => {
                setSelectedProject(p);
                navigate(`/projects/${p.id}`);
              }}
              userSkills={user.skills || []}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-12 rounded-2xl text-center space-y-3">
          <FolderGit2 className="w-8 h-8 text-[#71717A] mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Matching Projects Found</h3>
          <p className="text-xs text-[#71717A]">
            Try adjusting your search criteria or category filter.
          </p>
        </div>
      )}

      {/* CREATE PROJECT MODAL (OWNER) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0B0B] border border-[#1C1C1F] w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1C1C1F] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Define & Publish New Project</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#71717A] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs saas-input"
                  placeholder="e.g. Next-Gen Enterprise AI Workflow Dashboard"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Project Description & Scope</label>
                <textarea
                  rows={3}
                  required
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs saas-input resize-none"
                  placeholder="Describe the problem, key features to build, and architecture expectations..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Category</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs saas-input"
                  >
                    <option value="Computer Vision & AI">Computer Vision & AI</option>
                    <option value="FinTech & Cloud Infrastructure">FinTech & Cloud Infrastructure</option>
                    <option value="Healthcare & SaaS">Healthcare & SaaS</option>
                    <option value="Developer Tools & SaaS">Developer Tools & SaaS</option>
                    <option value="Web3 & Distributed Systems">Web3 & Distributed Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Team Size (Members)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newProject.teamSize}
                    onChange={(e) => setNewProject({ ...newProject, teamSize: e.target.value })}
                    className="w-full px-3 py-2 text-xs saas-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Required Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={newProject.skillsInput}
                  onChange={(e) => setNewProject({ ...newProject, skillsInput: e.target.value })}
                  className="w-full px-3 py-2 text-xs saas-input"
                  placeholder="React, Node.js, MongoDB, Tailwind CSS"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Duration</label>
                  <input
                    type="number"
                    min="1"
                    value={newProject.duration}
                    onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                    className="w-full px-3 py-2 text-xs saas-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Unit</label>
                  <select
                    value={newProject.durationUnit}
                    onChange={(e) => setNewProject({ ...newProject, durationUnit: e.target.value })}
                    className="w-full px-2 py-2 text-xs saas-input"
                  >
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="days">Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Budget ($)</label>
                  <input
                    type="number"
                    value={newProject.budgetAmount}
                    onChange={(e) => setNewProject({ ...newProject, budgetAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs saas-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-3 border-t border-[#1C1C1F]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="flex-1"
                  disabled={creating}
                  icon={CheckCircle2}
                >
                  {creating ? 'Publishing...' : 'Publish Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
