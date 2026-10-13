(() => {
  const content = window.SITE_CONTENT || {};
  const phone = content.phoneDisplay || "+91 70004 11604";
  const email = content.email || "hello@riddhisiddhienterprises.in";
  document.querySelectorAll("[data-phone]").forEach(el => el.textContent = phone);
  document.querySelectorAll("[data-phone-link]").forEach(el => el.href = `tel:${content.phoneDial || phone.replace(/\s/g, "")}`);
  document.querySelectorAll("[data-email]").forEach(el => el.textContent = email);
  document.querySelectorAll("[data-email-link]").forEach(el => el.href = `mailto:${email}`);
  document.querySelector("#year").textContent = new Date().getFullYear();

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  function closeMenu(returnFocus = false) {
    if (!nav.classList.contains("is-open")) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    if (returnFocus) toggle.focus({ preventScroll: true });
  }
  const themeToggle = document.querySelector(".theme-toggle");
  const themeLabel = themeToggle.querySelector(".theme-label");
  const themeIcon = themeToggle.querySelector(".theme-icon");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme, persist = true) {
    const dark = theme !== "light";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
    themeLabel.textContent = `${dark ? "Light" : "Dark"} mode`;
    themeIcon.textContent = dark ? "☼" : "☾";
    themeMeta.content = dark ? "#071522" : "#f5f9f8";
    if (persist) {
      try { localStorage.setItem("rse-theme", dark ? "dark" : "light"); } catch { /* Private browsing may block storage. */ }
    }
  }
  applyTheme(document.documentElement.dataset.theme || "dark", false);
  themeToggle.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    if (open) nav.querySelector("a")?.focus({ preventScroll: true });
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    closeMenu();
  }));
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    closeMenu(true);
  });
  document.addEventListener("click", event => {
    if (!nav.classList.contains("is-open") || nav.contains(event.target) || toggle.contains(event.target)) return;
    closeMenu();
  });
  window.addEventListener("scroll", () => closeMenu(), { passive: true });
  window.addEventListener("wheel", () => closeMenu(), { passive: true });
  let touchStartY = null;
  document.addEventListener("touchstart", event => {
    touchStartY = nav.classList.contains("is-open") && !nav.contains(event.target) ? event.touches[0].clientY : null;
  }, { passive: true });
  document.addEventListener("touchmove", event => {
    if (touchStartY === null || nav.contains(event.target)) return;
    if (Math.abs(event.touches[0].clientY - touchStartY) > 12) {
      touchStartY = null;
      closeMenu();
    }
  }, { passive: true });

  const revealItems = document.querySelectorAll(".intro-grid,.stat-row,.product-card,.section-heading,.work-card,.river-card,.quote-band p,.feedback-copy,.feedback-form,.contact-grid>div:first-child,.contact-form");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }), { threshold: 0.12, rootMargin: "0px 0px -25px 0px" });
    revealItems.forEach(item => { item.classList.add("reveal"); revealObserver.observe(item); });
  }

  const navLinks = [...nav.querySelectorAll('a[href^="#"]')].filter(link => link.getAttribute("href") !== "#home");
  const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        if (link.getAttribute("href") === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }), { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  }

  const canTilt = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canTilt) document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--tilt-x", `${x * 5}deg`);
      card.style.setProperty("--tilt-y", `${y * -5}deg`);
    }, { passive: true });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
  if (canTilt) document.querySelectorAll(".river-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--river-tilt-x", `${x * 4}deg`);
      card.style.setProperty("--river-tilt-y", `${y * -4}deg`);
    }, { passive: true });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--river-tilt-x", "0deg");
      card.style.setProperty("--river-tilt-y", "0deg");
    });
  });

  let rating = "";
  const stars = [...document.querySelectorAll(".rating button")];
  function chooseRating(star, moveFocus = false) {
    rating = star.dataset.rating;
    document.querySelector('[name="rating"]').value = rating;
    stars.forEach(item => {
      const selected = Number(item.dataset.rating) === Number(rating);
      item.classList.toggle("selected", Number(item.dataset.rating) <= Number(rating));
      item.setAttribute("aria-checked", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    if (moveFocus) star.focus();
  }
  stars.forEach((star, index) => {
    star.addEventListener("click", () => chooseRating(star));
    star.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? stars.length - 1 : (index + (event.key === "ArrowRight" ? 1 : stars.length - 1)) % stars.length;
      chooseRating(stars[nextIndex], true);
    });
  });
  document.querySelector("#review-form")?.addEventListener("reset", () => {
    rating = "";
    stars.forEach((star, index) => {
      star.classList.remove("selected");
      star.setAttribute("aria-checked", "false");
      star.tabIndex = index === 0 ? 0 : -1;
    });
  });

  document.querySelectorAll('.email-form[data-form="contact"]').forEach(form => form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = `Website enquiry: ${data.get("topic")}`;
    const lines = [`Name: ${data.get("name")}`, `Phone: ${data.get("phone") || "Not provided"}`, `Interested in: ${data.get("topic")}`, "", data.get("message") || "No additional details."];
    const href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    form.querySelector(".form-status").textContent = "Your email app is opening with your message ready to send.";
    window.location.href = href;
  }));
})();
