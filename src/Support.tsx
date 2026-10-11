import { useEffect, useState } from 'react'
import { fetchProblems, type Problem, type Severity } from './api.ts'
import './Support.css'

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  major: 'Major',
}

function problemsBySeverity(problems: readonly Problem[], severity: Severity): Problem[] {
  return problems.filter((problem) => problem.severity === severity)
}

function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <article className="problem-card">
      <div className="problem-card-meta">
        <span className={`severity severity-${problem.severity}`}>
          {SEVERITY_LABEL[problem.severity]}
        </span>
        <span className="problem-id">{problem.id}</span>
        <span className="problem-status">{problem.status}</span>
      </div>
      <h3>{problem.title}</h3>
      <p>{problem.detail}</p>
      <p className="problem-foot">
        <span>{problem.area}</span>
        <span>{problem.opened}</span>
      </p>
    </article>
  )
}

function ProblemGroup({
  severity,
  problems,
}: {
  severity: Severity
  problems: readonly Problem[]
}) {
  const headingId = `${severity}-problems`
  return (
    <section className="problem-group" aria-labelledby={headingId}>
      <div className="problem-group-heading">
        <h2 id={headingId}>{SEVERITY_LABEL[severity]}</h2>
        <span className="problem-count">{problems.length}</span>
      </div>
      <div className="problem-list">
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </div>
    </section>
  )
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; problems: readonly Problem[] }
  | { status: 'error' }

export function Support() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchProblems(controller.signal).then(
      (problems) => {
        setState({ status: 'ready', problems })
      },
      (error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setState({ status: 'error' })
      },
    )
    return () => {
      controller.abort()
    }
  }, [reloadKey])

  const problems = state.status === 'ready' ? state.problems : []
  const critical = problemsBySeverity(problems, 'critical')
  const major = problemsBySeverity(problems, 'major')

  return (
    <section className="support">
      <header className="support-header">
        <h1>Support</h1>
        <p>Open problems affecting the product right now.</p>
        {state.status === 'loading' ? (
          <p className="support-status" role="status">
            Loading open problems…
          </p>
        ) : null}
        {state.status === 'error' ? (
          <p className="support-status" role="alert">
            Open problems could not be loaded.
            <button
              type="button"
              className="support-retry"
              onClick={() => {
                setReloadKey((key) => key + 1)
              }}
            >
              Try again
            </button>
          </p>
        ) : null}
        {state.status === 'ready' ? (
          <ul className="support-summary">
            <li>
              <strong>{critical.length}</strong> critical
            </li>
            <li>
              <strong>{major.length}</strong> major
            </li>
          </ul>
        ) : null}
      </header>
      {state.status === 'ready' ? (
        <>
          <ProblemGroup severity="critical" problems={critical} />
          <ProblemGroup severity="major" problems={major} />
        </>
      ) : null}
    </section>
  )
}
