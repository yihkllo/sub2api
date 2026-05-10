import type { PublicSettings } from '@/types'

export const BRAND_NAME = '云笺'
export const BRAND_SUBTITLE = '稳定的 AI 中转服务'
export const BRAND_AUTH_SUBTITLE = '稳定的 AI 中转服务'

export function withBrandSettings(settings: PublicSettings): PublicSettings {
  return {
    ...settings,
    site_name: BRAND_NAME,
    site_subtitle: BRAND_SUBTITLE,
    site_logo: ''
  }
}
