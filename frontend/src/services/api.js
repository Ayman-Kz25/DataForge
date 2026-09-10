import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the current access token to every request
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

// Automatically refresh an expired access token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh for 401 responses.
    // Never retry the refresh endpoint itself.
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Use axios directly here so the refresh request
        // does not trigger this interceptor again.
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {
            refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        const {
          accessToken,
          refreshToken: newRefreshToken,
        } = response.data.data

        // IMPORTANT:
        // Save BOTH newly generated tokens.
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Retry the original request with the new access token.
        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`

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

  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),
}

export const datasetService = {
  upload: (formData, onProgress) =>
    api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(
            Math.round((e.loaded * 100) / e.total)
          )
        }
      },
    }),

  getAll: () => api.get('/datasets'),

  getById: (id) =>
    api.get(`/datasets/${id}`),

  delete: (id) =>
    api.delete(`/datasets/${id}`),
}

export const processingService = {
  profile: (datasetId) =>
    api.post(`/processing/${datasetId}/profile`),

  validate: (datasetId) =>
    api.post(`/processing/${datasetId}/validate`),

  detectAnomalies: (datasetId) =>
    api.post(`/processing/${datasetId}/anomalies`),

  clean: (datasetId, options) =>
    api.post(`/processing/${datasetId}/clean`, options),

  getResults: (datasetId) =>
    api.get(`/processing/${datasetId}/results`),

  getComparison: (datasetId) =>
    api.get(`/processing/${datasetId}/comparison`),
}

export const insightsService = {
  generate: (datasetId) =>
    api.post(`/insights/${datasetId}/generate`),

  getInsights: (datasetId) =>
    api.get(`/insights/${datasetId}`),
}

export const reportService = {
  generate: (datasetId) =>
    api.post(`/reports/${datasetId}/generate`),

  downloadPdf: (datasetId) =>
    api.get(`/reports/${datasetId}/download/pdf`, {
      responseType: 'blob',
    }),

  downloadExcel: (datasetId) =>
    api.get(`/reports/${datasetId}/download/excel`, {
      responseType: 'blob',
    }),
}

export const adminService = {
  getUsers: () =>
    api.get('/admin/users'),

  updateUserStatus: (userId, isActive) =>
    api.patch(`/admin/users/${userId}/status`, {
      isActive,
    }),

  getStats: () =>
    api.get('/admin/stats'),

  getAlerts: () =>
    api.get('/admin/alerts'),
}

export default api
