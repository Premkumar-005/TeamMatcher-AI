import React, { useState } from 'react';
import { Sparkles, Filter, UserCheck, ArrowUpDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardLayout from '../components/common/DashboardLayout';
import TeammateCard from '../components/ui/TeammateCard';
import EmptyState from '../components/ui/EmptyState';

export default function TeamRecommendationsPage() {
  const { candidates, sentRequests, sendTeammateRequest, selectedProject } = useApp();

  const [minCompatibility, setMinCompatibility] = useState(80);
  const [selectedRole, setSelectedRole] = useState('All');
  const [sortBy, setSortBy] = useState('compatibility');

  const roleOptions = ['All', 'AI / ML Engineer', 'Backend Specialist', 'Full Stack & Database Lead', 'UI/UX & Product Designer'];

  const filteredCandidates = candidates
    .filter((c) => {
      const matchScore = c.compatibility >= minCompatibility;
      const matchRole = selectedRole === 'All' || c.role === selectedRole;
      return matchScore && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === 'compatibility') return b.compatibility - a.compatibility;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <DashboardLayout title="Teammate Recommendations">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1F] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium mb-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Vector Synergy Matching</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Recommended Teammates
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Matched to fill project skill gaps for{' '}
            <span className="text-indigo-400 font-medium">{selectedProject ? selectedProject.title : 'AI Attendance System'}</span>
          </p>
        </div>

        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 w-fit">
          {filteredCandidates.length} Matched Candidates
        </span>
      </div>

      {/* Filter & Sort Controls */}
      <div className="bg-[#0B0B0B] border border-[#1C1C1F] p-3.5 sm:p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#71717A] font-medium">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-2.5 py-1.5 saas-input text-xs"
            >
              {roleOptions.map((r) => (
                <option key={r} value={r} className="bg-[#0B0B0B]">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#71717A] font-medium">
            <span>Min Compatibility:</span>
            <select
              value={minCompatibility}
              onChange={(e) => setMinCompatibility(Number(e.target.value))}
              className="px-2.5 py-1.5 saas-input text-xs"
            >
              <option value={70} className="bg-[#0B0B0B]">70% +</option>
              <option value={80} className="bg-[#0B0B0B]">80% +</option>
              <option value={90} className="bg-[#0B0B0B]">90% + (Top Fits)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#71717A] font-medium w-full md:w-auto justify-end">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#71717A]" />
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 saas-input text-xs"
          >
            <option value="compatibility" className="bg-[#0B0B0B]">Compatibility Score</option>
            <option value="name" className="bg-[#0B0B0B]">Candidate Name</option>
          </select>
        </div>
      </div>

      {/* Candidate Teammate Cards Grid */}
      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredCandidates.map((candidate) => {
            const isRequested = sentRequests.some((r) => r.candidateId === candidate.id);
            return (
              <TeammateCard
                key={candidate.id}
                candidate={candidate}
                onSendRequest={sendTeammateRequest}
                isRequested={isRequested}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={UserCheck}
          title="No Matching Candidates Found"
          description="No candidates match your current compatibility threshold or role filter."
          actionLabel="Reset Filters"
          onAction={() => {
            setMinCompatibility(70);
            setSelectedRole('All');
          }}
        />
      )}
    </DashboardLayout>
  );
}
