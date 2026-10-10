import { readApiOrigin } from './security/api-origin.ts'

export const env = {
  apiBaseUrl:
    readApiOrigin(import.meta.env.VITE_API_BASE_URL, {
      requireHttps: import.meta.env.PROD,
    }) ?? '',
} as const
