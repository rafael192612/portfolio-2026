(() => {
  const projects = [
    {
      id: "projeto-01",
      title: "Primeiro projeto em breve",
      description: "Novos projetos serão publicados aqui conforme forem concluídos.",
      preview: "",
      url: "#",
      technologies: [],
      status: "coming-soon",
    },
  ];

  const projectsList = document.querySelector("[data-projects-list]");
  const modal = document.querySelector("[data-project-modal]");
  if (!projectsList || !modal) return;

  const modalPanel = modal.querySelector(".project-modal__panel");
  const modalClose = modal.querySelector("[data-project-modal-close]");
  const modalStatus = modal.querySelector("[data-project-modal-status]");
  const modalPreview = modal.querySelector("[data-project-modal-preview]");
  const modalTitle = modal.querySelector("[data-project-modal-title]");
  const modalDescription = modal.querySelector("[data-project-modal-description]");
  const modalTechnologies = modal.querySelector("[data-project-modal-technologies]");
  const modalLink = modal.querySelector("[data-project-modal-link]");
  const backgroundElements = [...document.body.children].filter((element) => element !== modal);
  const previousAriaHidden = new Map();
  let lastFocusedElement = null;

  function statusLabel(status) {
    return status === "published" ? "Projeto publicado" : "Em breve";
  }

  function createPreview(project, className) {
    const preview = document.createElement("div");
    preview.className = className;

    if (project.preview) {
      const image = document.createElement("img");
      image.src = project.preview;
      image.alt = `Prévia do projeto ${project.title}`;
      image.loading = "lazy";
      preview.append(image);
    } else {
      const placeholder = document.createElement("span");
      placeholder.textContent = "Prévia em breve";
      preview.append(placeholder);
    }

    return preview;
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("projects-modal-open");
    backgroundElements.forEach((element) => {
      if ("inert" in element) element.inert = false;
      if (previousAriaHidden.has(element)) {
        const value = previousAriaHidden.get(element);
        if (value === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", value);
      }
    });
    previousAriaHidden.clear();
    lastFocusedElement?.focus();
  }

  function isolateBackground() {
    backgroundElements.forEach((element) => {
      if ("inert" in element) {
        element.inert = true;
        return;
      }

      previousAriaHidden.set(element, element.getAttribute("aria-hidden"));
      element.setAttribute("aria-hidden", "true");
    });
  }

  function openModal(project, trigger) {
    lastFocusedElement = trigger;
    modalStatus.textContent = statusLabel(project.status);
    modalTitle.textContent = project.title;
    modalDescription.textContent = project.description;
    modalPreview.replaceChildren(...createPreview(project, "project-modal__preview").childNodes);
    modalTechnologies.replaceChildren();

    project.technologies.forEach((technology) => {
      const item = document.createElement("li");
      item.textContent = technology;
      modalTechnologies.append(item);
    });
    modalTechnologies.hidden = project.technologies.length === 0;

    const published = project.status === "published" && project.url !== "#";
    modalLink.href = published ? project.url : "#";
    modalLink.textContent = published ? "Abrir projeto ↗" : "Projeto indisponível";
    modalLink.setAttribute("aria-disabled", String(!published));
    modalLink.target = published ? "_blank" : "";
    modalLink.rel = published ? "noopener noreferrer" : "";

    modal.hidden = false;
    document.body.classList.add("projects-modal-open");
    isolateBackground();
    modalClose.focus();
  }

  projects.forEach((project) => {
    const card = document.createElement("article");
    const status = document.createElement("p");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const button = document.createElement("button");

    card.className = "project-card";
    card.id = project.id;
    status.className = "project-card__status";
    description.className = "project-card__description";
    button.className = "project-card__button";
    button.type = "button";

    status.textContent = statusLabel(project.status);
    title.textContent = project.title;
    description.textContent = project.description;
    button.textContent = project.status === "published" ? "Ver projeto" : "Ver detalhes";
    button.addEventListener("click", () => openModal(project, button));

    card.append(createPreview(project, "project-card__preview"), status, title, description, button);
    projectsList.append(card);
  });

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  modalLink.addEventListener("click", (event) => {
    if (modalLink.getAttribute("aria-disabled") === "true") event.preventDefault();
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;
    const focusableElements = [...modalPanel.querySelectorAll("button, a[href]")]
      .filter((element) => element.getAttribute("aria-disabled") !== "true");
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });
})();
