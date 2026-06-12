import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/auth'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authApi = {
  register: (data: { username: string; email: string; password: string; first_name: string; last_name: string }) =>
    api.post('/auth/register', data),
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
}

// Users
export const usersApi = {
  getMe: () => api.get('/users/me'),
  getUser: (id: number) => api.get(`/users/${id}`),
  searchUsers: (q: string) => api.get('/users/search', { params: { q, limit: 20 } }),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/me/profile', data),
  uploadAvatar: (file: File) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  uploadBanner: (file: File) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('/users/me/banner', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  uploadResume: (file: File) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('/users/me/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getStats: (id: number) => api.get(`/users/${id}/stats`),
  getExperiences: (id: number) => api.get(`/users/${id}/experiences`),
  addExperience: (data: Record<string, unknown>) => api.post('/users/me/experiences', data),
  updateExperience: (id: number, data: Record<string, unknown>) => api.put(`/users/me/experiences/${id}`, data),
  deleteExperience: (id: number) => api.delete(`/users/me/experiences/${id}`),
  getEducations: (id: number) => api.get(`/users/${id}/educations`),
  addEducation: (data: Record<string, unknown>) => api.post('/users/me/educations', data),
  updateEducation: (id: number, data: Record<string, unknown>) => api.put(`/users/me/educations/${id}`, data),
  deleteEducation: (id: number) => api.delete(`/users/me/educations/${id}`),
  getSkills: (id: number) => api.get(`/users/${id}/skills`),
  addSkill: (name: string) => api.post('/users/me/skills', null, { params: { name } }),
  removeSkill: (id: number) => api.delete(`/users/me/skills/${id}`),
  endorseSkill: (id: number) => api.post(`/users/me/skills/${id}/endorse`),
  getCertifications: (id: number) => api.get(`/users/${id}/certifications`),
  addCertification: (data: Record<string, unknown>) => api.post('/users/me/certifications', data),
  updateCertification: (id: number, data: Record<string, unknown>) => api.put(`/users/me/certifications/${id}`, data),
  deleteCertification: (id: number) => api.delete(`/users/me/certifications/${id}`),
  getProjects: (id: number) => api.get(`/users/${id}/projects`),
  addProject: (data: Record<string, unknown>) => api.post('/users/me/projects', data),
  updateProject: (id: number, data: Record<string, unknown>) => api.put(`/users/me/projects/${id}`, data),
  deleteProject: (id: number) => api.delete(`/users/me/projects/${id}`),
  getRecommendations: (id: number) => api.get(`/users/${id}/recommendations`),
  addRecommendation: (data: Record<string, unknown>) => api.post('/users/me/recommendations', data),
}

// Posts
export const postsApi = {
  getFeed: (skip = 0, limit = 20) => api.get('/posts/feed', { params: { skip, limit } }),
  createPost: (formData: FormData) =>
    api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPost: (id: number) => api.get(`/posts/${id}`),
  deletePost: (id: number) => api.delete(`/posts/${id}`),
  likePost: (id: number, reaction = 'like') => api.post(`/posts/${id}/like`, { reaction }),
  getComments: (postId: number) => api.get(`/posts/${postId}/comments`),
  addComment: (postId: number, content: string, parent_id?: number) =>
    api.post(`/posts/${postId}/comments`, { content, parent_id }),
  deleteComment: (postId: number, commentId: number) =>
    api.delete(`/posts/${postId}/comments/${commentId}`),
  repost: (id: number, comment?: string) => api.post(`/posts/${id}/repost`, null, { params: { comment } }),
  getUserPosts: (userId: number, skip = 0) => api.get(`/posts/user/${userId}`, { params: { skip } }),
}

// Connections
export const connectionsApi = {
  sendRequest: (userId: number, message?: string) =>
    api.post(`/connections/request/${userId}`, null, { params: { message } }),
  accept: (id: number) => api.post(`/connections/${id}/accept`),
  reject: (id: number) => api.post(`/connections/${id}/reject`),
  remove: (id: number) => api.delete(`/connections/${id}`),
  getIncoming: () => api.get('/connections/pending/incoming'),
  getSent: () => api.get('/connections/pending/sent'),
  getMyConnections: () => api.get('/connections/my'),
  getSuggestions: () => api.get('/connections/suggestions'),
  follow: (userId: number) => api.post(`/connections/follow/${userId}`),
  getFollowers: (userId: number) => api.get(`/connections/followers/${userId}`),
  getFollowing: (userId: number) => api.get(`/connections/following/${userId}`),
}

// Notifications
export const notificationsApi = {
  getAll: (params?: { unread_only?: boolean }) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
}

// Companies
export const companiesApi = {
  list: (q?: string) => api.get('/companies', { params: { q } }),
  get: (id: number) => api.get(`/companies/${id}`),
  create: (data: Record<string, unknown>) => api.post('/companies', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/companies/${id}`, data),
}

// Jobs
export const jobsApi = {
  list: (params?: Record<string, unknown>) => api.get('/jobs', { params }),
  get: (id: number) => api.get(`/jobs/${id}`),
  create: (data: Record<string, unknown>) => api.post('/jobs', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/jobs/${id}`, data),
  delete: (id: number) => api.delete(`/jobs/${id}`),
  save: (id: number) => api.post(`/jobs/${id}/save`),
  getSaved: () => api.get('/jobs/saved/list'),
  apply: (id: number, formData: FormData) =>
    api.post(`/jobs/${id}/apply`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyApplications: () => api.get('/jobs/applications/my'),
  getApplicants: (jobId: number) => api.get(`/jobs/${jobId}/applicants`),
  updateApplicationStatus: (appId: number, status: string) =>
    api.put(`/jobs/applications/${appId}/status`, null, { params: { status } }),
  addCandidateNote: (appId: number, note: string) =>
    api.post(`/jobs/applications/${appId}/notes`, { note }),
  scheduleInterview: (appId: number, data: Record<string, unknown>) =>
    api.post(`/jobs/applications/${appId}/interviews`, data),
  getPostedJobs: () => api.get('/jobs/recruiter/posted'),
}

// Messages
export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),
  createConversation: (recipientId: number) =>
    api.post('/messages/conversations', null, { params: { recipient_id: recipientId } }),
  getMessages: (convId: number, skip = 0) =>
    api.get(`/messages/conversations/${convId}`, { params: { skip } }),
  sendMessage: (convId: number, content: string, attachment?: File) => {
    const fd = new FormData()
    if (content) fd.append('content', content)
    if (attachment) fd.append('attachment', attachment)
    return api.post(`/messages/conversations/${convId}/send`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  deleteMessage: (id: number) => api.delete(`/messages/messages/${id}`),
}

// Courses
export const coursesApi = {
  list: (params?: Record<string, unknown>) => api.get('/courses', { params }),
  get: (id: number) => api.get(`/courses/${id}`),
  start: (id: number) => api.post(`/courses/${id}/start`),
  completeLesson: (courseId: number, lessonId: number) =>
    api.post(`/courses/${courseId}/complete-lesson/${lessonId}`),
  getEnrolled: () => api.get('/courses/my/enrolled'),
}

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  listUsers: () => api.get('/admin/users'),
  updateRole: (userId: number, role: string) =>
    api.put(`/admin/users/${userId}/role`, null, { params: { role } }),
  toggleActive: (userId: number) => api.put(`/admin/users/${userId}/toggle-active`),
  listReports: () => api.get('/admin/reports'),
  updateReportStatus: (id: number, status: string) =>
    api.put(`/admin/reports/${id}/status`, null, { params: { status } }),
  deleteJob: (id: number) => api.delete(`/admin/jobs/${id}`),
  deletePost: (id: number) => api.delete(`/admin/posts/${id}`),
}
