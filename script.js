(() => {
  "use strict";

  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const modal = document.getElementById("leadModal");
  const leadForm = document.getElementById("leadForm");
  const packageSelect = document.getElementById("paquete");
  const formError = document.getElementById("formError");
  const openers = [...document.querySelectorAll(".js-open-modal")];
  const closers = [...document.querySelectorAll("[data-close-modal]")];
  let lastFocused = null;
  let wasAtBottom = false;

  const setHeader = () => header?.classList.toggle("scrolled", window.scrollY > 16);
  setHeader();
  window.addEventListener("scroll", setHeader, { passive: true });

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  navMenu?.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openModal(packageName = "") {
    if (!modal) return;
    lastFocused = document.activeElement;
    if (packageName && packageSelect) packageSelect.value = packageName;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.setTimeout(() => modal.querySelector("input")?.focus(), 40);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  openers.forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.package || ""));
  });
  closers.forEach((el) => el.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (!modal?.classList.contains("active")) return;
    if (event.key === "Escape") closeModal();
    if (event.key !== "Tab") return;
    const focusables = [...modal.querySelectorAll(focusableSelector)].filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Auto-abre el formulario al llegar al final del scroll (una vez por visita al fondo).
  window.addEventListener("scroll", () => {
    const doc = document.documentElement;
    const distanceToBottom = doc.scrollHeight - (window.scrollY + window.innerHeight);
    const isAtBottom = distanceToBottom <= 8;
    if (isAtBottom && !wasAtBottom && !modal?.classList.contains("active")) openModal();
    wasAtBottom = isAtBottom;
  }, { passive: true });

  document.querySelectorAll("[data-accordion] .faq-item").forEach((item, idx) => {
    const button = item.querySelector(".faq-question");
    const icon = button.querySelector("span");
    button.addEventListener("click", () => {
      const accordion = item.closest("[data-accordion]");
      const shouldOpen = !item.classList.contains("open");
      accordion.querySelectorAll(".faq-item").forEach((it) => {
        it.classList.remove("open");
        it.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        it.querySelector(".faq-question span").textContent = "+";
      });
      if (shouldOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        icon.textContent = "−";
      }
    });
  });

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 })
    : null;

  document.querySelectorAll(".reveal").forEach((el) => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add("visible");
  });

  leadForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    formError.textContent = "";
    if (!leadForm.checkValidity()) {
      formError.textContent = "Completa los campos obligatorios.";
      leadForm.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(leadForm).entries());
    data.fecha = new Date().toISOString();
    try {
      sessionStorage.setItem("iconaLead", JSON.stringify(data));
      window.location.assign("gracias.html");
    } catch (error) {
      formError.textContent = "No pudimos guardar tus datos. Intenta de nuevo.";
      console.error(error);
    }
  });
})();
