# Security policy

WebMCP Deadbolt v0 is a public fixture demonstration. It does not process payments, place orders, store credentials, or expose a server-authoritative commerce endpoint.

Please report vulnerabilities privately through GitHub's security advisory flow. Do not include secrets, personal data, or exploit traffic against third-party systems.

The core invariants are:

- consequential gates read own exact-string configuration values only;
- the browser is never authoritative for identity, approval, price, totals, or permission;
- unknown and out-of-bounds input is rejected;
- writes are idempotent and ambiguous outcomes direct callers to read before retrying;
- missing composition returns stable non-retryable refusals; and
- WebMCP annotations remain hints, never authorization controls.

Any future order or payment implementation must move to an authenticated server boundary and add one-time exact-action confirmation. It is outside v0.
