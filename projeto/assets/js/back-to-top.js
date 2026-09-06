export function initBackToTop() {

  const hero = document.querySelector(".hero");
  const button = document.querySelector("[data-back-to-top]");
  if (!hero || !button) return;

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setButtonVisibility(isVisible) {
    button.classList.toggle("is-visible", isVisible);
    button.setAttribute("aria-hidden", String(!isVisible));
    if (isVisible) button.removeAttribute("tabindex");
    else button.setAttribute("tabindex", "-1");
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      setButtonVisibility(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
    }, { threshold: 0 });
    observer.observe(hero);
  } else setButtonVisibility(true);

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: motionPreference.matches ? "auto" : "smooth",
    });
  });

}
