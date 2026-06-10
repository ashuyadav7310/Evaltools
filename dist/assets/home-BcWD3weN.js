(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const t of a)if(t.type==="childList")for(const r of t.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function o(a){const t={};return a.integrity&&(t.integrity=a.integrity),a.referrerPolicy&&(t.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?t.credentials="include":a.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(a){if(a.ep)return;a.ep=!0;const t=o(a);fetch(a.href,t)}})();function s(e,i){return(e==null?void 0:e.trim())||i}const u=[{id:"evalai",name:"EvalAI",badge:"Evaluation",status:"Local",statusType:"local",href:s("/evalai/","/evalai/"),apiBaseUrl:s("/api/evalai/","/api/evalai/"),description:"Score, benchmark, and compare AI responses with structured rubrics.",usage:"Used by",client:"UNEXT",pills:["Benchmarking","Scoring","Reports"],icon:"clipboard"},{id:"comcoachai",name:"ComcoachAI",badge:"Coaching",status:"Local",statusType:"live",href:s("/comcoachai/","/comcoachai/"),apiBaseUrl:s("/api/comcoachai/","/api/comcoachai/"),description:"Coach communication quality with feedback on tone, clarity, and confidence.",usage:"Used by",client:"UNEXT",pills:["Tone Analysis","Clarity","Feedback"],icon:"message"},{id:"convai",name:"ConvAI",badge:"Conversation",status:"Local",statusType:"local",href:s("/convai/","/convai/"),apiBaseUrl:s("/api/convai/","/api/convai/"),description:"Design guided simulations, dialogue journeys, and multi-turn practice flows.",usage:"Used by",client:"UNEXT",pills:["Dialogue","Flow Design","Multi-turn"],icon:"conversation"}],d={clipboard:`
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="2"/>
      <path d="M9 12h6M9 16h4"/>
    </svg>
  `,message:`
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M8 10h8M8 14h5"/>
    </svg>
  `,conversation:`
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v4l-4-4H9a2 2 0 0 1-2-2v-1"/>
      <path d="M15 3H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v4l4-4h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
    </svg>
  `,arrow:`
    <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  `};function c(e){return d[e]||d.arrow}const v=document.querySelector("#app");function h(e,i){const o=e.pills.map(a=>`<span class="pill">${a}</span>`).join(""),n=`${.34+i*.1}s`;return`
    <a
      class="card card-${e.id}"
      href="${e.href}"
      aria-label="Open ${e.name}"
      style="animation-delay: ${n}"
      data-tool-id="${e.id}"
      data-api-base-url="${e.apiBaseUrl}"
    >
      <span class="card-badge">${e.badge}</span>
      <div class="card-icon">${c(e.icon)}</div>
      <h2 class="card-title">${e.name}</h2>
      <p class="card-desc">${e.description}</p>
      <div class="usage-line" aria-label="${e.usage} ${e.client}">
        <span>${e.usage}</span>
        <strong>${e.client}</strong>
      </div>
      <div class="card-pills">${o}</div>
      <div class="card-cta">
        <div class="status status-${e.statusType}">
          <span class="status-dot"></span>
          <span>${e.status}</span>
        </div>
        <div class="cta-arrow">${c("arrow")}</div>
      </div>
    </a>
  `}v.innerHTML=`
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
        <button class="profile-button" type="button" aria-label="Open profile">AY</button>
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
        ${u.map(h).join("")}
      </section>

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
                <div><span>Phone</span><strong>XXXXXXX</strong></div>
              </div>
              <div class="contact-row">
                <span class="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>
                </span>
                <div><span>Email</span><strong>XXXXXXXX@u-next.com</strong></div>
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

          <form class="contact-form" aria-label="Support contact form">
            <div class="field">
              <input id="full-name" name="fullName" type="text" placeholder=" " required />
              <label for="full-name">Full Name*</label>
            </div>
            <div class="field">
              <input id="email" name="email" type="email" placeholder=" " required />
              <label for="email">Official Email ID*</label>
            </div>
            <div class="phone-grid">
              <div class="field field-select">
                <select id="country-code" name="countryCode" aria-label="Country code">
                  <option>+91</option>
                  <option>+1</option>
                  <option>+44</option>
                  <option>+971</option>
                </select>
                <label for="country-code">Code</label>
              </div>
              <div class="field">
                <input id="phone" name="phone" type="tel" placeholder=" " required />
                <label for="phone">Phone Number*</label>
              </div>
            </div>
            <div class="field">
              <input id="company" name="company" type="text" placeholder=" " required />
              <label for="company">Company Name*</label>
            </div>
            <div class="field">
              <input id="designation" name="designation" type="text" placeholder=" " required />
              <label for="designation">Your Designation*</label>
            </div>
            <div class="field field-select field-wide">
              <select id="training-needs" name="trainingNeeds" required>
                <option value="" selected disabled></option>
                <option>Leadership and manager capability</option>
                <option>Sales and customer communication</option>
                <option>AI evaluation and simulations</option>
                <option>Compliance and enterprise learning</option>
              </select>
              <label for="training-needs">What are your organization's training needs?</label>
            </div>
            <label class="consent">
              <input type="checkbox" required />
              <span>By proceeding, I agree to UNext Learning's Privacy Policy and consent to receive communications through Call or WhatsApp regarding my inquiry.</span>
            </label>
            <button class="submit-button" type="submit">
              <span>Submit</span>
              ${c("arrow")}
            </button>
          </form>
        </div>
      </section>
    </main>
  </div>

  <footer>
    <div class="wrapper">
      <span class="footer-line">&copy; 2026 <strong>U-Next</strong> . EvalTools Platform . Internal tools</span>
    </div>
  </footer>
`;const l=document.querySelector(".search-shell input"),m=[...document.querySelectorAll(".card")];l==null||l.addEventListener("input",e=>{const i=e.target.value.trim().toLowerCase();m.forEach(o=>{const n=o.textContent.toLowerCase().includes(i);o.hidden=!n})});var p;(p=document.querySelector(".contact-form"))==null||p.addEventListener("submit",e=>{e.preventDefault();const i=e.currentTarget.querySelector(".submit-button span");i&&(i.textContent="Submitted")});
