import { env } from './env.ts'

export type Severity = 'critical' | 'major'
export type ProblemStatus = 'Investigating' | 'Identified' | 'Monitoring'

export type Problem = {
  id: string
  severity: Severity
  title: string
  detail: string
  status: ProblemStatus
  area: string
  opened: string
}

const SEVERITIES = new Set<string>(['critical', 'major'])
const STATUSES = new Set<string>(['Investigating', 'Identified', 'Monitoring'])

export function apiUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error('API path must start with a single /')
  }
  return `${env.apiBaseUrl}${path}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isProblem(value: unknown): value is Problem {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.severity === 'string' &&
    SEVERITIES.has(value.severity) &&
    typeof value.title === 'string' &&
    typeof value.detail === 'string' &&
    typeof value.status === 'string' &&
    STATUSES.has(value.status) &&
    typeof value.area === 'string' &&
    typeof value.opened === 'string'
  )
}

async function readJson(response: Response): Promise<unknown> {
  if (!response.ok) {
    throw new Error(`API responded with ${String(response.status)}`)
  }
  return response.json() as Promise<unknown>
}

export async function fetchHealth(signal?: AbortSignal): Promise<void> {
  const response = await fetch(apiUrl('/api/health'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
    signal,
  })
  const body = await readJson(response)
  if (!isRecord(body) || body.status !== 'ok') {
    throw new Error('API health check failed')
  }
}

export async function fetchProblems(signal?: AbortSignal): Promise<Problem[]> {
  const response = await fetch(apiUrl('/api/problems'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
    signal,
  })
  const body = await readJson(response)
  if (!isRecord(body) || !Array.isArray(body.problems)) {
    throw new Error('API response did not match the problems schema')
  }
  const problems: Problem[] = []
  for (const item of body.problems) {
    if (!isProblem(item)) {
      throw new Error('API response did not match the problems schema')
    }
    problems.push(item)
  }
  return problems
}
