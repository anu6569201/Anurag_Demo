export function readApiOrigin(
  raw: string | undefined,
  options?: { requireHttps?: boolean },
): string | undefined {
  const value = raw?.trim() ?? ''
  if (value.length === 0) return undefined

  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('VITE_API_BASE_URL must be an absolute URL')
  }

  if (url.username !== '' || url.password !== '') {
    throw new Error('VITE_API_BASE_URL must not include credentials')
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('VITE_API_BASE_URL must use http or https')
  }

  if (options?.requireHttps === true && url.protocol !== 'https:') {
    throw new Error('VITE_API_BASE_URL must use https in production')
  }

  return url.origin
}
