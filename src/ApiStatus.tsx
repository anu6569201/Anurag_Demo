import { useEffect, useState } from 'react'
import { fetchHealth } from './api.ts'

type Status = 'loading' | 'ok' | 'unavailable'

const LABEL: Record<Status, string> = {
  loading: 'Checking the API…',
  ok: 'API connected',
  unavailable: 'API unavailable',
}

export function ApiStatus() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const controller = new AbortController()
    fetchHealth(controller.signal).then(
      () => {
        setStatus('ok')
      },
      (error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setStatus('unavailable')
      },
    )
    return () => {
      controller.abort()
    }
  }, [])

  return (
    <p className={`api-status api-status-${status}`} role="status">
      {LABEL[status]}
    </p>
  )
}
