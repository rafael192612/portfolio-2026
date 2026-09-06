import { observeVisibility } from "./visibility.js";

export function initScrollReveal() {

  function initReveals() {
    const elements = [...document.querySelectorAll("[data-reveal]")];
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!elements.length || motionPreference.matches || !("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("reveal-enabled");

    elements.forEach((element) => {
      const enterDelay = Math.min(Math.max(Number(element.dataset.revealDelay) || 0, 0), 300);
      element.style.setProperty("--reveal-delay", `${enterDelay}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const enterDelay = Math.min(Math.max(Number(entry.target.dataset.revealDelay) || 0, 0), 300);
          entry.target.style.setProperty("--reveal-delay", `${enterDelay}ms`);
          entry.target.classList.add("is-revealed");
        } else if (!entry.isIntersecting) {
          const exitDelay = Math.min(Math.max(Number(entry.target.dataset.revealExitDelay) || 0, 0), 300);
          entry.target.style.setProperty("--reveal-delay", `${exitDelay}ms`);
          entry.target.classList.remove("is-revealed");
        }
      });
    }, {
      rootMargin: "0px",
      threshold: 0,
    });

    elements.forEach((element) => observer.observe(element));
    motionPreference.addEventListener("change", (event) => {
      document.documentElement.classList.toggle("reveal-enabled", !event.matches);
    });
  }

  initReveals();

  const method = document.querySelector(".about__method");
  if (method) {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let progressFrame = 0;
    let methodVisible = false;
    observeVisibility(method, (visible) => { methodVisible = visible; if (visible) requestProgress(); });

    function updateProgress() {
      progressFrame = 0;
      const rect = method.getBoundingClientRect();
      // Fill as each part of the method crosses the viewport's reading line.
      const progress = motionPreference.matches ? 1
        : Math.min(1, Math.max(0, (window.innerHeight * 0.7 - rect.top) / Math.max(rect.height, 1)));
      method.style.setProperty("--about-scroll-progress", progress.toFixed(4));
    }

    function requestProgress() {
      if (!methodVisible || document.hidden) return;
      if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
    }

    window.addEventListener("scroll", requestProgress, { passive: true });
    window.addEventListener("resize", requestProgress);
    window.addEventListener("vertex:themechange", requestProgress);
    motionPreference.addEventListener("change", requestProgress);
    if ("ResizeObserver" in window) new ResizeObserver(requestProgress).observe(method);
    updateProgress();
  }

}
