import api from '@/common/axios'

export async function get(url, params = {}) {
  const response = await api.get(url, { params })
  return response.data
}

export async function post(url, data = {}) {
  const response = await api.post(url, data)
  return response.data
}

export async function put(url, data = {}) {
  const response = await api.put(url, data)
  return response.data
}

export async function del(url) {
  const response = await api.delete(url)
  return response.data
}
