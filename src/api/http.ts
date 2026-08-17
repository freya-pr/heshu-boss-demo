import axios from 'axios'
import { demoHttp, isDemoMode } from '../mock/api'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1', timeout: 10000 })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('scrm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(r => r.data, e => {
  if (e.response?.status === 401) { localStorage.removeItem('scrm_token'); location.href = '/login' }
  return Promise.reject(new Error(e.response?.data?.message || '请求失败，请稍后重试'))
})
const http: any = isDemoMode ? demoHttp : api
export { isDemoMode }
export default http
