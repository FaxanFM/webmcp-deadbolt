# Threat model

## Untrusted inputs

- browser agents may call tools out of order, retry, forge fields, or ignore hints;
- merchant-controlled catalog text may contain prompt injection;
- browser-visible state and build-time values may be tampered with; and
- a write response may be lost after dispatch.

## Controls

- JSON schemas and runtime validation reject unknown fields, excessive values, malformed keys, and caller-supplied authority;
- merchant text is returned only from tools marked `untrustedContentHint: true`;
- capability gates use own exact-string properties;
- writes require idempotency and reject key reuse with different normalized input;
- pre-dispatch cancellation performs no mutation and post-dispatch uncertainty returns read-before-retry guidance;
- replacing the suite aborts the previous registration controller; and
- absent marketplace composition refuses all ten tools without side effects.

## Explicit non-claims

Browser JavaScript is not an authorization boundary. Annotations do not authorize actions. A refusal cannot stop every possible browser interaction. `retryable: false` cannot force model behavior. Checkout creation is not payment execution, and v0 does neither.
