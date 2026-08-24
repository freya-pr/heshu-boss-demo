import { defineStore } from 'pinia'
import { menuByPath } from '../config/menu'

export interface WorkTab {
  path: string
  title: string
  groupName: string
  closable: boolean
}

const HOME_TAB: WorkTab = { path: '/leads/analytics', title: '线索概览', groupName: '首页', closable: false }
const HIDDEN_PAGE_PATHS = new Set(['/profile'])

function restore(): WorkTab[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem('heshu_scrm_tabs') || '[]')
    return [
      HOME_TAB,
      ...saved.filter((item: WorkTab) => item.path !== HOME_TAB.path && (menuByPath.has(item.path) || HIDDEN_PAGE_PATHS.has(item.path)))
    ]
  } catch {
    return [HOME_TAB]
  }
}

export const useTabsStore = defineStore('work-tabs', {
  state: () => ({ items: restore() as WorkTab[] }),
  actions: {
    open(tab: Omit<WorkTab, 'closable'>) {
      if (!this.items.some(item => item.path === tab.path)) this.items.push({ ...tab, closable: tab.path !== HOME_TAB.path })
      this.persist()
    },
    close(path: string) {
      const index = this.items.findIndex(item => item.path === path)
      if (index <= 0) return HOME_TAB.path
      this.items.splice(index, 1)
      this.persist()
      return this.items[Math.max(0, index - 1)]?.path || HOME_TAB.path
    },
    persist() {
      sessionStorage.setItem('heshu_scrm_tabs', JSON.stringify(this.items.filter(item => item.path !== HOME_TAB.path)))
    }
  }
})
