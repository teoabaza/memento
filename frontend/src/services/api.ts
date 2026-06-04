import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.teoabaza.com/api',
})

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  async register(email: string, password: string) {
    const res = await api.post('/auth/register', { email, password })
    localStorage.setItem('token', res.data.access_token)
    return res.data
  },

  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.access_token)
    return res.data
  },

  logout() {
    localStorage.removeItem('token')
  },

  isLoggedIn() {
    return !!localStorage.getItem('token')
  }
}

export const entriesService = {
  async getAll() {
    const res = await api.get('/entries')
    return res.data
  },

  async getOne(id: string) {
    const res = await api.get(`/entries/${id}`)
    return res.data
  },

  async create(text: string, imageUrl?: string) {
    const res = await api.post('/entries', { text, imageUrl })
    return res.data
  },

  async update(id: string, text: string, imageUrl?: string) {
    const res = await api.put(`/entries/${id}`, { text, imageUrl })
    return res.data
  },

  async delete(id: string) {
    const res = await api.delete(`/entries/${id}`)
    return res.data
  }
}