import axios from 'axios'

const API_BASE_URL = 'https://nahuelviera.dev/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API endpoints
export const api = {
  posts: {
    getById: (postId) => apiClient.get(`/posts?postId=${postId}`).then(res => res.data.posts[0]),
    getAll: (params) => apiClient.get('/posts', { params }).then(res => res.data),
  },
  classifications: {
    getByPostId: (postId) => apiClient.get(`/classifications/${postId}`).then(res => res.data),
    create: (data) => apiClient.post('/classifications', data).then(res => res.data),
    update: (postId, data) => apiClient.put(`/classifications/${postId}`, data).then(res => res.data),
  },
}
