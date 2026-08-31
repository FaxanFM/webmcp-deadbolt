# Capability-state protocol

Deadbolt exposes exactly three public states:

- `unbuilt`: the active adapter has no implementation.
- `built_and_refusing`: implementation exists, but deployment policy or runtime authorization prevents execution.
- `built_and_working`: implementation and deployment policy permit execution; per-call authorization and validation still apply.

Consequential deployment gates require both configuration keys to exist as own properties and equal the exact string `"true"`. `ENABLED` means the implementation is intentionally wired into the deployment. `APPROVED` means the operator permits the capability at deployment scope; it is not transaction consent.

Closed tools return a serializable `capability_unavailable` result with state, reason code, human-readable reason, `retryable: false`, and a bounded safe next action. The field is advisory: correctness never depends on an agent obeying it.
