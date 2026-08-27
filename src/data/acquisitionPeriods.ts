export type AcquisitionPeriodStage = '接量期' | '转化期' | '追单期'
export type AcquisitionPeriodStatus = '启用' | '停用'

export interface AcquisitionPeriod {
  id: string
  name: string
  stage: AcquisitionPeriodStage
  startAt: string
  endAt: string
  status: AcquisitionPeriodStatus
  creatorName: string
  createdAt: string
  qrRefCount: number
  businessDataCount: number
  remark?: string
}

export const ACQUISITION_PERIOD_STORAGE_KEY = 'heshu_boss_acquisition_periods_v1'

export const acquisitionPeriodSeeds: AcquisitionPeriod[] = [
  { id: 'AP-202608-01', name: '2026年8月第1期', stage: '接量期', startAt: '2026-08-01 00:00:00', endAt: '2026-08-07 23:59:59', status: '启用', creatorName: '张铭钰', createdAt: '2026-07-25 10:20:00', qrRefCount: 2, businessDataCount: 12846 },
  { id: 'AP-202608-02', name: '2026年8月第2期', stage: '转化期', startAt: '2026-08-08 00:00:00', endAt: '2026-08-14 23:59:59', status: '启用', creatorName: '张铭钰', createdAt: '2026-07-25 10:20:00', qrRefCount: 1, businessDataCount: 6820 },
  { id: 'AP-202608-03', name: '2026年8月第3期', stage: '追单期', startAt: '2026-08-15 00:00:00', endAt: '2026-08-21 23:59:59', status: '启用', creatorName: '张铭钰', createdAt: '2026-07-25 10:20:00', qrRefCount: 0, businessDataCount: 4215 },
  { id: 'AP-202608-04', name: '2026年8月第4期', stage: '接量期', startAt: '2026-08-22 00:00:00', endAt: '2026-08-28 23:59:59', status: '停用', creatorName: '张铭钰', createdAt: '2026-07-25 10:20:00', qrRefCount: 0, businessDataCount: 0 }
]

export function loadAcquisitionPeriods(): AcquisitionPeriod[] {
  try {
    const raw = localStorage.getItem(ACQUISITION_PERIOD_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return acquisitionPeriodSeeds.map(item => ({ ...item }))
}

export function saveAcquisitionPeriods(periods: AcquisitionPeriod[]) {
  localStorage.setItem(ACQUISITION_PERIOD_STORAGE_KEY, JSON.stringify(periods))
}

