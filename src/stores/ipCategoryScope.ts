import { ref } from 'vue'

export type IpCategoryOption = { label: string; value: string }

const dictionaryStorageKey = 'heshu_boss_dictionaries_v1'
const scopeStorageKey = 'heshu_boss_global_ip_category_v1'
const fallbackCategories: IpCategoryOption[] = [{ label: '教育规划', value: 'EDUCATION_PLANNING' }]

export const globalIpCategory = ref(localStorage.getItem(scopeStorageKey) || '')

export function loadIpCategoryOptions(): IpCategoryOption[] {
  try {
    const dictionaries = JSON.parse(localStorage.getItem(dictionaryStorageKey) || '[]')
    const items = dictionaries.find((item: any) => item.code === 'ip_category' && item.status === 'ACTIVE')?.items
    if (!Array.isArray(items)) return [...fallbackCategories]
    const activeItems = items
      .filter((item: any) => item.status === 'ACTIVE')
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((item: any) => ({ label: item.label, value: item.value }))
    return activeItems.length ? activeItems : [...fallbackCategories]
  } catch {
    return [...fallbackCategories]
  }
}

export function setGlobalIpCategory(value: string) {
  globalIpCategory.value = value
  if (value) localStorage.setItem(scopeStorageKey, value)
  else localStorage.removeItem(scopeStorageKey)
}
