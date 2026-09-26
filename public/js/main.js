(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- header state ---- */
  const header = $(".site-header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", scrollY > 8);
  onScroll(); addEventListener("scroll", onScroll, { passive: true });

  /* ---- mobile menu ---- */
  const toggle = $(".nav__toggle");
  let lastToggle = 0;
  toggle && toggle.addEventListener("click", (e) => {
    e.preventDefault();
    if (Date.now() - lastToggle < 350) return; // ignore synthesized double clicks on touch devices
    lastToggle = Date.now();
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  /* ---- dropdowns (hover on desktop, click everywhere) ---- */
  const items = $$(".nav__item.has-sub");
  const closeAll = (except) => items.forEach(i => { if (i !== except) { i.classList.remove("is-open"); $(".nav__link", i).setAttribute("aria-expanded", "false"); } });
  items.forEach(item => {
    const btn = $(".nav__link", item);
    let t;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const open = !item.classList.contains("is-open");
      closeAll(item);
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    item.addEventListener("mouseenter", () => { if (innerWidth > 980) { clearTimeout(t); closeAll(item); item.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); } });
    item.addEventListener("mouseleave", () => { if (innerWidth > 980) { t = setTimeout(() => { item.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }, 120); } });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".nav__item")) closeAll(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeAll(); document.body.classList.remove("nav-open"); } });

  /* ---- active link ---- */
  const base = document.body.dataset.base || "";
  const path = base + (document.body.dataset.path || "/");
  $$(".nav__list a").forEach(a => { if (a.getAttribute("href") === path) { a.classList.add("is-active"); const p = a.closest(".nav__item"); p && $(".nav__link", p).classList.add("is-active"); } });
  const section = document.body.dataset.section;
  if (section) $$(".nav__item.has-sub").forEach(i => { if ($(".nav__link", i).textContent.trim().toLowerCase().startsWith(section)) $(".nav__link", i).classList.add("is-active"); });

  /* ---- reveal on scroll (observer + fallback for fast scrolls) ---- */
  const pending = new Set($$("[data-reveal], [data-reveal-stagger]"));
  const show = (el) => { el.classList.add("in"); pending.delete(el); io.unobserve(el); };
  const io = new IntersectionObserver((entries) => entries.forEach(en => { if (en.isIntersecting || en.boundingClientRect.top < 0) show(en.target); }), { rootMargin: "120px 0px 160px 0px", threshold: 0 });
  pending.forEach(el => io.observe(el));
  let ticking = false;
  const sweep = () => { ticking = false; pending.forEach(el => { if (el.getBoundingClientRect().top < innerHeight + 160) show(el); }); };
  const onMove = () => { if (!ticking && pending.size) { ticking = true; requestAnimationFrame(sweep); } };
  addEventListener("scroll", onMove, { passive: true }); addEventListener("resize", onMove);
  setTimeout(sweep, 50);

  /* ---- morning feed demo ---- */
  const ICONS = {
    review: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    post: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.5" cy="6.5" r=".8"/></svg>',
    text: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    google: '<svg viewBox="0 0 24 24"><path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  };
  const FEEDS = {
    default: [
      ["review", "Reply to Dana's 5-star review", "Thanked her for the al pastor mention"],
      ["text", "Win-back text to 4 customers", "Last visit 60+ days, opted in"],
      ["post", "Tuesday post: birria plate", "Photo from your camera roll"],
      ["google", "Update hours for Labor Day", "Google says 9, site says 10"],
      ["review", "Reply to a 2-star review", "Calm, specific, no discount"],
      ["post", "Ask Sam for a review", "Job closed yesterday, email only"],
    ],
    trades: [
      ["review", "Reply to Mike's 5-star review", "Mentions the water heater swap"],
      ["text", "Follow up on 3 unsent quotes", "Sent 48 hours ago, no reply"],
      ["post", "Job photo: panel upgrade", "Before and after, your caption"],
      ["google", "Add 'emergency service' to profile", "Your top search this month"],
      ["text", "Tune-up reminders to 6 customers", "Installed 11 months ago"],
      ["review", "Ask Priya for a review", "Job closed yesterday"],
    ],
  };
  $$("[data-feed]").forEach(feed => {
    const kind = feed.dataset.feed || "default";
    const rows = FEEDS[kind] || FEEDS.default;
    const counter = feed.parentElement.querySelector("[data-feed-count]");
    const render = () => {
      feed.innerHTML = rows.map(([k, t, s]) => `
        <div class="feed__card"><div class="feed__icon feed__icon--${k}">${ICONS[k]}</div>
        <div class="feed__text"><strong>${t}</strong><span>${s}</span></div>
        <div class="feed__btn"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></div></div>`).join("");
    };
    const run = () => {
      render();
      const cards = $$(".feed__card", feed);
      let done = 0; if (counter) counter.textContent = "0";
      cards.forEach((c, i) => setTimeout(() => c.classList.add("is-in"), 150 + i * 160));
      cards.forEach((c, i) => setTimeout(() => { c.classList.add("is-done"); done++; if (counter) counter.textContent = String(done); }, 1500 + i * 700));
      setTimeout(run, 1500 + cards.length * 700 + 2600);
    };
    if (reduced) { render(); $$(".feed__card", feed).forEach(c => c.classList.add("is-in", "is-done")); if (counter) counter.textContent = String(rows.length); }
    else run();
  });

  /* ---- hero chick crows + speech bubble ---- */
  const heroChick = $("[data-crow]");
  const speech = $("[data-speech]");
  if (heroChick && !reduced) {
    const lines = ["Morning. Six things ready.", "Two reviews came in overnight.", "Tuesday post is drafted.", "Nothing sent yet. Your call."];
    let i = 0;
    const crow = () => {
      heroChick.classList.remove("is-crowing"); void heroChick.offsetWidth; heroChick.classList.add("is-crowing");
      if (speech) { speech.textContent = lines[i++ % lines.length]; speech.classList.add("is-on"); setTimeout(() => speech.classList.remove("is-on"), 3200); }
    };
    setTimeout(crow, 900);
    setInterval(crow, 6500);
  }

  /* ---- pricing toggle ---- */
  const tog = $("[data-toggle]");
  if (tog) {
    const set = (annual) => {
      $$("button", tog).forEach(b => b.classList.toggle("is-on", (b.dataset.period === "annual") === annual));
      $$("[data-monthly]").forEach(el => { el.textContent = annual ? el.dataset.annual : el.dataset.monthly; });
      $$("[data-period-label]").forEach(el => { el.textContent = annual ? "/mo, billed yearly" : "/mo"; });
    };
    $$("button", tog).forEach(b => b.addEventListener("click", () => set(b.dataset.period === "annual")));
    set(false);
  }

  /* ---- forms: endpoint or mailto fallback ---- */
  $$("form[data-form]").forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const endpoint = form.dataset.endpoint;
      const status = $(".form__status", form);
      const data = Object.fromEntries(new FormData(form).entries());
      if (endpoint) {
        try {
          const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
          if (!r.ok) throw new Error();
          form.reset(); status.textContent = "Got it. We'll reply within one business day."; status.classList.add("is-on");
        } catch { status.textContent = "Something went wrong. Email us instead: " + form.dataset.email; status.classList.add("is-on"); }
      } else {
        const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
        location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(form.dataset.subject || "Hello from the website")}&body=${encodeURIComponent(body)}`;
        status.textContent = "Opening your email app. If nothing happened, email " + form.dataset.email; status.classList.add("is-on");
      }
    });
  });

  /* ---- Calendly placeholder guard ---- */
  $$("[data-calendly]").forEach(a => {
    if (a.getAttribute("href").includes("YOUR-LINK")) {
      a.addEventListener("click", (e) => { e.preventDefault(); location.href = base + "/demo/"; });
    }
  });
  const cal = $("[data-calendly-embed]");
  if (cal) {
    const url = cal.dataset.url;
    if (url && !url.includes("YOUR-LINK")) {
      cal.innerHTML = `<iframe src="${url}?hide_gdpr_banner=1&background_color=ffffff&text_color=221a16&primary_color=f4a340" title="Book a demo" loading="lazy"></iframe>`;
    }
  }
})();
