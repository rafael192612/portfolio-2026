import { trabalhos } from "./trabalhos.js";
import { validateWorks, element, createPreview, createTechnologies } from "./works-data.js";

export function initWorks() {
  const list = document.querySelector("[data-projects-list]");
  if (!list || list.dataset.initialized) return;
  list.dataset.initialized = "true";
  const works = validateWorks(trabalhos);
  if (!works.length) return; // Intentional HTML empty state also works without JS.
  const fragment = document.createDocumentFragment();
  works.forEach((work, index) => {
    const card = element("article", "project-card");
    card.dataset.reveal = "up";
    card.dataset.revealDelay = String(Math.min(index * 60, 240));
    const button = element("button", "project-card__button", "Ver detalhes");
    button.type = "button";
    button.setAttribute("aria-label", `Ver detalhes de ${work.title}`);
    button.setAttribute("aria-haspopup", "dialog");
    const status = element("p", "works-feedback");
    status.setAttribute("role", "status");
    button.addEventListener("click", async () => {
      if (button.getAttribute("aria-busy") === "true") return;
      button.setAttribute("aria-busy", "true");
      status.textContent = "";
      try {
        const { openWorkModal } = await import("./works-modal.js");
        openWorkModal(work, button);
      } catch {
        status.textContent = "Não foi possível abrir os detalhes. Tente novamente.";
      } finally { button.removeAttribute("aria-busy"); }
    });
    card.append(createPreview(work, "project-card__preview"),
      element("p", "project-card__status", `${work.categoryLabel} · ${work.status}`),
      element("h3", "", work.title), element("p", "project-card__description", work.description),
      createTechnologies(work), button, status);
    fragment.append(card);
  });
  list.replaceChildren(fragment);
}
