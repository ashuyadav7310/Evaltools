import "./styles.css";
import { toolConfig } from "./config.js";
import { getIcon } from "./icons.js";

const app = document.querySelector("#app");

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderCard(tool, index) {
  const pills = tool.pills.map((pill) => `<span class="pill">${pill}</span>`).join("");
  const backLines = tool.backDescription
    .map((line) => `<span>${line}</span>`)
    .join("");
  const usageLabel = tool.usage?.trim();
  const usageValue = tool.client?.trim();
  const usageLine = usageLabel
    ? `
          <span class="usage-line" aria-label="${escapeAttribute([usageLabel, usageValue].filter(Boolean).join(" "))}">
            <span>${usageLabel}</span>
            ${usageValue ? `<strong>${usageValue}</strong>` : ""}
          </span>
      `
    : "";
  const statusLine = tool.status
    ? `
            <span class="status status-${tool.statusType ?? "default"}">
              <span class="status-dot"></span>
              <span>${tool.status}</span>
            </span>
      `
    : "";
  const searchText = [
    tool.name,
    tool.badge,
    tool.description,
    usageLabel,
    usageValue,
    ...tool.pills,
    ...tool.backDescription
  ]
    .filter(Boolean)
    .join(" ");
  const delay = `${0.34 + index * 0.1}s`;

  return `
    <a
      class="card card-${tool.id}"
      href="${tool.href}"
      aria-label="Open ${tool.name}"
      style="animation-delay: ${delay}"
      data-tool-id="${tool.id}"
      data-api-base-url="${tool.apiBaseUrl}"
      data-search-text="${escapeAttribute(searchText.toLowerCase())}"
    >
      <span class="card-inner">
        <span class="card-face card-front">
          <span class="card-badge">${tool.badge}</span>
          <span class="card-main">
            <span class="card-icon">${getIcon(tool.icon)}</span>
            <span class="card-title">${tool.name}</span>
            <span class="card-desc">${tool.description}</span>
            ${usageLine}
            <span class="card-pills">${pills}</span>
          </span>
          <span class="card-cta">
            ${statusLine}
            <span class="cta-arrow">${getIcon("arrow")}</span>
          </span>
        </span>
        <span class="card-face card-back">
          <span class="card-back-content">
            <span class="card-back-kicker">${tool.badge}</span>
            <span class="card-back-title">${tool.name}</span>
            <span class="card-back-desc">${backLines}</span>
          </span>
        </span>
      </span>
    </a>
  `;
}

app.innerHTML = `
  <div class="bg-stage" aria-hidden="true">
    <div class="bg-top-glow"></div>
    <div class="stripe stripe-1"></div>
    <div class="stripe stripe-2"></div>
    <div class="stripe stripe-3"></div>
  </div>

  <div class="wrapper">
    <header class="top-nav">
      <a class="logo-group" href="/" aria-label="EvalTools home">
        <span class="logo-mark" aria-hidden="true">
          <img src="/unext-mark.svg" alt="" />
        </span>
        <div class="logo-divider"></div>
        <div class="logo-product">
          <span class="logo-product-name">EvalTools</span>
          <span class="logo-product-sub">AI Suite</span>
        </div>
      </a>
      <label class="search-shell" aria-label="Search tools">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m21 21-4.35-4.35"/>
          <circle cx="11" cy="11" r="7"/>
        </svg>
        <input type="search" placeholder="Search tools" />
      </label>
      <div class="nav-actions" aria-label="Account actions">
        <button class="icon-button" type="button" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/>
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.07 4.24l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.2.62.77 1 1.42 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z"/>
          </svg>
        </button>
      </div>
    </header>

    <main>
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-kicker">EvalTools - Innovation Hub</div>
        <h1 id="page-title">Innovation <em>Hub</em></h1>
        <p>One platform to access all training, evaluation, coaching, and simulation experiences.</p>
      </section>

      <p class="section-label">Choose a tool</p>
      <section class="cards" aria-label="AI tools">
        ${toolConfig.map(renderCard).join("")}
      </section>
      <p class="empty-search" hidden>No tools match your search.</p>

      <section class="support-section" aria-labelledby="support-title">
        <div class="support-copy">
          <span class="section-chip">Enterprise support</span>
          <h2 id="support-title">Reach out to our team for any assistance</h2>
          <p>We are here to assist with any questions or feedback. Complete the form, and we will reply as soon as possible.</p>
        </div>
        <div class="support-panel">
          <aside class="contact-card" aria-label="Contact information">
            <h3>Contact Information</h3>
            <div class="contact-list">
              <div class="contact-row">
                <span class="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.89.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45c.92.35 1.85.58 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
                </span>
                <div><span>Phone</span><strong>+91 8431877399</strong></div>
              </div>
              <div class="contact-row">
                <span class="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>
                </span>
                <div><span>Email</span><strong>ashutosh.yadav@u-next.com</strong></div>
              </div>
              <div class="contact-row">
                <span class="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.99-5.53 10.2-7.32 11.56a1.1 1.1 0 0 1-1.36 0C9.53 20.2 4 14.99 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <div>
                  <span>Address</span>
                  <strong>UNext Learning Pvt. Ltd.</strong>
                  <p>1/1, UNext Towers, Swami Vivekananda Road, Near Trinity Circle, Bengaluru, Karnataka 560008</p>
                </div>
              </div>
            </div>
          </aside>

          <!-- contact form removed per request; only contact information card is shown -->
        </div>
      </section>
    </main>
  </div>

  <footer>
    <div class="wrapper">
    <color mode="dark" class="footer-logo" aria-hidden="true">
      <span class="footer-line">&copy; 2026 <strong>U-Next</strong> . EvalTools Platform . Internal tools</span>
    </div>
  </footer>
`;

const searchInput = document.querySelector(".search-shell input");
const cards = [...document.querySelectorAll(".card")];
const emptySearch = document.querySelector(".empty-search");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

searchInput?.addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  let visibleCount = 0;

  cards.forEach((card) => {
    const matches = card.dataset.searchText.includes(query);
    card.classList.toggle("is-filtered", !matches);
    card.setAttribute("aria-hidden", String(!matches));
    if (matches) {
      visibleCount += 1;
    }
  });

  if (emptySearch) {
    emptySearch.hidden = visibleCount > 0;
  }
});

if (!canHover) {
  const directRedirectCardIds = new Set(["survey360", "careerinventory", "codeevaluation"]);

  cards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (directRedirectCardIds.has(card.dataset.toolId)) {
        return;
      }

      if (!card.classList.contains("is-flipped")) {
        event.preventDefault();
        cards.forEach((otherCard) => {
          if (otherCard !== card) {
            otherCard.classList.remove("is-flipped");
          }
        });
        card.classList.add("is-flipped");
      }
    });
  });
}

// contact form removed; no submit handler required
