# Challenge-period provenance

## Event window

The WebMCP Challenge submission period runs from August 25, 2026 at 11:00 a.m. Pacific Time through September 3, 2026 at 1:00 p.m. Pacific Time.

## First challenge-specific commit

The initial commit hash will be added immediately after the repository's first commit. Commit history will remain dated and will not be squashed before judging.

## Prior work

The WebMCP Deadbolt product concept and the participant-supplied final build specification existed before this repository's first commit. No prior implementation code, fixture data, tests, visual assets, proprietary marketplace schema, credentials, or internal documents were imported into this repository.

## Work implemented during the submission period

- deterministic fixture catalog, availability, and shared cart;
- complete ten-tool top-level imperative WebMCP registration;
- explicit `unbuilt`, `built_and_refusing`, and `built_and_working` states;
- own-property exact-string configuration gates;
- strict bounded input validation and structured result contracts;
- idempotent reversible cart writes and ambiguous-result guidance;
- registration and execution cancellation behavior;
- synchronized human UI, capability console, and privacy-safe activity ledger;
- prototype-pollution, composition-removal, and positive-control proofs;
- deterministic and adversarial tests; and
- public documentation and submission materials.

## Commit range

The challenge range begins with the initial commit recorded above and continues through the commit submitted to Devpost.

## Third-party libraries, APIs, and assets

- Runtime and development libraries: none.
- Product assets: none; the interface uses original HTML and CSS.
- Browser API: the emerging WebMCP API through `document.modelContext.registerTool`, used according to the public community specification.
- Fixture data: original synthetic data created for this project; it contacts no third party.

## Ownership and authorization

All committed implementation, fixture data, tests, and documentation are original challenge-period work. The repository contains no proprietary storefront code, credentials, private schemas, or copied product assets. Any future third-party integration must document its authorization and license before merge.
