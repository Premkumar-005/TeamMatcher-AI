import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Attach Authorization Bearer token from localStorage to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tm_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request - session may be expired');
    }
    return Promise.reject(error);
  }
);

export const api = {
  // =================== AUTHENTICATION ===================
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // =================== USER PROFILE & WORKERS ===================
  getUserProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateUserProfile: async (profileData) => {
    const response = await apiClient.put('/users/me', profileData);
    return response.data;
  },

  updateUserSkills: async (skills) => {
    const response = await apiClient.put('/users/me/skills', { skills });
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.put('/users/me/password', passwordData);
    return response.data;
  },

  getWorkers: async (params = {}) => {
    const response = await apiClient.get('/users/workers', { params });
    return response.data;
  },

  // =================== PROJECTS ===================
  getProjects: async (params = {}) => {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  getRecommendedProjects: async () => {
    const response = await apiClient.get('/projects/recommended');
    return response.data;
  },

  getMyProjects: async () => {
    const response = await apiClient.get('/projects/my');
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  getProjectMatch: async (projectId) => {
    const response = await apiClient.get(`/projects/${projectId}/match`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await apiClient.put(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  updateProjectStatus: async (id, status) => {
    const response = await apiClient.put(`/projects/${id}/status`, { status });
    return response.data;
  },

  // =================== APPLICATIONS ===================
  applyToProject: async (projectId, coverMessage = '') => {
    const response = await apiClient.post(`/projects/${projectId}/apply`, { coverMessage });
    return response.data;
  },

  getMyApplications: async () => {
    const response = await apiClient.get('/applications/my');
    return response.data;
  },

  getProjectApplications: async (projectId) => {
    const response = await apiClient.get(`/projects/${projectId}/applications`);
    return response.data;
  },

  withdrawApplication: async (applicationId) => {
    const response = await apiClient.put(`/applications/${applicationId}/withdraw`);
    return response.data;
  },

  acceptApplication: async (applicationId, role = '') => {
    const response = await apiClient.put(`/applications/${applicationId}/accept`, { role });
    return response.data;
  },

  rejectApplication: async (applicationId) => {
    const response = await apiClient.put(`/applications/${applicationId}/reject`);
    return response.data;
  },

  // =================== TEAMS ===================
  getMyTeams: async () => {
    const response = await apiClient.get('/teams/my');
    return response.data;
  },

  getTeamById: async (id) => {
    const response = await apiClient.get(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (teamData) => {
    const response = await apiClient.post('/teams', teamData);
    return response.data;
  },

  updateTeam: async (id, teamData) => {
    const response = await apiClient.put(`/teams/${id}`, teamData);
    return response.data;
  },

  deleteTeam: async (id) => {
    const response = await apiClient.delete(`/teams/${id}`);
    return response.data;
  },

  updateMemberRole: async (teamId, userId, role) => {
    const response = await apiClient.put(`/teams/${teamId}/members/${userId}/role`, { role });
    return response.data;
  },

  removeTeamMember: async (teamId, userId) => {
    const response = await apiClient.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  },

  leaveTeam: async (teamId) => {
    const response = await apiClient.put(`/teams/${teamId}/leave`);
    return response.data;
  },

  acceptTeamInvite: async (teamId) => {
    const response = await apiClient.put(`/teams/${teamId}/accept-invite`);
    return response.data;
  },

  // =================== WORKSPACE ===================
  getTeamTasks: async (teamId) => {
    const response = await apiClient.get(`/teams/${teamId}/tasks`);
    return response.data;
  },

  createTeamTask: async (teamId, taskData) => {
    const response = await apiClient.post(`/teams/${teamId}/tasks`, taskData);
    return response.data;
  },

  updateTeamTask: async (teamId, taskId, taskData) => {
    const response = await apiClient.put(`/teams/${teamId}/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTeamTask: async (teamId, taskId) => {
    const response = await apiClient.delete(`/teams/${teamId}/tasks/${taskId}`);
    return response.data;
  },

  getTeamMessages: async (teamId) => {
    const response = await apiClient.get(`/teams/${teamId}/messages`);
    return response.data;
  },

  sendTeamMessage: async (teamId, text) => {
    const response = await apiClient.post(`/teams/${teamId}/messages`, { text });
    return response.data;
  },

  getTeamFiles: async (teamId) => {
    const response = await apiClient.get(`/teams/${teamId}/files`);
    return response.data;
  },

  uploadTeamFile: async (teamId, formData) => {
    const response = await apiClient.post(`/teams/${teamId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  downloadTeamFile: async (teamId, fileId, fileName) => {
    const token = localStorage.getItem('tm_token') || localStorage.getItem('token');
    const url = `${API_BASE_URL}/teams/${teamId}/files/${fileId}/download`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return { success: true };
  },

  // =================== NOTIFICATIONS ===================
  getNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  markNotificationAsRead: async (id) => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },

  // =================== RESUME UPLOAD ===================
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await apiClient.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getResumeDetails: async () => {
    const response = await apiClient.get('/resume/me');
    return response.data;
  }
};

export default api;
