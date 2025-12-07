import axios from 'axios'

// Use relative URL - Vite proxy handles it in dev, nginx handles it in prod
const API_BASE_URL = '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API endpoints
export const api = {
  categories: {
    getAll: () => apiClient.get('/categories').then(res => res.data),
    getBySlug: (slug) => apiClient.get(`/categories/${slug}`).then(res => res.data),
    create: (data) => apiClient.post('/categories', data).then(res => res.data),
    update: (id, data) => apiClient.put(`/categories/${id}`, data).then(res => res.data),
    delete: (id) => apiClient.delete(`/categories/${id}`).then(res => res.data),
  },
  profiles: {
    getAll: (params) => apiClient.get('/profiles', { params }).then(res => res.data),
    getById: (id) => apiClient.get(`/profiles/${id}`).then(res => res.data),
    getWithReviewStats: (params) => apiClient.get('/profiles/with-review-stats', { params }).then(res => res.data),
    create: (data) => apiClient.post('/profiles', data).then(res => res.data),
    delete: (id) => apiClient.delete(`/profiles/${id}`).then(res => res.data),
  },
  posts: {
    getById: (postId) => apiClient.get(`/posts?postId=${postId}`).then(res => res.data.posts[0]),
    getAll: (params) => apiClient.get('/posts', { params }).then(res => res.data),
    getWithReviewStatus: (params) => apiClient.get('/posts/with-review-status', { params }).then(res => res.data),
  },
  classifications: {
    getByPostId: (postId) => apiClient.get(`/classifications/${postId}`).then(res => res.data),
    create: (data) => apiClient.post('/classifications', data).then(res => res.data),
    update: (postId, data) => apiClient.put(`/classifications/${postId}`, data).then(res => res.data),
  },
  queue: {
    add: (data) => apiClient.post('/queue', data).then(res => res.data),
    getAll: (params) => apiClient.get('/queue', { params }).then(res => res.data),
    remove: (queueId) => apiClient.delete(`/queue/${queueId}`).then(res => res.data),
    clear: (data) => apiClient.post('/queue/clear', data).then(res => res.data),
    clearPending: () => apiClient.delete('/queue/clear-pending').then(res => res.data),
  },
  scrape: {
    trigger: (data) => apiClient.post('/scrape/trigger', data).then(res => res.data),
    getJobs: (params) => apiClient.get('/scrape/jobs', { params }).then(res => res.data),
    getStatus: (jobId) => apiClient.get(`/scrape/status/${jobId}`).then(res => res.data),
  },
}
