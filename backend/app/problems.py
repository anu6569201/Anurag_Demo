from typing import Literal, TypedDict


class Problem(TypedDict):
    id: str
    severity: Literal["critical", "major"]
    title: str
    detail: str
    status: Literal["Investigating", "Identified", "Monitoring"]
    area: str
    opened: str


PROBLEMS: tuple[Problem, ...] = (
    {
        "id": "INC-1042",
        "severity": "critical",
        "title": "Sign-in sessions end immediately",
        "detail": (
            "A successful login is cleared at once, and people are returned to the "
            "sign-in screen. No one can stay signed in."
        ),
        "status": "Investigating",
        "area": "Authentication",
        "opened": "Oct 12, 2026 · 00:40 IST",
    },
    {
        "id": "INC-1043",
        "severity": "critical",
        "title": "Core data requests are failing",
        "detail": (
            "Reads and writes to the data service return an error. Lists, saves, "
            "and updates are unavailable."
        ),
        "status": "Identified",
        "area": "API",
        "opened": "Oct 12, 2026 · 01:05 IST",
    },
    {
        "id": "INC-0988",
        "severity": "major",
        "title": "Search omits records from the last day",
        "detail": (
            "Newly created records do not appear in search results until the next "
            "index run. Direct links to those records still open."
        ),
        "status": "Investigating",
        "area": "Search",
        "opened": "Oct 11, 2026 · 18:20 IST",
    },
    {
        "id": "INC-0974",
        "severity": "major",
        "title": "Exports time out on large reports",
        "detail": (
            "CSV export stops responding once a report passes about 10,000 rows. "
            "Smaller exports complete normally."
        ),
        "status": "Identified",
        "area": "Reports",
        "opened": "Oct 11, 2026 · 11:15 IST",
    },
    {
        "id": "INC-0961",
        "severity": "major",
        "title": "In-app notifications arrive hours late",
        "detail": (
            "Mentions and assignment alerts are delivered, but several hours after "
            "the event. Email copies are on time."
        ),
        "status": "Monitoring",
        "area": "Notifications",
        "opened": "Oct 10, 2026 · 16:45 IST",
    },
)
