import './Support.css'

type Severity = 'critical' | 'major'

type Problem = {
  id: string
  severity: Severity
  title: string
  detail: string
  status: 'Investigating' | 'Identified' | 'Monitoring'
  area: string
  opened: string
}

const PROBLEMS: readonly Problem[] = [
  {
    id: 'INC-1042',
    severity: 'critical',
    title: 'Sign-in sessions end immediately',
    detail:
      'A successful login is cleared at once, and people are returned to the sign-in screen. No one can stay signed in.',
    status: 'Investigating',
    area: 'Authentication',
    opened: 'Oct 12, 2026 · 00:40 IST',
  },
  {
    id: 'INC-1043',
    severity: 'critical',
    title: 'Core data requests are failing',
    detail:
      'Reads and writes to the data service return an error. Lists, saves, and updates are unavailable.',
    status: 'Identified',
    area: 'API',
    opened: 'Oct 12, 2026 · 01:05 IST',
  },
  {
    id: 'INC-0988',
    severity: 'major',
    title: 'Search omits records from the last day',
    detail:
      'Newly created records do not appear in search results until the next index run. Direct links to those records still open.',
    status: 'Investigating',
    area: 'Search',
    opened: 'Oct 11, 2026 · 18:20 IST',
  },
  {
    id: 'INC-0974',
    severity: 'major',
    title: 'Exports time out on large reports',
    detail:
      'CSV export stops responding once a report passes about 10,000 rows. Smaller exports complete normally.',
    status: 'Identified',
    area: 'Reports',
    opened: 'Oct 11, 2026 · 11:15 IST',
  },
  {
    id: 'INC-0961',
    severity: 'major',
    title: 'In-app notifications arrive hours late',
    detail:
      'Mentions and assignment alerts are delivered, but several hours after the event. Email copies are on time.',
    status: 'Monitoring',
    area: 'Notifications',
    opened: 'Oct 10, 2026 · 16:45 IST',
  },
]

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  major: 'Major',
}

function problemsBySeverity(severity: Severity): Problem[] {
  return PROBLEMS.filter((problem) => problem.severity === severity)
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

export function Support() {
  const critical = problemsBySeverity('critical')
  const major = problemsBySeverity('major')

  return (
    <section className="support">
      <header className="support-header">
        <h1>Support</h1>
        <p>Open problems affecting the product right now.</p>
        <ul className="support-summary">
          <li>
            <strong>{critical.length}</strong> critical
          </li>
          <li>
            <strong>{major.length}</strong> major
          </li>
        </ul>
      </header>
      <ProblemGroup severity="critical" problems={critical} />
      <ProblemGroup severity="major" problems={major} />
    </section>
  )
}
