import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Toast from './components/common/Toast';

// Pages Import
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import SkillProficiencyPage from './pages/SkillProficiencyPage';
import ProjectRequirementsPage from './pages/ProjectRequirementsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import SkillGapAnalysisPage from './pages/SkillGapAnalysisPage';
import TeamRecommendationsPage from './pages/TeamRecommendationsPage';
import TeamRequestsPage from './pages/TeamRequestsPage';
import MyTeamsPage from './pages/MyTeamsPage';
import TeamFormationPage from './pages/TeamFormationPage';
import TeamWorkspacePage from './pages/TeamWorkspacePage';
import AiInsightsPage from './pages/AiInsightsPage';
import NotificationsPage from './pages/NotificationsPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans antialiased selection:bg-indigo-600 selection:text-white">
          <Routes>
            {/* 1. Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Authentication */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* 3. Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* 4. Resume Upload */}
            <Route path="/upload-resume" element={<ResumeUploadPage />} />
            <Route path="/resume-upload" element={<ResumeUploadPage />} />

            {/* 5. AI Resume Analysis */}
            <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />

            {/* 6. Skill Proficiency Dashboard */}
            <Route path="/skill-proficiency" element={<SkillProficiencyPage />} />

            {/* 7. Projects Directory & Details */}
            <Route path="/projects" element={<ProjectRequirementsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />

            {/* 8. Skill Gap Analysis Page */}
            <Route path="/skill-gap" element={<SkillGapAnalysisPage />} />

            {/* 9. AI Team Recommendations */}
            <Route path="/team-recommendations" element={<TeamRecommendationsPage />} />

            {/* 10. Team Requests & Invitations */}
            <Route path="/requests" element={<TeamRequestsPage />} />

            {/* 11. My Teams */}
            <Route path="/teams" element={<MyTeamsPage />} />
            <Route path="/team-formation" element={<TeamFormationPage />} />

            {/* 12. Team Workspace */}
            <Route path="/team-workspace" element={<TeamWorkspacePage />} />

            {/* 13. AI Insights */}
            <Route path="/ai-insights" element={<AiInsightsPage />} />

            {/* 14. Notifications */}
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* 15. User Profile */}
            <Route path="/profile" element={<UserProfilePage />} />

            {/* 16. Settings */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notification Container */}
          <Toast />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

