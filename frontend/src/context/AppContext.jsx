import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { currentUser as fallbackUser, mockCandidates } from '../data/users';
import { mockProjects } from '../data/projects';
import { initialActiveTeam, initialWorkspaceData } from '../data/teams';
import { initialNotifications } from '../data/notifications';
import api from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState('dark');

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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

  // Refresh data from backend
  const refreshBackendData = useCallback(async () => {
    try {
      // 1. Fetch Projects
      const projRes = await api.getProjects();
      if (projRes.success && Array.isArray(projRes.data)) {
        const mapped = projRes.data.map((p) => ({
          ...p,
          id: p._id || p.id,
          matchPercentage: p.matchPercentage !== undefined ? p.matchPercentage : 80,
          requiredSkills: (p.requiredSkills || []).map((s) => (typeof s === 'string' ? s : s.name))
        }));
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
          const firstTeam = teamsRes.data[0];
          const ownerObj = firstTeam.owner;
          const ownerMember = ownerObj
            ? [{
                id: ownerObj._id || ownerObj,
                name: `${ownerObj.name || 'Owner'} (Owner)`,
                role: 'Project Owner',
                avatar: ownerObj.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
                status: 'Owner'
              }]
            : [];

          const workerMembers = (firstTeam.members || []).map((m) => ({
            id: m.user?._id || m.user,
            name: m.user?.name || 'Member',
            role: m.role || 'Specialist',
            avatar: m.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            status: 'Accepted'
          }));

          const allMembers = [...ownerMember, ...workerMembers];

          setActiveTeam({
            ...firstTeam,
            id: firstTeam._id,
            project: firstTeam.project?.title || firstTeam.name,
            overallScore: firstTeam.skillCoverage?.percentage || 85,
            coverage: firstTeam.skillCoverage?.percentage || 100,
            successPrediction: Math.min(100, (firstTeam.skillCoverage?.percentage || 85) + 5),
            members: allMembers
          });

          setWorkspaceData({
            tasks: (firstTeam.tasks || []).map((t) => ({ ...t, id: t._id || t.id })),
            messages: (firstTeam.messages || []).map((m) => ({
              ...m,
              id: m._id || m.id,
              sender: m.sender?.name || 'User',
              role: m.sender?.role || 'Team Member'
            })),
            files: (firstTeam.files || []).map((f) => ({ ...f, id: f._id || f.id }))
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
          notifsRes.data.map((n) => ({
            id: n._id,
            title: n.title,
            message: n.message,
            read: n.isRead,
            time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: n.type
          }))
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
  const addTask = async (title) => {
    if (!title.trim()) return;
    const newTask = {
      id: `t-${Date.now()}`,
      title: title.trim(),
      status: 'To Do',
      assignee: user.name
    };
    setWorkspaceData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));

    if (activeTeam?._id) {
      try {
        await api.createTeamTask(activeTeam._id, { title: title.trim(), status: 'To Do' });
      } catch (e) {
        console.warn('Task saved locally:', e.message);
      }
    }
    addToast('Task Created', `Added "${title}" to task board.`, 'success');
  };

  const moveTask = (id, newStatus) => {
    setWorkspaceData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    }));
  };

  const addChatMessage = async (text) => {
    if (!text.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: `${user.name} (You)`,
      role: user.role === 'OWNER' ? 'Project Owner' : (user.title || 'Team Member'),
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWorkspaceData((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg]
    }));

    if (activeTeam?._id) {
      try {
        await api.sendTeamMessage(activeTeam._id, text.trim());
      } catch (e) {
        console.warn('Message saved locally:', e.message);
      }
    }
  };

  const uploadWorkspaceFile = (fileName, fileSize = '2.4 MB') => {
    const newFile = {
      name: fileName,
      size: fileSize,
      author: `${user.name} (You)`,
      date: 'Just now'
    };
    setWorkspaceData((prev) => ({
      ...prev,
      files: [newFile, ...prev.files]
    }));
    addToast('File Shared', `Uploaded ${fileName} to team workspace.`, 'success');
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
        addChatMessage,
        uploadWorkspaceFile,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshBackendData,
        toasts,
        addToast,
        removeToast
      }}
    >
      <div className={theme}>{children}</div>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export default AppContext;
