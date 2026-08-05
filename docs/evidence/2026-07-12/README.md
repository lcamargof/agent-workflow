# Evidence provenance — 2026-07-12

This kit repository is public. The production evidence cited by `WORKFLOW_IMPROVEMENT_PLAN.md` and `WORKFLOW_AUDIT.md` includes unresolved security and product findings, so raw copies are NOT stored here. This index records what was reviewed, where the authoritative copy lives, and a content hash so provenance is verifiable without disclosure.

All artifacts were untracked working files at snapshot time. Preservation of the originals is the owning repo's responsibility (commit them there, on a branch appropriate to that repo's visibility).

| Artifact (repo-relative) | Repo | SHA-256 |
| --- | --- | --- |
| `CODEX_AUDIT` (E2E suite audit handoff) | register, branch `feature/e2e-suite` | `1c1f7857223cdc0edaba74b7d554da77b019c6aa4221dee4a22e6d2a791fc802` |
| `CODEX_WORK` (trust-hardening handoff) | register, branch `feature/e2e-suite` | `7b0a058a2d4252d96021b0e2dc134eedf1c85a96ff3e63613d5bb9c2e5be587c` |
| `docs/wiki/log.md` (friction ledger) | register | `da53151cf9c714f68d23b6030cd0e7f8c3268fdbf8d4d1fd8bd1de12b4db2130` |
| `docs/wiki/progress.md` (stage ledger) | register | `2d65687328442bb7b1898347583a6aa7159cfe0f8653db347c4673ddb239fc7c` |
| `docs/SDK_AUDIT_2026-07-09.md` | dtf-sdk, `main` | `689183428537c0db71c276c380afa92b2b64081e9b5268fb10de1df4b05f3434` |
| `docs/wiki/log.md` | dtf-sdk | `e075127b711206443685a20c7d65f4a0e03b23c9eff77a55e3db2c8be505c7ab` |
| `docs/wiki/progress.md` | dtf-sdk | `806c933d9d44069abad9cff22dbf737e6058b9924dabd512703929d13abd15b3` |
| `docs/wiki/decisions.md` | dtf-sdk | `bdfcfea522eebca9add4bc78465ee7685f19fb5058ab55a4febee72471046611` |

What the evidence establishes (redacted to workflow-relevant claims only):

- register: ten days of dated friction/calibration entries, ~20 verified stage rows, the measured-latency finding behind radius × size, a multi-agent stale-revert coordination incident, and review passes that surfaced real trust-boundary defects (details stay in the register repo).
- dtf-sdk: a three-stage workflow-produced workload with fresh-gate evidence, three false-green hardenings, and an honestly recorded skipped-reviewer closeout.
