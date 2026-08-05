# Pair Review Protocol

Shared contract for `skills/pair.md` (reviewer) and `skills/pair-reviewer.md` (implementer). Load this file from either role. The coordination artifact is `${PAIR_REVIEW_FILE:-/tmp/CODE_REVIEW.mdx}`.

## Session Header

Create the artifact with this frontmatter; never join a file whose `session_id`, `repo_root`, or `base_ref` names different work.

```yaml
---
protocol: pair-review/v1
session_id: <unique-id>
repo_root: <absolute-path>
base_ref: <commit>
state: IDLE
work_status: ACTIVE
round: 0
event_seq: 0
review_snapshot: null
worker_heartbeat: <ISO-8601>
reviewer_heartbeat: <ISO-8601>
updated_by: <worker|reviewer>
updated_at: <ISO-8601>
---
```

If the default path belongs to another live session, use `/tmp/CODE_REVIEW.<session_id>.mdx` and tell the peer the exact path. Keep the file context-light:

```markdown
# Current round
## Findings
### R<round>-F<n> [OPEN] <Critical|Important|Minor>
<path:line; violated requirement; evidence; impact>

## Worker responses
### R<round>-F<n> [FIXED|DISPUTED|DEFERRED|CANNOT_VERIFY]
<reason; changed paths; verification evidence>

## Reviewer verification
### R<round>-F<n> [VERIFIED|REOPENED]
<evidence>

# Event log
- <event_seq> <timestamp> <role> <transition and concise reason>
```

Replace the current round when a new round starts; retain only concise outcomes in the event log. The Git diff remains the source of truth for code changes—do not narrate every edit.

## State Machine

- `IDLE`: no unanswered review batch; never means approval.
- `REVIEWED`: reviewer published round `N` against `review_snapshot`.
- `READ`: worker acknowledged that exact round and snapshot.
- `REPLIED`: worker dispositioned every finding in that round.
- `LGTM`: reviewer verified all findings and the final current snapshot while `work_status: DONE`. Terminal approval.
- `ORPHANED`: a peer failed the liveness check. Terminal for this session and never approval.

Allowed transitions:

```text
IDLE -> REVIEWED
REVIEWED -> READ
READ -> REPLIED
REPLIED -> REVIEWED | IDLE | LGTM
IDLE -> LGTM
any nonterminal state -> ORPHANED
```

The reviewer alone writes `REVIEWED`, `IDLE`, finding verification, `LGTM`, and reviewer heartbeat. The worker alone writes `READ`, `REPLIED`, responses, `work_status`, and worker heartbeat. Increment `round` for each new findings batch and `event_seq` for every transition. A response must name its round and `review_snapshot`; ignore stale generations.

Bind review to an immutable commit when possible. Otherwise record a deterministic digest covering HEAD plus staged, unstaged, deleted, and untracked content. Any code change after the recorded snapshot invalidates a prospective `LGTM` and requires a fresh final snapshot.

## Safe Writes and Liveness

Before every mutation, acquire `<artifact>.lock` with atomic directory creation. While holding it: re-read the file, verify session/round/event sequence, patch only role-owned fields/sections, increment `event_seq`, then re-read and validate before releasing the lock. Never overwrite from a stale read or remove a fresh peer lock.

Refresh the role-owned heartbeat at each poll or meaningful event. Poll or wait for at most 60 seconds at a time. After two minutes without the peer heartbeat **and** without peer-authored artifact or repository activity, send one direct liveness probe when a channel exists and allow one final 60-second grace window. If still silent, record `ORPHANED`, including peer, last activity, and reason, then stop. A crash, cancellation, token limit, malformed file, deleted file, or stale lock fails closed; it never becomes `LGTM`. Recovery starts a new `session_id`.

