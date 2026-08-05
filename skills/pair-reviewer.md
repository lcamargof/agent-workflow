# Pair Reviewer Skill

Use this on the implementation side of a two-agent session when another agent runs `skills/pair.md` and publishes findings through the pair artifact. Keep implementation moving while consuming review asynchronously; do not wait forever or apply findings blindly.

Read `skills/pair-protocol.md` first.

## Start the Inbox

1. Resolve or create the matching pair session and publish the exact artifact path, task contract, fixed point, active slice, and worker heartbeat.
2. If subagents are available and authorized, spawn one inexpensive, fast sentinel (Sonnet-class or the fastest competent available model). Give it only the protocol path, artifact path, repository root, and fixed point. Its job is to poll at intervals no longer than 60 seconds and notify you on `REVIEWED`, `LGTM`, `ORPHANED`, malformed/stale state, or a liveness deadline. It must not edit code or the artifact.
3. If the sentinel exits unexpectedly, replace it at most once. After a second failure—or when subagents are unavailable—poll the artifact directly at coherent work boundaries. Never represent an unavailable sentinel as completed review.

## Consume a Review Round

At the next safe boundary, or immediately for a Critical finding:

1. Acquire the protocol lock, verify `round`, `event_seq`, and `review_snapshot`, then move `REVIEWED -> READ`. Do not acknowledge a stale or mismatched batch.
2. Corroborate every finding against the actual diff, requirement, relevant project rule, and test evidence. Classify it as confirmed, disputed with evidence, legitimately deferred/out of scope, or not yet verifiable.
3. Make the smallest plan that resolves confirmed in-scope findings without colliding with active edits. Critical issues interrupt the slice; other issues enter the current phase at a safe boundary.
4. Execute confirmed fixes as the implementation owner. Run the narrowest decisive check, then the mapped scoped checks appropriate to the changed surface. Do not edit merely to satisfy reviewer wording.
5. Under the lock, write one response per finding with disposition, reason, changed paths, and exact verification result. Record the new code snapshot and move `READ -> REPLIED`. A partial response remains `READ`.

Continue primary work when the reviewer returns the session to `IDLE`. Before declaring implementation complete, set `work_status: DONE`, publish final verification evidence, and stop changing code while the reviewer checks the final snapshot. Any later edit returns work to `ACTIVE` and invalidates the prior snapshot.

Stop the sentinel when the artifact reaches `LGTM`, `ORPHANED`, or the user cancels. `LGTM` closes the pair loop. `ORPHANED` closes only the watcher: report the surviving implementation and verification state as review-pending, then follow the repository's normal completion policy. Never convert a two-minute timeout into approval.

