import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        )
        localStorage.setItem('accessToken', data.data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
}

export const datasetService = {
  upload: (formData, onProgress) => api.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  }),
  getAll: () => api.get('/datasets'),
  getById: (id) => api.get(`/datasets/${id}`),
  delete: (id) => api.delete(`/datasets/${id}`),
}

export const processingService = {
  profile: (datasetId) => api.post(`/processing/${datasetId}/profile`),
  validate: (datasetId) => api.post(`/processing/${datasetId}/validate`),
  detectAnomalies: (datasetId) => api.post(`/processing/${datasetId}/anomalies`),
  clean: (datasetId, options) => api.post(`/processing/${datasetId}/clean`, options),
  getResults: (datasetId) => api.get(`/processing/${datasetId}/results`),
  getComparison: (datasetId) => api.get(`/processing/${datasetId}/comparison`),
}

export const insightsService = {
  generate: (datasetId) => api.post(`/insights/${datasetId}/generate`),
  getInsights: (datasetId) => api.get(`/insights/${datasetId}`),
}

export const reportService = {
  generate: (datasetId) => api.post(`/reports/${datasetId}/generate`),
  downloadPdf: (datasetId) => api.get(`/reports/${datasetId}/download/pdf`, { responseType: 'blob' }),
  downloadExcel: (datasetId) => api.get(`/reports/${datasetId}/download/excel`, { responseType: 'blob' }),
}

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (userId, isActive) => api.patch(`/admin/users/${userId}/status`, { isActive }),
  getStats: () => api.get('/admin/stats'),
  getAlerts: () => api.get('/admin/alerts'),
}

export default api
