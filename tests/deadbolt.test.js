import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  INPUT_SCHEMAS,
  PUBLIC_CONFIG,
  TOOL_NAMES,
  compositionRemovalProof,
  createDeadbolt,
  evaluateCapability,
  positiveControlProof,
  prototypePollutionProof,
  readOwnTrue,
  registerWebMCP,
  toolDefinitions,
} from "../src/deadbolt.js";

const addInput = (key = "agent:12345678") => ({ listingId: "blue-trail-harness-medium", quantity: 1, idempotencyKey: key });

test("capability model covers every state and flag combination", () => {
  assert.deepEqual(evaluateCapability({ implemented: false, enabled: true, approved: true }), { state: "unbuilt", reasonCode: "adapter_not_implemented" });
  assert.deepEqual(evaluateCapability({ implemented: true, enabled: false, approved: false }), { state: "built_and_refusing", reasonCode: "operator_disabled" });
  assert.deepEqual(evaluateCapability({ implemented: true, enabled: true, approved: false }), { state: "built_and_refusing", reasonCode: "operator_approval_required" });
  assert.deepEqual(evaluateCapability({ implemented: true, enabled: true, approved: true }), { state: "built_and_working", reasonCode: "available" });
});

test("gate accepts only own exact-string true values", () => {
  assert.equal(readOwnTrue({ flag: "true" }, "flag"), true);
  for (const value of [true, "TRUE", "1", 1, " true ", null]) assert.equal(readOwnTrue({ flag: value }, "flag"), false);
  assert.equal(readOwnTrue(Object.create({ flag: "true" }), "flag"), false);
});

test("prototype-pollution proof keeps checkout closed", () => {
  assert.deepEqual(prototypePollutionProof(), {
    naiveReadsTrue: true,
    ownReadsTrue: false,
    state: "built_and_refusing",
    reasonCode: "operator_disabled",
  });
});

test("public capability matrix includes all tools and all states", () => {
  const capabilities = createDeadbolt().capabilities();
  assert.deepEqual(capabilities.map((item) => item.name), TOOL_NAMES);
  assert.equal(capabilities.find((item) => item.name === "create_checkout").state, "built_and_refusing");
  assert.equal(capabilities.find((item) => item.name === "place_order").state, "unbuilt");
  assert.ok(capabilities.some((item) => item.state === "built_and_working"));
});

test("successful calls and canonical refusals keep stable outer contracts", async () => {
  const service = createDeadbolt();
  const search = await service.invoke("search_listings", { query: "blue dog harness", limit: 2 });
  assert.equal(search.ok, true);
  assert.equal(search.status, "success");
  assert.equal(search.capability, "search_listings");
  assert.equal(search.data.listings.length, 2);

  const checkout = await service.invoke("create_checkout", { cartRevision: 0, idempotencyKey: "agent:checkout1" });
  assert.deepEqual(checkout, {
    ok: false,
    status: "capability_unavailable",
    capability: "create_checkout",
    state: "built_and_refusing",
    reason_code: "operator_approval_required",
    reason: "Checkout creation is disabled for this deployment.",
    retryable: false,
    next_action: { type: "call_tool", tool: "prepare_checkout_review" },
  });
});

test("cart state is shared, idempotent, and detects key conflicts", async () => {
  const service = createDeadbolt();
  const first = await service.invoke("add_to_cart", addInput(), { origin: "agent" });
  const replay = await service.invoke("add_to_cart", addInput(), { origin: "agent" });
  const conflict = await service.invoke("add_to_cart", { ...addInput(), quantity: 2 }, { origin: "agent" });
  const cart = await service.invoke("get_cart");

  assert.equal(first.data.cart.revision, 1);
  assert.deepEqual(replay, { ...first });
  assert.equal(conflict.status, "idempotency_conflict");
  assert.equal(cart.data.cart.lines[0].quantity, 1);
  assert.equal(service.snapshot().lastMutationOrigin, "agent");
});

test("cancellation before dispatch is safe and after dispatch is ambiguous", async () => {
  const before = createDeadbolt();
  const stopped = new AbortController();
  stopped.abort();
  const cancelled = await before.invoke("add_to_cart", addInput("agent:before1"), { signal: stopped.signal });
  assert.equal(cancelled.reason_code, "cancelled_before_dispatch");
  assert.equal(before.snapshot().cart.revision, 0);

  const after = createDeadbolt();
  const racing = new AbortController();
  const pending = after.invoke("add_to_cart", addInput("agent:after01"), { signal: racing.signal });
  racing.abort();
  const ambiguous = await pending;
  assert.equal(ambiguous.status, "result_ambiguous");
  assert.equal(ambiguous.next_action.tool, "get_cart");
  assert.equal(after.snapshot().cart.revision, 1);
});

test("bounded schemas reject unknown, excessive, forged, and malformed input", async () => {
  const service = createDeadbolt();
  const cases = [
    ["search_listings", { query: "x".repeat(201) }],
    ["search_listings", { query: "blue", approval: true }],
    ["add_to_cart", { ...addInput(), quantity: 21 }],
    ["add_to_cart", { ...addInput("bad key") }],
    ["add_to_cart", { ...addInput(), price: "0.01" }],
  ];
  for (const [name, input] of cases) assert.equal((await service.invoke(name, input)).status, "invalid_input");
  assert.equal(service.snapshot().cart.revision, 0);
  assert.ok(Object.values(INPUT_SCHEMAS).every((schema) => schema.additionalProperties === false));
});

test("composition-removal mutant refuses the complete tool suite without mutation", async () => {
  assert.deepEqual(await compositionRemovalProof(), { testedTools: TOOL_NAMES.length, stableRefusals: true, stateChanged: false });
});

test("positive control proves sabotage opens checkout and would fail security expectations", () => {
  assert.deepEqual(positiveControlProof(), {
    secureState: "built_and_refusing",
    sabotagedState: "built_and_working",
    testWouldCatchSabotage: true,
  });
});

test("registration replacement aborts the previous complete suite", async () => {
  const registrations = [];
  const fakeDocument = { modelContext: { registerTool: async (definition, options) => registrations.push({ definition, options }) } };
  const service = createDeadbolt({ config: PUBLIC_CONFIG });
  const first = await registerWebMCP(fakeDocument, service);
  const priorSignals = registrations.map((item) => item.options.signal);
  const second = await registerWebMCP(fakeDocument, service);

  assert.equal(first.count, TOOL_NAMES.length);
  assert.equal(second.count, TOOL_NAMES.length);
  assert.ok(priorSignals.every((signal) => signal.aborted));
  assert.equal(registrations.length, TOOL_NAMES.length * 2);
});

test("merchant text is annotated as untrusted and writes are not read-only", () => {
  const definitions = toolDefinitions(createDeadbolt());
  assert.equal(definitions.find((tool) => tool.name === "search_listings").annotations.untrustedContentHint, true);
  assert.equal(definitions.find((tool) => tool.name === "add_to_cart").annotations.readOnlyHint, false);
  assert.equal(definitions.find((tool) => tool.name === "create_checkout").annotations.readOnlyHint, false);
});

test("top-level page exposes all four synchronized areas and imperative registration", async () => {
  const [html, source] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/deadbolt.js", import.meta.url), "utf8"),
  ]);
  for (const id of ["catalog", "cart-lines", "capability-list", "ledger-entries"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(source, /modelContext\.registerTool/);
});
