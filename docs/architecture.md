# Architecture

The person and browser agent interact with one top-level page and one in-memory cart. The fixture adapter is deterministic, requires no credentials, and never contacts a third party.

```text
storefront UI ─┐
human cart ────┼─ shared service ─ fixture catalog
WebMCP tools ──┤       │
console ───────┤       ├─ capability decisions
ledger ────────┘       └─ structured result builders
```

`add_to_cart` is the only state-changing v0 operation. It requires an exact listing identifier, bounded quantity, and idempotency key. `create_checkout` remains registered but policy-closed. `place_order` has no implementation.

For any future consequential operation, the browser would call an authenticated server endpoint that independently validates identity, session, policy, actor authorization, resource state, schema, idempotency, exact-action confirmation, and adapter support. Client-supplied prices, totals, approval, capability state, and permissions would be ignored.
