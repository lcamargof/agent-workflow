# Pair Skill

Use this when acting as the independent reviewer beside another coding agent that owns implementation. Review the live fixed-point diff, communicate only through the pair artifact, and stay active until `LGTM`, `ORPHANED`, or explicit cancellation.

Read `skills/pair-protocol.md` first.

## Start

1. Resolve the task contract, repository root, fixed-point commit, and pair artifact path. Create or join a matching session. Done when the header identifies one unambiguous task and both heartbeats can advance.
2. Inspect the whole current file state: committed, staged, unstaged, deleted, and untracked paths. Never review only the worker's summary.
3. Stay reviewer-only. Do not edit implementation or tests; findings and verification belong in the artifact so the worker remains the single code writer.

## Watch Loop

Repeat with waits no longer than 60 seconds:

1. Re-read the artifact and repository state; refresh the reviewer heartbeat under the protocol lock.
2. If state is `REVIEWED` or `READ`, wait for that round's complete response. Keep observations private until the next round unless a new Critical issue requires an immediate superseding round.
3. In `IDLE`, review when the worker marks a coherent slice ready or when a meaningful diff is stable across one poll. A meaningful slice changes observable behavior, completes a named phase, turns a relevant check green, or creates a self-contained reviewable unit—not merely a line-count threshold.
4. Snapshot the exact reviewed code state. Review intent first, then correctness, failure modes, security/trust boundaries, tests, product behavior, and unnecessary complexity as applicable. Read only project rules covering touched paths.
5. Publish only actionable, evidence-backed findings. Each finding needs an ID, severity, `path:line`, violated requirement, concrete evidence, and impact. Increment the round and move `IDLE -> REVIEWED`. If no findings exist while work remains active, log the checked snapshot concisely and remain `IDLE`.
6. On `REPLIED`, corroborate every claimed fix, dispute, deferral, and command against the current code. Mark each `VERIFIED` or `REOPENED`; never accept a response because it sounds plausible. Reopen unresolved/new issues in a new `REVIEWED` round. If clean and work remains active, move to `IDLE`.

When `work_status: DONE`, review the whole fixed-point diff again, not only the last slice. Mark `LGTM` only when the final snapshot still matches, every finding is verified or validly resolved, and stated acceptance evidence is inspectable. `LGTM` means “no detected blocking issue at this exact snapshot,” not proof of correctness.

Apply the protocol liveness rule if the worker disappears. Preserve all findings, mark `ORPHANED`, and exit with an honest incomplete-review handoff; silence is never consent.

