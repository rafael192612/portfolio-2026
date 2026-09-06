import { element, createPreview, createTechnologies } from "./works-data.js";
import { isolateBackground, trapTab, lockScroll } from "../dialog-accessibility.js";

let closeCurrent = null;

export function openWorkModal(work, trigger) {
  closeCurrent?.();
  const modal = document.querySelector("[data-project-modal]");
  const panel = modal?.querySelector(".project-modal__panel");
  if (!panel) throw new Error("Modal ausente.");
  const close = element("button", "project-modal__close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Fechar detalhes do trabalho");
  const title = element("h2", "", work.title);
  title.id = "project-modal-title";
  const description = element("p", "", work.description);
  description.id = "project-modal-description";
  panel.replaceChildren(close, element("p", "project-modal__status", `${work.categoryLabel} · ${work.status}`),
    createPreview(work, "project-modal__preview"), title, description);
  for (const [key, label] of [["problem", "Necessidade"], ["solution", "Solução"], ["challenges", "Desafios"]]) {
    if (!work[key]) continue;
    const section = element("section", "work-detail");
    section.append(element("h3", "", label), element("p", "", work[key]));
    panel.append(section);
  }
  panel.append(createTechnologies(work));
  if (work.gallery.length) {
    const gallery = element("div", "work-gallery");
    work.gallery.forEach((image, index) => gallery.append(createPreview({ ...work, image, title: `${work.title} — imagem ${index + 1}` }, "project-modal__preview")));
    panel.append(gallery);
  }
  for (const [url, label] of [[work.demo, "Abrir site ↗"], [work.github, "Ver código ↗"]]) {
    if (!url) continue;
    const link = element("a", "project-modal__link", label);
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    panel.append(link);
  }
  modal.hidden = false;
  panel.scrollTop = 0;
  close.focus({ preventScroll: true });
  const restoreBackground = isolateBackground([modal]);
  const restoreScroll = lockScroll();
  document.body.classList.add("projects-modal-open");
  function onKey(event) {
    if (event.key === "Escape") { event.preventDefault(); closeModal(); }
    else trapTab(event, panel);
  }
  function onFocus(event) {
    if (!panel.contains(event.target)) close.focus({ preventScroll: true });
  }
  function onOverlay(event) { if (event.target === modal) closeModal(); }
  function closeModal() {
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("focusin", onFocus);
    modal.removeEventListener("click", onOverlay);
    modal.hidden = true;
    document.body.classList.remove("projects-modal-open");
    restoreBackground();
    restoreScroll();
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    closeCurrent = null;
  }
  close.addEventListener("click", closeModal, { once: true });
  modal.addEventListener("click", onOverlay);
  document.addEventListener("keydown", onKey);
  document.addEventListener("focusin", onFocus);
  closeCurrent = closeModal;
}
