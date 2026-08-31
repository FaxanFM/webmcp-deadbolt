# WebMCP Challenge rules compliance

Reviewed against live Devpost data on August 31, 2026. The official rules are at <https://webmcp.devpost.com/rules>.

**A note on accuracy:** this guide is a helper. The information on the Devpost website is the correct and accurate version — if there is ever any discrepancy between what you read here and what the website says, the website prevails.

## Participant confirmations required

- [ ] Every entrant is “Above legal age of majority in country of residence.”
- [ ] No entrant resides in an excluded location: Belarus, Brazil, China, Crimea, Cuba, Donetsk People’s Republic, Hong Kong, Iran Islamic Republic of, Korea Democratic People's Republic of, Luhansk People’s Republic, Quebec, Russia, Syrian Arab Republic, or Venezuela.
- [ ] No entrant has a sponsor/administrator/judge conflict or other eligibility exclusion.
- [ ] The Devpost registration is complete, and every team member has joined and accepted before the deadline.

These facts cannot be inferred from repository contents and must be confirmed by the participant.

## Verified now

- [x] New implementation commits are dated inside the August 25–September 3, 2026 submission period.
- [x] `HACKATHON.md` distinguishes the prior concept/specification from challenge-period implementation.
- [x] The repository is public: <https://github.com/FaxanFM/webmcp-deadbolt>.
- [x] GitHub detects the complete `LICENSE` as Apache-2.0.
- [x] The repository contains source, assets, tests, and local-run instructions.
- [x] CI passes on the public default branch.
- [x] The HTTPS live URL loads: <https://faxanfm.github.io/webmcp-deadbolt/>.
- [x] The live top-level page exposes all ten tools through `document.modelContext.registerTool` in ChatGPT's in-app browser.
- [x] The deterministic fixture works without credentials or third-party services.
- [x] The shared cart, structured checkout refusal, unbuilt order result, and visible ledger are implemented.
- [x] No runtime dependencies, third-party product assets, proprietary marketplace materials, or credentials are committed.
- [x] Submission materials in the repository are in English.

## Release gates before Devpost submission

- [ ] Run and record all five agent-behavior evaluations against the deployed app, including model, client, date, observed sequence, and result.
- [ ] Record a clear narrated demo, shorter than three minutes, using only owned or licensed material.
- [ ] Publish the video publicly on YouTube and add its verified URL to `README.md` and Devpost.
- [ ] Complete the Devpost description fields, including why WebMCP fits, the improved experience, what people and agents can do together, and the implementation summary.
- [ ] Add the live URL, public repository URL, tested agents/clients, AI tools used, and any testing instructions to Devpost.
- [ ] Confirm the app and repository remain freely accessible through the judging period.
- [ ] Finalize the submission before September 3, 2026 at 1:00 p.m. Pacific / 4:00 p.m. Eastern; a saved draft is not submitted.
- [ ] Stop modifying the submitted project, video, repository, and live site after the submission period closes unless the organizers explicitly permit a narrow correction.

## Current decision

The repository and hosted build satisfy the code, openness, license, provenance, and live-access requirements. The project is **not submission-ready** until participant eligibility/registration, five behavior records, the public narrated video, and the final Devpost submission are complete.
