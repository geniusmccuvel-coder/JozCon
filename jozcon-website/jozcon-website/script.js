/* ==========================================================
   JOZCON COMPANY — script.js
   Plain JavaScript, no libraries.
   ========================================================== */

/* ---------- 1. Settings: update with the real WhatsApp number ---------- */
const WHATSAPP_NUMBER = "27815566322"; // +27 81 556 6322
const DEFAULT_WA_MESSAGE = "Hi JOZCON, I'd like to enquire about a project.";

// Builds a WhatsApp link with a pre-filled message
function whatsappLink(message = DEFAULT_WA_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// JavaScript is running, so remove the no-js fallback class
document.documentElement.classList.remove("no-js");

document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupHeader();
  setupMobileMenu();
  setupScrollReveal();
  setupImageFallbacks();
  setupServiceQuoteLinks();
  setupQuoteForm();

  document.getElementById("year").textContent = new Date().getFullYear();
});

/* ---------- 2. WhatsApp links ---------- */
// Any element with data-whatsapp gets the correct link
function setupWhatsAppLinks() {
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.href = whatsappLink();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

/* ---------- 3. Header shadow + scroll progress bar ---------- */
function setupHeader() {
  const header = document.getElementById("siteHeader");
  const progress = document.querySelector(".scroll-progress");

  function onScroll() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle("is-scrolled", scrollTop > 12);
    progress.style.transform = `scaleX(${maxScroll > 0 ? scrollTop / maxScroll : 0})`;
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- 4. Mobile menu ---------- */
function setupMobileMenu() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  const iconUse = toggle.querySelector("use");

  function setOpen(open) {
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    iconUse.setAttribute("href", open ? "#i-close" : "#i-menu");
  }

  toggle.addEventListener("click", () => {
    setOpen(!menu.classList.contains("is-open"));
  });

  // Close the menu after tapping a link
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  // Close with the Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Close if the screen is resized to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) setOpen(false);
  });
}

/* ---------- 5. Scroll reveal animations ---------- */
// IntersectionObserver tells us when an element enters the screen
function setupScrollReveal() {
  const targets = document.querySelectorAll(".reveal, #processList");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // animate once only
        }
      });
    },
    { rootMargin: "0px 0px -80px 0px", threshold: 0.1 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- 6. Broken image fallback ---------- */
// If a photo fails to load, hide it so the navy panel shows instead
function setupImageFallbacks() {
  document.querySelectorAll(".photo img").forEach((img) => {
    const markBroken = () => img.classList.add("is-broken");
    if (img.complete && img.naturalWidth === 0) markBroken();
    img.addEventListener("error", markBroken);
  });
}

/* ---------- 7. "Get a quote" on a service card pre-selects that service ---------- */
function setupServiceQuoteLinks() {
  const select = document.getElementById("service");
  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      select.value = link.dataset.service;
    });
  });
}

/* ---------- 8. Quote form ---------- */
// Checks the fields, then opens WhatsApp with the details filled in.
// Later you can swap this for Formspree, EmailJS or your own backend.
function setupQuoteForm() {
  const form = document.getElementById("quoteForm");
  const success = document.getElementById("formSuccess");
  const sendAnother = document.getElementById("sendAnother");

  // Each rule returns an error message, or "" if the value is fine
  const rules = {
    name: (v) => (v.trim() ? "" : "Enter your name."),
    phone: (v) =>
      /^[+\d][\d\s-]{8,}$/.test(v.trim()) ? "" : "Enter a valid phone number, e.g. 082 123 4567.",
    email: (v) =>
      !v || /^\S+@\S+\.\S+$/.test(v) ? "" : "Check the email address format.",
    service: (v) => (v ? "" : "Choose the service you need."),
    message: (v) =>
      v.trim().length >= 10 ? "" : "Tell us a little about the project (at least 10 characters).",
  };

  function showError(field, message) {
    const input = form.elements[field];
    const errorEl = document.getElementById(`${field}-err`);
    errorEl.textContent = message;
    input.classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", Boolean(message));
    if (message) input.setAttribute("aria-describedby", errorEl.id);
    else input.removeAttribute("aria-describedby");
  }

  // Clear a field's error as soon as the user fixes it
  Object.keys(rules).forEach((field) => {
    const input = form.elements[field];
    const event = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(event, () => {
      if (input.classList.contains("has-error")) {
        showError(field, rules[field](input.value));
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let firstInvalid = null;
    Object.keys(rules).forEach((field) => {
      const message = rules[field](form.elements[field].value);
      showError(field, message);
      if (message && !firstInvalid) firstInvalid = form.elements[field];
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const text =
      `New quote request\n\n` +
      `Name: ${data.name}\n` +
      `Phone: ${data.phone}\n` +
      `Email: ${data.email || "-"}\n` +
      `Service: ${data.service}\n\n` +
      `${data.message}`;

    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");

    form.reset();
    form.hidden = true;
    success.hidden = false;
  });

  sendAnother.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
}
