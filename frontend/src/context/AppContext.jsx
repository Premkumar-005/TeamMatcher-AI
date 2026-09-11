import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { currentUser as fallbackUser, mockCandidates } from '../data/users';
import { mockProjects } from '../data/projects';
import { initialActiveTeam, initialWorkspaceData } from '../data/teams';
import { initialNotifications } from '../data/notifications';
import api from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme state with local persistence (default: dark)
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('team_matcher_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const setTheme = useCallback((newTheme) => {
    const targetTheme = newTheme === 'light' ? 'light' : 'dark';
    setThemeState(targetTheme);
    try {
      localStorage.setItem('team_matcher_theme', targetTheme);
    } catch (e) {}

    if (targetTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      if (document.body) {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      if (document.body) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      }
    }
  }, []);

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('tm_token') || localStorage.getItem('token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!(localStorage.getItem('tm_token') || localStorage.getItem('token')));
  const [user, setUser] = useState({
    name: 'User',
    email: '',
    role: 'WORKER',
    title: 'Developer',
    bio: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    skills: [],
    extractedSkills: { languages: [], frameworks: [], databases: [], tools: [], softSkills: [] },
    projects: [],
    education: [],
    certifications: []
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Projects Catalog & My Projects State
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Teammate Candidates & Requests/Applications State
  const [candidates, setCandidates] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [projectApplications, setProjectApplications] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  // Active Formed Teams State
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [workspaceData, setWorkspaceData] = useState({ tasks: [], messages: [], files: [], meetings: [] });

  // System Notifications
  const [notifications, setNotifications] = useState([]);

  // Toast Stack
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to ensure user object always has required default structures
  const normalizeUserData = (rawUser) => {
    if (!rawUser) {
      return {
        name: 'User',
        email: '',
        role: 'WORKER',
        title: 'Developer',
        bio: '',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        skills: [],
        extractedSkills: { languages: [], frameworks: [], databases: [], tools: [], softSkills: [] },
        projects: [],
        education: [],
        certifications: []
      };
    }
    return {
      ...rawUser,
      id: rawUser._id || rawUser.id,
      role: rawUser.role || 'WORKER',
      skills: Array.isArray(rawUser.skills)
        ? rawUser.skills.map((s) => ({
            name: typeof s === 'string' ? s : s.name,
            proficiency: typeof s === 'object' && s.proficiency !== undefined ? s.proficiency : s.level || 80,
            level: typeof s === 'object' && s.level !== undefined ? s.level : s.proficiency || 80,
            category: s.category || 'General'
          }))
        : [],
      extractedSkills: rawUser.extractedSkills || { languages: [], frameworks: [], databases: [], tools: [], softSkills: [] },
      education: Array.isArray(rawUser.education) ? rawUser.education : [],
      projects: Array.isArray(rawUser.projects) ? rawUser.projects : [],
      certifications: Array.isArray(rawUser.certifications) ? rawUser.certifications : []
    };
  };

  // Helper to resolve real sender ID and name for chat messages
  const formatChatMessage = useCallback((m, currentUserId, team) => {
    const senderId = (
      m.senderId?._id ||
      m.senderId?.id ||
      (typeof m.senderId === 'string' ? m.senderId : null) ||
      m.sender?._id ||
      m.sender?.id ||
      (typeof m.sender === 'string' && m.sender.length === 24 ? m.sender : null)
    )?.toString();

    // 1. Try to resolve real name from populated sender object or senderId object
    let realName = null;
    if (m.sender && typeof m.sender === 'object' && m.sender.name) {
      realName = m.sender.name;
    } else if (m.senderId && typeof m.senderId === 'object' && m.senderId.name) {
      realName = m.senderId.name;
    } else if (m.senderName && m.senderName !== 'User') {
      realName = m.senderName;
    }

    // 2. If not directly in sender, resolve from team owner or team members
    if (!realName && senderId && team) {
      const ownerId = (team.owner?._id || team.owner?.id || team.owner)?.toString();
      if (ownerId && ownerId === senderId) {
        realName = team.owner?.name;
      }
      if (!realName && Array.isArray(team.members)) {
        const foundMem = team.members.find((mem) => {
          const memId = (mem.user?._id || mem.user?.id || mem.user || mem._id || mem.id)?.toString();
          return memId === senderId;
        });
        if (foundMem) {
          realName = foundMem.user?.name || foundMem.name;
        }
      }
    }

    // 3. Fallback to current user if sender matches
    if (!realName && senderId && currentUserId && senderId === currentUserId) {
      realName = user?.name;
    }

    if (realName) {
      realName = realName.replace(/\s*\(You\)$/i, '').trim();
    } else if (typeof m.sender === 'string' && m.sender && m.sender !== 'User' && m.sender.length !== 24) {
      realName = m.sender.replace(/\s*\(You\)$/i, '').trim();
    } else {
      realName = 'User';
    }

    const isMe = Boolean(
      currentUserId &&
      senderId &&
      currentUserId.toString() === senderId.toString()
    );

    const displayName = isMe ? `${realName} (You)` : realName;

    const timeFormatted =
      m.time ||
      (m.createdAt
        ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    return {
      ...m,
      id: m._id || m.id || `${senderId}-${m.createdAt || Date.now()}`,
      sender: displayName,
      senderId: senderId,
      senderName: realName,
      role: m.role || (m.sender?.role === 'OWNER' ? 'Project Owner' : (m.sender?.title || 'Team Member')),
      time: timeFormatted,
      text: m.text || ''
    };
  }, [user]);

  // Refresh data from backend
  const refreshBackendData = useCallback(async () => {
    try {
      // 1. Fetch Projects
      const projRes = await api.getProjects();
      if (projRes.success && Array.isArray(projRes.data)) {
        const mapped = projRes.data.map((p) => {
          const resolvedOwnerId = (
            p.ownerId?._id ||
            p.ownerId?.id ||
            (typeof p.ownerId === 'string' ? p.ownerId : null) ||
            p.owner?._id ||
            p.owner?.id ||
            (typeof p.owner === 'string' ? p.owner : null)
          )?.toString();

          return {
            ...p,
            id: p._id || p.id,
            ownerId: resolvedOwnerId || p.ownerId || p.owner,
            matchPercentage: p.matchPercentage !== undefined ? p.matchPercentage : 80,
            requiredSkills: (p.requiredSkills || []).map((s) => (typeof s === 'string' ? s : s.name))
          };
        });
        setProjects(mapped);
        if (mapped.length > 0) {
          setSelectedProject((prev) => mapped.find((m) => m.id === (prev?.id || prev?._id)) || mapped[0]);
        } else {
          setSelectedProject(null);
        }
      }

      // 2. Fetch User's Teams
      const teamsRes = await api.getMyTeams();
      if (teamsRes.success && Array.isArray(teamsRes.data)) {
        setTeams(teamsRes.data);
        if (teamsRes.data.length > 0) {
          const currentProjId = (selectedProject?._id || selectedProject?.id)?.toString();
          const targetTeam = (currentProjId
            ? teamsRes.data.find(
                (t) =>
                  (t.project?._id || t.project?.id || t.project)?.toString() ===
                  currentProjId
              )
            : null) || teamsRes.data[0];

          const ownerObj = targetTeam.owner;
          const ownerMember = ownerObj
            ? [{
                id: ownerObj._id || ownerObj,
                _id: ownerObj._id || ownerObj,
                name: `${ownerObj.name || 'Owner'} (Owner)`,
                role: 'Project Owner',
                avatar: ownerObj.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
                status: 'Owner'
              }]
            : [];

          const workerMembers = (targetTeam.members || []).map((m) => ({
            id: m.user?._id || m.user,
            _id: m.user?._id || m.user,
            name: m.user?.name || 'Member',
            role: m.role || 'Specialist',
            avatar: m.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            status: 'Accepted'
          }));

          const allMembers = [...ownerMember, ...workerMembers];

          setActiveTeam({
            ...targetTeam,
            id: targetTeam._id,
            project: targetTeam.project?.title || targetTeam.name,
            overallScore: targetTeam.skillCoverage?.percentage || 85,
            coverage: targetTeam.skillCoverage?.percentage || 100,
            successPrediction: Math.min(100, (targetTeam.skillCoverage?.percentage || 85) + 5),
            members: allMembers,
            workerMembers: workerMembers
          });

          const currentUid = (user?._id || user?.id)?.toString();
          setWorkspaceData({
            tasks: (targetTeam.tasks || []).map((t) => ({ ...t, id: t._id || t.id })),
            messages: (targetTeam.messages || []).map((m) =>
              formatChatMessage(m, currentUid, targetTeam)
            ),
            files: (targetTeam.files || []).map((f) => ({ ...f, id: f._id || f.id }))
          });
        } else {
          setActiveTeam(null);
          setWorkspaceData({ tasks: [], messages: [], files: [] });
        }
      }

      // 3. Fetch User's Notifications
      const notifsRes = await api.getNotifications();
      if (notifsRes.success && Array.isArray(notifsRes.data)) {
        setNotifications(
          notifsRes.data.map((n) => {
            // Map backend notification type to filter categories ('team', 'project', 'ai', 'system')
            let category = 'system';
            if (['APPLICATION_RECEIVED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'PROJECT_CLOSED'].includes(n.type)) {
              category = 'project';
            } else if (['TASK_STARTED', 'TASK_COMPLETED', 'FILE_SHARED', 'TEAM_INVITATION', 'TEAM_JOINED'].includes(n.type)) {
              category = 'team';
            } else if (['AI_UPDATE', 'RESUME_PARSED'].includes(n.type)) {
              category = 'ai';
            }

            return {
              id: n._id || n.id,
              _id: n._id || n.id,
              title: n.title,
              message: n.message,
              read: n.isRead,
              link: n.link || '',
              rawType: n.type,
              relatedProject: n.relatedProject,
              relatedEntity: n.relatedEntity,
              sender: n.sender,
              type: category, // Matches existing UI filter IDs: 'all' | 'team' | 'project' | 'ai' | 'system'
              time: new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          })
        );
      }

      // 4. Fetch Applications if Worker
      const appsRes = await api.getMyApplications();
      if (appsRes.success && Array.isArray(appsRes.data)) {
        setMyApplications(appsRes.data);
      }
    } catch (e) {
      console.warn('Could not sync all backend items live:', e.message);
    }
  }, []);

  // Check auth state on mount using JWT from localStorage
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('tm_token') || localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.data?.user) {
            const normalized = normalizeUserData(res.data.user);
            setUser(normalized);
            setIsAuthenticated(true);
            refreshBackendData();
          } else {
            localStorage.removeItem('tm_token');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.warn('Auth verification failed, clearing session:', error.message);
          localStorage.removeItem('tm_token');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    };

    verifyAuth();
  }, [refreshBackendData]);

  // Keep activeTeam synced with selectedProject whenever selectedProject or teams list changes
  useEffect(() => {
    if (selectedProject && teams.length > 0) {
      const projId = (selectedProject._id || selectedProject.id)?.toString();
      const matchingTeam = teams.find(
        (t) => (t.project?._id || t.project?.id || t.project)?.toString() === projId
      );
      if (matchingTeam) {
        const ownerObj = matchingTeam.owner;
        const ownerMember = ownerObj
          ? [{
              id: ownerObj._id || ownerObj,
              _id: ownerObj._id || ownerObj,
              name: `${ownerObj.name || 'Owner'} (Owner)`,
              role: 'Project Owner',
              avatar: ownerObj.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
              status: 'Owner'
            }]
          : [];

        const workerMembers = (matchingTeam.members || []).map((m) => ({
          id: m.user?._id || m.user,
          _id: m.user?._id || m.user,
          name: m.user?.name || 'Member',
          role: m.role || 'Specialist',
          avatar: m.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          status: 'Accepted'
        }));

        setActiveTeam({
          ...matchingTeam,
          id: matchingTeam._id,
          project: matchingTeam.project?.title || matchingTeam.name,
          overallScore: matchingTeam.skillCoverage?.percentage || 85,
          coverage: matchingTeam.skillCoverage?.percentage || 100,
          successPrediction: Math.min(100, (matchingTeam.skillCoverage?.percentage || 85) + 5),
          members: [...ownerMember, ...workerMembers],
          workerMembers: workerMembers
        });

        const currentUid = (user?._id || user?.id)?.toString();
        setWorkspaceData({
          tasks: (matchingTeam.tasks || []).map((t) => ({ ...t, id: t._id || t.id })),
          messages: (matchingTeam.messages || []).map((m) =>
            formatChatMessage(m, currentUid, matchingTeam)
          ),
          files: (matchingTeam.files || []).map((f) => ({ ...f, id: f._id || f.id }))
        });
      }
    }
  }, [selectedProject, teams, user, formatChatMessage]);

  // Login handler
  const loginUser = async (credentials) => {
    try {
      const res = await api.login(credentials);
      if (res.success && res.data?.token) {
        const receivedToken = res.data.token;
        localStorage.setItem('tm_token', receivedToken);
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        const normalized = normalizeUserData(res.data.user);
        setUser(normalized);
        setIsAuthenticated(true);
        addToast('Welcome Back! 👋', `Signed in as ${normalized.name} (${normalized.role})`, 'success');
        refreshBackendData();
        return { success: true, user: normalized };
      }
      throw new Error(res.message || 'Login failed');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      addToast('Login Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Register handler (with explicit role)
  const registerUser = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.success && res.data?.token) {
        const receivedToken = res.data.token;
        localStorage.setItem('tm_token', receivedToken);
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        const normalized = normalizeUserData(res.data.user);
        setUser(normalized);
        setIsAuthenticated(true);
        addToast('Account Created! 🎉', `Registered as ${normalized.role}`, 'success');
        refreshBackendData();
        return { success: true, user: normalized };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      addToast('Registration Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logoutUser = () => {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('token');
    setToken('');
    setIsAuthenticated(false);
    setUser(normalizeUserData(null));
    setProjects([]);
    setMyProjects([]);
    setSelectedProject(null);
    setMyApplications([]);
    setProjectApplications([]);
    setTeams([]);
    setActiveTeam(null);
    setWorkspaceData({ tasks: [], messages: [], files: [] });
    setNotifications([]);
    addToast('Logged Out', 'You have been signed out safely.', 'info');
  };

  // Update Profile
  const updateUserProfile = async (updatedProfile) => {
    try {
      const res = await api.updateUserProfile(updatedProfile);
      if (res.success && res.data?.user) {
        const normalized = normalizeUserData(res.data.user);
        setUser(normalized);
        addToast('Profile Saved', 'Your profile details have been successfully updated.', 'success');
        return { success: true, user: normalized };
      }
    } catch (error) {
      setUser((prev) => ({ ...prev, ...updatedProfile }));
      const msg = error.response?.data?.message || 'Profile saved locally.';
      addToast('Profile Updated', msg, 'info');
    }
  };

  // Update Skills
  const updateUserSkills = async (newSkills) => {
    try {
      const formatted = newSkills.map((s) => ({
        name: s.name,
        proficiency: s.proficiency !== undefined ? s.proficiency : s.level || 80,
        level: s.level !== undefined ? s.level : s.proficiency || 80,
        category: s.category || 'General'
      }));

      const res = await api.updateUserSkills(formatted);
      if (res.success) {
        setUser((prev) => ({
          ...prev,
          skills: formatted,
          profileCompletion: res.data?.profileCompletion || prev.profileCompletion
        }));
        addToast('Skills Updated', 'Your skill proficiency metrics have been updated.', 'success');
        return { success: true };
      }
    } catch (error) {
      setUser((prev) => ({ ...prev, skills: newSkills }));
      const msg = error.response?.data?.message || 'Skills updated locally.';
      addToast('Skills Updated', msg, 'info');
    }
  };

  // Change Password
  const changeUserPassword = async (passwordData) => {
    try {
      const res = await api.changePassword(passwordData);
      if (res.success) {
        addToast('Password Updated', 'Your password has been changed successfully.', 'success');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Password update failed.';
      addToast('Error', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Create Project (Owner)
  const createNewProject = async (projectData) => {
    try {
      const res = await api.createProject(projectData);
      if (res.success && res.data?.project) {
        addToast('Project Published! 🚀', `"${res.data.project.title}" is now open for worker applications.`, 'success');
        refreshBackendData();
        return { success: true, project: res.data.project };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create project.';
      addToast('Project Creation Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Apply to Project (Worker)
  const applyToProjectAction = async (projectId, coverMessage = '') => {
    try {
      const res = await api.applyToProject(projectId, coverMessage);
      if (res.success) {
        addToast('Application Submitted! 🎯', 'Your application has been sent to the Project Owner.', 'success');
        refreshBackendData();
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit application.';
      addToast('Application Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Accept Worker Application (Owner)
  const acceptWorkerApplication = async (applicationId, role = '') => {
    try {
      const res = await api.acceptApplication(applicationId, role);
      if (res.success) {
        addToast('Worker Accepted 🎉', 'The candidate has been added to your Project Team.', 'success');
        refreshBackendData();
        return { success: true, team: res.data?.team };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to accept application.';
      addToast('Action Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Reject Worker Application (Owner)
  const rejectWorkerApplication = async (applicationId) => {
    try {
      const res = await api.rejectApplication(applicationId);
      if (res.success) {
        addToast('Application Rejected', 'Application status updated.', 'info');
        refreshBackendData();
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reject application.';
      addToast('Action Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Accept Team Invite (Worker)
  const acceptTeamInviteAction = async (teamId, notificationId = null) => {
    try {
      const res = await api.acceptTeamInvite(teamId);
      if (res.success) {
        if (notificationId) {
          try {
            await api.markNotificationAsRead(notificationId);
          } catch (e) {}
          setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
          );
        }
        addToast('Team Joined! 🎉', 'You have accepted the invitation and joined the team workspace.', 'success');
        await refreshBackendData();
        return { success: true, team: res.data?.team };
      }
      throw new Error(res.message || 'Failed to accept invitation');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to accept team invitation.';
      addToast('Action Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Upload Resume (Worker)
  const uploadWorkerResume = async (file) => {
    try {
      const res = await api.uploadResume(file);
      if (res.success) {
        setUser((prev) => ({
          ...prev,
          resume: res.data?.resume,
          resumeStatus: res.data?.resumeStatus || 'UPLOADED',
          resumeScore: 0,
          profileCompletion: res.data?.profileCompletion || prev.profileCompletion
        }));
        addToast('Resume Uploaded! 📄', 'Resume saved securely. Status set to UPLOADED.', 'success');
        return { success: true, data: res.data };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to upload resume.';
      addToast('Upload Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
    } catch (e) {
      // Optimistic fallback
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
    } catch (e) {
      // Optimistic fallback
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Workspace Actions
  const addTask = async (title, assigneeId = null) => {
    if (!title.trim()) return;

    if (activeTeam?._id) {
      try {
        const payload = { title: title.trim(), status: 'To Do' };
        if (assigneeId) payload.assignee = assigneeId;
        const res = await api.createTeamTask(activeTeam._id, payload);
        if (res.success && res.data) {
          const newTask = {
            ...res.data,
            id: res.data._id || res.data.id
          };
          setWorkspaceData((prev) => ({
            ...prev,
            tasks: [...prev.tasks, newTask]
          }));
          addToast('Task Created', `Added "${title}" to task board.`, 'success');
          return { success: true, task: newTask };
        }
      } catch (e) {
        console.error('Error creating task:', e);
        const msg = e.response?.data?.message || 'Failed to create task';
        addToast('Task Creation Failed', msg, 'error');
        return { success: false, message: msg };
      }
    }
  };

  const moveTask = async (taskId, newStatus, assigneeId) => {
    if (!activeTeam?._id) return;

    // Optimistically update local workspace state
    setWorkspaceData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId || t._id === taskId) {
          const updated = { ...t, status: newStatus };
          if (assigneeId !== undefined) {
            updated.assignee = assigneeId;
          }
          return updated;
        }
        return t;
      })
    }));

    try {
      const payload = { status: newStatus };
      if (assigneeId !== undefined) payload.assignee = assigneeId;
      const res = await api.updateTeamTask(activeTeam._id, taskId, payload);
      if (res.success && res.data) {
        const updatedTask = { ...res.data, id: res.data._id || res.data.id };
        setWorkspaceData((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            (t.id === taskId || t._id === taskId) ? updatedTask : t
          )
        }));
      }
    } catch (e) {
      console.error('Error updating task status:', e);
      addToast('Task Update Failed', e.response?.data?.message || 'Failed to update task', 'error');
      refreshBackendData();
    }
  };

  const assignTask = async (taskId, assigneeId) => {
    if (!activeTeam?._id) return;

    try {
      const payload = { assignee: assigneeId || null };
      const res = await api.updateTeamTask(activeTeam._id, taskId, payload);
      if (res.success && res.data) {
        const updatedTask = { ...res.data, id: res.data._id || res.data.id };
        setWorkspaceData((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            (t.id === taskId || t._id === taskId) ? updatedTask : t
          )
        }));
        addToast('Task Assigned', 'Task assigned successfully.', 'success');
      }
    } catch (e) {
      console.error('Error assigning task:', e);
      addToast('Assign Failed', e.response?.data?.message || 'Failed to assign task', 'error');
    }
  };

  const addChatMessage = async (text) => {
    if (!text.trim()) return;
    const currentUserId = (user?.id || user?._id)?.toString();
    const tempId = `temp-${Date.now()}`;
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: tempId,
      sender: `${user.name || 'User'} (You)`,
      senderId: currentUserId,
      senderName: user.name || 'User',
      role: user.role === 'OWNER' ? 'Project Owner' : (user.title || 'Team Member'),
      text: text.trim(),
      time: formattedTime
    };
    setWorkspaceData((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg]
    }));

    if (activeTeam?._id) {
      try {
        const res = await api.sendTeamMessage(activeTeam._id, text.trim());
        if (res.success && res.data) {
          const serverMsg = res.data;
          setWorkspaceData((prev) => ({
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === tempId
                ? formatChatMessage(serverMsg, currentUserId, activeTeam)
                : m
            )
          }));
        }
      } catch (e) {
        console.warn('Message saved locally:', e.message);
      }
    }
  };

  const uploadWorkspaceFile = async (file) => {
    if (!activeTeam?._id) {
      addToast('No Team', 'No active team workspace found.', 'error');
      return { success: false };
    }
    if (!file) {
      addToast('No File', 'Please select a file to upload.', 'error');
      return { success: false };
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.uploadTeamFile(activeTeam._id, formData);
      if (res.success && res.data) {
        const newFile = { ...res.data, id: res.data._id || res.data.id };
        setWorkspaceData((prev) => ({
          ...prev,
          files: [newFile, ...prev.files]
        }));
        addToast('File Shared ✅', `"${res.data.name}" uploaded to team workspace.`, 'success');
        return { success: true, file: newFile };
      }
      throw new Error(res.message || 'Upload failed');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'File upload failed.';
      addToast('Upload Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  const downloadWorkspaceFile = async (fileId, fileName) => {
    if (!activeTeam?._id) {
      addToast('No Team', 'No active team workspace found.', 'error');
      return { success: false };
    }
    try {
      await api.downloadTeamFile(activeTeam._id, fileId, fileName);
      return { success: true };
    } catch (e) {
      const msg = e.message || 'File download failed.';
      addToast('Download Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Delete Project (Owner only)
  const deleteProject = async (projectId) => {
    try {
      const res = await api.deleteProject(projectId);
      if (res.success) {
        // Remove from both the global catalog and the owner's my-projects list
        setProjects((prev) => prev.filter((p) => (p._id || p.id) !== projectId));
        setMyProjects((prev) => prev.filter((p) => (p._id || p.id) !== projectId));
        addToast('Project Deleted 🗑️', 'Project and all associated data have been removed.', 'success');
        return { success: true };
      }
      throw new Error(res.message || 'Delete failed');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Failed to delete project.';
      addToast('Delete Failed', msg, 'error');
      return { success: false, message: msg };
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        token,
        isAuthenticated,
        setIsAuthenticated,
        authLoading,
        user,
        setUser,
        loginUser,
        registerUser,
        logoutUser,
        updateUserProfile,
        updateUserSkills,
        changeUserPassword,
        createNewProject,
        applyToProjectAction,
        acceptWorkerApplication,
        rejectWorkerApplication,
        acceptTeamInviteAction,
        uploadWorkerResume,
        projects,
        setProjects,
        myProjects,
        selectedProject,
        setSelectedProject,
        candidates,
        myApplications,
        projectApplications,
        sentRequests,
        receivedRequests,
        teams,
        activeTeam,
        setActiveTeam,
        workspaceData,
        addTask,
        moveTask,
        assignTask,
        addChatMessage,
        uploadWorkspaceFile,
        downloadWorkspaceFile,
        deleteProject,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshBackendData,
        toasts,
        addToast,
        removeToast,
        theme,
        setTheme,
        toggleTheme
      }}
    >
      <div className={theme}>{children}</div>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export default AppContext;
