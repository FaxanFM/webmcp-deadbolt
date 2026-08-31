import {
  FIXTURE_LISTINGS,
  compositionRemovalProof,
  createDeadbolt,
  positiveControlProof,
  prototypePollutionProof,
  registerWebMCP,
} from "./deadbolt.js";

const service = createDeadbolt();
const catalog = document.querySelector("#catalog");
const cartLines = document.querySelector("#cart-lines");
const cartTotal = document.querySelector("#cart-total");
const cartOrigin = document.querySelector("#cart-origin");
const capabilityList = document.querySelector("#capability-list");
const ledgerEntries = document.querySelector("#ledger-entries");
const ledgerCount = document.querySelector("#ledger-count");
const proofOutput = document.querySelector("#proof-output");

for (const listing of FIXTURE_LISTINGS) {
  const article = document.createElement("article");
  article.className = "product";
  const heading = document.createElement("h3");
  heading.textContent = listing.title;
  const description = document.createElement("p");
  description.textContent = listing.description;
  const meta = document.createElement("div");
  meta.className = "product-meta";
  const details = document.createElement("span");
  details.textContent = `${listing.variant} · $${listing.price.amount} ${listing.price.currency}`;
  const stock = document.createElement("span");
  stock.className = `stock${listing.stock ? "" : " out"}`;
  stock.textContent = listing.stock ? `${listing.stock} IN STOCK` : "OUT OF STOCK";
  const button = document.createElement("button");
  button.textContent = "Add to shared cart";
  button.disabled = listing.stock === 0;
  button.addEventListener("click", () => service.invoke("add_to_cart", {
    listingId: listing.id,
    quantity: 1,
    idempotencyKey: `human:${crypto.randomUUID()}`,
  }, { origin: "human" }));
  meta.append(details, stock);
  article.append(heading, description, meta, button);
  catalog.append(article);
}

for (const capability of service.capabilities()) {
  const row = document.createElement("div");
  row.className = "capability";
  const name = document.createElement("code");
  name.textContent = capability.name;
  const reason = document.createElement("small");
  reason.textContent = capability.reasonCode;
  const state = document.createElement("span");
  state.className = `state ${capability.state === "built_and_working" ? "working" : capability.state === "built_and_refusing" ? "refusing" : "unbuilt"}`;
  state.textContent = capability.state;
  row.append(name, reason, state);
  capabilityList.append(row);
}

service.subscribe(({ cart, ledger, lastMutationOrigin }) => {
  cartLines.replaceChildren();
  if (cart.lines.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "The shared cart is empty.";
    cartLines.append(empty);
  }
  for (const line of cart.lines) {
    const row = document.createElement("div");
    row.className = "cart-line";
    const title = document.createElement("strong");
    title.textContent = line.title;
    const amount = document.createElement("strong");
    amount.textContent = `$${line.lineTotal.amount}`;
    const details = document.createElement("small");
    details.textContent = `${line.variant} · qty ${line.quantity}`;
    row.append(title, amount, details);
    cartLines.append(row);
  }
  cartTotal.textContent = `$${cart.total.amount} ${cart.total.currency}`;
  cartOrigin.textContent = lastMutationOrigin ? `Latest mutation: ${lastMutationOrigin}` : "No mutations yet";

  ledgerEntries.replaceChildren();
  ledgerCount.textContent = `${ledger.length} call${ledger.length === 1 ? "" : "s"}`;
  if (ledger.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Tool calls and refusals will appear here.";
    ledgerEntries.append(empty);
  }
  for (const entry of ledger) {
    const row = document.createElement("div");
    row.className = `ledger-entry${entry.refusalReasonCode ? " refused" : entry.stateChanged ? " changed" : ""}`;
    const time = document.createElement("small");
    time.textContent = new Date(entry.startedAt).toLocaleTimeString();
    const tool = document.createElement("code");
    tool.textContent = entry.tool;
    const result = document.createElement("span");
    result.textContent = entry.refusalReasonCode || entry.status;
    row.append(time, tool, result);
    ledgerEntries.append(row);
  }
});

document.querySelector("#reset").addEventListener("click", () => service.reset());

document.querySelector(".proof-buttons").addEventListener("click", async (event) => {
  const proof = event.target.closest("[data-proof]")?.dataset.proof;
  if (!proof) return;
  const result = proof === "prototype"
    ? prototypePollutionProof()
    : proof === "composition"
      ? await compositionRemovalProof()
      : positiveControlProof();
  proofOutput.textContent = JSON.stringify(result, null, 2);
  proofOutput.focus();
});

const registration = await registerWebMCP(document, service);
document.querySelector("#webmcp-status").textContent = registration.supported
  ? `${registration.count} WebMCP tools registered on this top-level page`
  : "Demo ready. Open in a WebMCP-capable browser to expose tools.";
