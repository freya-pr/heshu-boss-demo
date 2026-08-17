import { defineStore } from 'pinia'
import http from '../api/http'
export interface MenuItem { name: string; path?: string; code?: string; children?: MenuItem[] }
export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as null | {username:string;displayName:string;role:string}, menus: [] as MenuItem[] }),
  actions: {
    async login(username:string,password:string) {
      const res:any = await http.post('/auth/login',{username,password})
      localStorage.setItem('scrm_token',res.data.accessToken)
      this.user = res.data.user
      await this.loadMe()
    },
    async loadMe() {
      const res:any = await http.get('/auth/me')
      const previous = this.user
      this.user = { username:res.data.username, displayName:res.data.displayName || previous?.displayName || res.data.username, role:res.data.role }
      this.menus = res.data.menus
    },
    async logout() { try { await http.post('/auth/logout') } finally { localStorage.removeItem('scrm_token'); this.user=null; location.href='/login' } }
  }
})
