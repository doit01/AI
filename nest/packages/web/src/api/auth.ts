import api from '.'

export function login(data: { username: string; password: string }) {
  return api.post('/auth/login', data)
}

export function getProfile() {
  return api.get('/auth/profile')
}
