import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

  async create(text: string, imageUrls: string[] = []) {
    const res = await api.post('/entries', { text, imageUrls })
    return res.data
  },

  async update(id: string, text: string, imageUrls: string[] = [], date?: string) {
    const res = await api.put(`/entries/${id}`, { text, imageUrls, date })
    return res.data
  },

  async delete(id: string) {
    const res = await api.delete(`/entries/${id}`)
    return res.data
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/entries/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.url
  }
}

export const notesService = {
  async getAll() {
    const res = await api.get('/notes')
    return res.data
  },

  async getOne(id: string) {
    const res = await api.get(`/notes/${id}`)
    return res.data
  },

  async create(title: string, content: string) {
    const res = await api.post('/notes', { title, content })
    return res.data
  },

  async update(id: string, title: string, content: string) {
    const res = await api.put(`/notes/${id}`, { title, content })
    return res.data
  },

  async delete(id: string) {
    const res = await api.delete(`/notes/${id}`)
    return res.data
  }
}
