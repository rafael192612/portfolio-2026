import { projects } from "./projects.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);
const hasFinePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;
let portfolioContacts = {};

function escapeHTML(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );
}

function getWhatsAppNumber() {
  const configured = String(portfolioContacts.whatsapp || "").replace(
    /\D/g,
    "",
  );
  if (configured) return configured;
  return $(".whatsapp-float")?.href.match(/wa\.me\/(\d+)/)?.[1] || "";
}

function createWhatsAppUrl(message) {
  const number = getWhatsAppNumber();
  return number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : "#contato";
}

function initMetadata() {
  const cleanUrl = new URL(
    window.location.pathname.replace(/index\.html$/i, "") || "/",
    window.location.origin,
  ).href;
  $('link[rel="canonical"]')?.setAttribute("href", cleanUrl);
  $('meta[property="og:url"]')?.setAttribute("content", cleanUrl);
  ['meta[property="og:image"]', 'meta[name="twitter:image"]'].forEach(
    (selector) => {
      const meta = $(selector);
      if (meta?.content)
        meta.content = new URL(meta.content, document.baseURI).href;
    },
  );
}

async function initContacts() {
  try {
    const response = await fetch("data/contatos.json", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Contact data unavailable");
    portfolioContacts = await response.json();

    $$("[data-contact-link]").forEach((link) => {
      const key = link.dataset.contactLink;
      if (key === "whatsapp") {
        link.href = createWhatsAppUrl(
          "Olá Raphael! Vi seu portfólio e gostaria de conversar sobre um projeto.",
        );
      } else if (portfolioContacts[key]) {
        link.href = portfolioContacts[key];
      }
    });
    $$("[data-contact-text]").forEach((element) => {
      const value = portfolioContacts[element.dataset.contactText];
      if (value) element.textContent = value;
    });

    const form = $("#contact-form");
    if (form && portfolioContacts.formEndpoint) {
      form.dataset.endpoint = portfolioContacts.formEndpoint;
      form.action = portfolioContacts.formEndpoint.replace("/ajax/", "/");
    }

    const schema = $("#person-schema");
    if (schema) {
      const structuredData = JSON.parse(schema.textContent);
      structuredData.name = portfolioContacts.name || structuredData.name;
      structuredData.email = portfolioContacts.email
        ? `mailto:${portfolioContacts.email}`
        : structuredData.email;
      structuredData.sameAs = [
        portfolioContacts.github,
        portfolioContacts.linkedin,
        portfolioContacts.instagram,
      ].filter(Boolean);
      schema.textContent = JSON.stringify(structuredData);
    }
  } catch (error) {
    console.warn("Os contatos padrão do HTML serão utilizados.", error);
  }
}

function initLoader() {
  const loader = $("#site-loader");
  if (!loader) return;
  let hidden = false;
  const hide = () => {
    if (hidden) return;
    hidden = true;
    loader.classList.add("is-hidden");
    document.body.classList.add("is-ready");
    window.setTimeout(() => loader.remove(), 900);
  };
  if (document.readyState === "complete") window.setTimeout(hide, 300);
  else
    window.addEventListener("load", () => window.setTimeout(hide, 300), {
      once: true,
    });
  window.setTimeout(hide, 2200);
}

function initTheme() {
  const toggle = $(".theme-toggle");
  const themeMeta = $('meta[name="theme-color"]');
  const favicon = $("#site-favicon");
  const stored = localStorage.getItem("portfolio-theme");
  const theme =
    stored ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  const apply = (nextTheme) => {
    document.documentElement.dataset.theme = nextTheme;
    toggle?.setAttribute(
      "aria-label",
      nextTheme === "dark" ? "Ativar tema claro" : "Ativar tema escuro",
    );
    themeMeta?.setAttribute(
      "content",
      nextTheme === "dark" ? "#031313" : "#103778",
    );
    const markSource =
      nextTheme === "dark"
        ? "assets/logo/raphael-mark.svg"
        : "assets/logo/raphael-mark-light.svg";
    $$("[data-brand-mark]").forEach((image) => {
      image.src = markSource;
    });
    favicon?.setAttribute("href", markSource);
    window.dispatchEvent(
      new CustomEvent("portfolio:themechange", {
        detail: { theme: nextTheme },
      }),
    );
  };

  apply(theme);
  toggle?.addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
    localStorage.setItem("portfolio-theme", next);
  });
}

function initNavigation() {
  const header = $(".site-header");
  const menuButton = $(".menu-toggle");
  const menu = $(".nav-menu");
  const links = $$('.nav-menu a[href^="#"]');

  const syncHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 30);
    $(".back-to-top")?.classList.toggle("is-visible", window.scrollY > 700);
  };
  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  menuButton?.addEventListener("click", () => {
    const open = menu?.classList.toggle("is-open");
    menuButton.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });

  links.forEach((link) =>
    link.addEventListener("click", () => {
      menu?.classList.remove("is-open");
      menuButton?.classList.remove("is-open");
      menuButton?.setAttribute("aria-expanded", "false");
    }),
  );

  document.addEventListener("click", (event) => {
    if (!menu?.classList.contains("is-open")) return;
    if (!menu.contains(event.target) && !menuButton?.contains(event.target)) {
      menu.classList.remove("is-open");
      menuButton.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });

  const observedSections = links
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);
  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) =>
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${visible.target.id}`,
        ),
      );
    },
    { rootMargin: "-25% 0px -58%", threshold: [0.05, 0.25, 0.5] },
  );
  observedSections.forEach((section) => activeObserver.observe(section));

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !menu?.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menuButton?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.focus();
  });

  $(".back-to-top")?.addEventListener("click", () =>
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    }),
  );
}

function initTyping() {
  const target = $("#typing-role");
  if (!target || prefersReducedMotion.matches) return;
  const roles = [
    "Full Stack",
    "UI/UX Designer",
    "Freelancer",
    "Problem Solver",
    "Creative Developer",
  ];
  let roleIndex = 0;
  let characterIndex = roles[0].length;
  let deleting = true;

  const tick = () => {
    const role = roles[roleIndex];
    characterIndex += deleting ? -1 : 1;
    target.textContent = role.slice(0, characterIndex);

    let delay = deleting ? 55 : 85;
    if (!deleting && characterIndex === role.length) {
      deleting = true;
      delay = 1500;
    } else if (deleting && characterIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 380;
    }
    window.setTimeout(tick, delay);
  };
  window.setTimeout(tick, 1700);
}

function initProfileSwap() {
  const visual = $(".hero__visual");
  const trigger = $(".hero__avatar", visual || document);
  const mainSource = $('[data-profile-source="main"]', visual || document);
  const mainImage = $('[data-profile-image="main"]', visual || document);
  if (!visual || !trigger || !mainSource || !mainImage) return;

  const profiles = {
    photo: {
      src: "assets/images/raphael-cutout-2026.png",
      srcset: "assets/images/raphael-cutout-2026.png",
      width: "1024",
      height: "1536",
      alt: "Retrato profissional de Raphael Sillva sem fundo",
    },
    avatar: {
      dark: {
        src: "assets/avatar/raphael-avatar.png",
        srcset: "assets/avatar/raphael-avatar.png",
        width: "1024",
        height: "1536",
        alt: "Avatar 3D de Raphael Sillva com roupa escura",
      },
      light: {
        src: "assets/avatar/raphael-avatar-light.png",
        srcset: "assets/avatar/raphael-avatar-light.png",
        width: "1024",
        height: "1536",
        alt: "Avatar 3D de Raphael Sillva com roupa azul",
      },
    },
  };
  let avatarIsMain = true;
  let swapping = false;

  const applyProfile = (source, image, profile) => {
    source.srcset = profile.srcset;
    source.sizes = "(max-width: 850px) 90vw, 48vw";
    image.src = profile.src;
    image.width = Number(profile.width);
    image.height = Number(profile.height);
    image.alt = profile.alt;
    image.loading = "eager";
  };

  const activeAvatar = () =>
    profiles.avatar[
      document.documentElement.dataset.theme === "dark" ? "dark" : "light"
    ];

  applyProfile(mainSource, mainImage, activeAvatar());
  trigger.setAttribute("aria-pressed", "true");
  trigger.setAttribute("aria-label", "Mostrar fotografia real no destaque");

  window.addEventListener("portfolio:themechange", () => {
    if (!avatarIsMain || swapping) return;
    visual.classList.add("is-swapping");
    const delay = prefersReducedMotion.matches ? 0 : 180;
    window.setTimeout(() => {
      applyProfile(mainSource, mainImage, activeAvatar());
      requestAnimationFrame(() => visual.classList.remove("is-swapping"));
    }, delay);
  });

  trigger.addEventListener("click", () => {
    if (swapping) return;
    swapping = true;
    visual.classList.add("is-swapping");
    trigger.classList.add("is-rotating");
    const delay = prefersReducedMotion.matches ? 0 : 300;

    window.setTimeout(() => {
      avatarIsMain = !avatarIsMain;
      applyProfile(
        mainSource,
        mainImage,
        avatarIsMain ? activeAvatar() : profiles.photo,
      );
      trigger.setAttribute("aria-pressed", String(avatarIsMain));
      trigger.setAttribute(
        "aria-label",
        avatarIsMain
          ? "Mostrar fotografia real no destaque"
          : "Mostrar avatar 3D no destaque",
      );
      requestAnimationFrame(() => {
        visual.classList.remove("is-swapping");
        window.setTimeout(
          () => {
            trigger.classList.remove("is-rotating");
            swapping = false;
          },
          prefersReducedMotion.matches ? 0 : 300,
        );
      });
    }, delay);
  });
}

let revealObserver;
function initReveal() {
  if (prefersReducedMotion.matches) {
    $$(".reveal").forEach((element) => element.classList.add("is-visible"));
    return;
  }
  revealObserver ??= new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -7%" },
  );
  $$(".reveal:not(.is-observed)").forEach((element, index) => {
    element.classList.add("is-observed");
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(element);
  });
}

function initManifesto() {
  const section = $(".manifesto");
  if (!section || prefersReducedMotion.matches) return;
  const scenes = $$("[data-scene]", section);
  let frameRequested = false;

  const update = () => {
    const bounds = section.getBoundingClientRect();
    const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-bounds.top / scrollable, 0), 1);
    document.documentElement.style.setProperty(
      "--manifest-progress",
      progress.toFixed(4),
    );
    const sceneIndex = Math.min(
      Math.floor(progress * scenes.length),
      scenes.length - 1,
    );
    scenes.forEach((scene, index) =>
      scene.classList.toggle("is-active", index === sceneIndex),
    );
    frameRequested = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (frameRequested) return;
      frameRequested = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

function projectCardTemplate(project, index) {
  return `
    <article class="project-card reveal" data-project-card data-project-id="${escapeHTML(project.id)}" data-category="${escapeHTML(project.category)}" style="--project-gradient:${project.gradient}">
      <div class="project-card__visual" aria-hidden="true"><div class="project-card__mock"><div class="project-card__lines"><i></i><i></i><i></i></div></div></div>
      <div class="project-card__content">
        <div class="project-card__meta"><span>${String(index + 1).padStart(2, "0")}</span><span>${escapeHTML(project.status)}</span></div>
        <h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.description)}</p>
      </div>
      <button class="project-card__action" type="button" aria-label="Ver detalhes de ${escapeHTML(project.title)}" data-open-project="${escapeHTML(project.id)}">↗</button>
    </article>`;
}

function initProjects() {
  const grid = $("#projects-grid");
  if (!grid) return;
  grid.innerHTML = projects.map(projectCardTemplate).join("");

  $$("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      $$("[data-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      $$("[data-project-card]").forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
      });
    }),
  );

  $$("[data-open-project]").forEach((button) =>
    button.addEventListener("click", () =>
      openProject(button.dataset.openProject),
    ),
  );
}

function openProject(projectId) {
  const project = projects.find((item) => item.id === projectId);
  const modal = $("#project-modal");
  if (!project || !modal) return;

  $("#modal-visual").style.setProperty("--modal-gradient", project.gradient);
  $("#modal-category").textContent = project.categoryLabel;
  $("#modal-status").textContent = project.status;
  $("#modal-title").textContent = project.title;
  $("#modal-description").textContent = project.description;
  $("#modal-problem").textContent = project.problem;
  $("#modal-solution").textContent = project.solution;
  $("#modal-challenges").textContent = project.challenges;
  $("#modal-tech").innerHTML = project.technologies
    .map((tech) => `<span>${escapeHTML(tech)}</span>`)
    .join("");

  const links = [];
  if (project.github)
    links.push(
      `<a class="button button--secondary" href="${escapeHTML(project.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`,
    );
  if (project.demo)
    links.push(
      `<a class="button button--primary" href="${escapeHTML(project.demo)}" target="_blank" rel="noopener noreferrer">Ver demonstração ↗</a>`,
    );
  $("#modal-links").innerHTML = links.length
    ? links.join("")
    : '<a class="button button--primary" href="#contato" data-project-contact>Quero uma solução semelhante ↗</a>';
  $("[data-project-contact]", modal)?.addEventListener("click", () => {
    modal.close?.();
    modal.removeAttribute("open");
    document.body.classList.remove("modal-open");
  });

  document.body.classList.add("modal-open");
  if (typeof modal.showModal === "function") modal.showModal();
  else modal.setAttribute("open", "");
}

function initModal() {
  const modal = $("#project-modal");
  if (!modal) return;
  const close = () => {
    modal.close?.();
    modal.removeAttribute("open");
    document.body.classList.remove("modal-open");
  };
  $(".project-modal__close", modal)?.addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  modal.addEventListener("close", () =>
    document.body.classList.remove("modal-open"),
  );
}

function initTilt() {
  if (!hasFinePointer || prefersReducedMotion.matches) return;
  $$("[data-tilt], [data-project-card]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-3px)`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });

  const heroVisual = $("[data-tilt-area]");
  const portrait = heroVisual ? $(".hero__portrait", heroVisual) : null;
  heroVisual?.addEventListener("pointermove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    if (portrait)
      portrait.style.transform = `translate(${x * 8}px, ${y * 6 - 3}px) scale(1.01)`;
  });
  heroVisual?.addEventListener("pointerleave", () => {
    if (portrait) portrait.style.transform = "";
  });
}

function initContextCursor() {
  if (!hasFinePointer) return;
  const cursor = $(".context-cursor");
  if (!cursor) return;
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  window.addEventListener(
    "pointermove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    },
    { passive: true },
  );
  const animate = () => {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(animate);
  };
  animate();
  $$("[data-project-card]").forEach((card) => {
    card.addEventListener("pointerenter", () =>
      cursor.classList.add("is-visible"),
    );
    card.addEventListener("pointerleave", () =>
      cursor.classList.remove("is-visible"),
    );
  });
}

function initWhatsAppPrompt() {
  const button = $(".whatsapp-float");
  if (!button || sessionStorage.getItem("whatsapp-prompt-seen")) return;
  window.setTimeout(() => {
    if (document.hidden) return;
    button.classList.add("is-calling");
    sessionStorage.setItem("whatsapp-prompt-seen", "true");
    window.setTimeout(() => button.classList.remove("is-calling"), 5200);
  }, 12000);
}

function validateForm(form) {
  let valid = true;
  $$("[required]", form).forEach((field) => {
    const row = field.closest(".form-row");
    const error = $(".field-error", row);
    let message = "";
    if (!field.value.trim()) message = "Este campo é obrigatório.";
    else if (
      field.type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)
    )
      message = "Informe um e-mail válido.";
    row?.classList.toggle("is-invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (error) error.textContent = message;
    if (message) valid = false;
  });
  return valid;
}

function initContactForm() {
  const form = $("#contact-form");
  const status = $("#form-status");
  if (!form) return;

  form.addEventListener("input", (event) => {
    const row = event.target.closest(".form-row");
    row?.classList.remove("is-invalid");
    const error = row && $(".field-error", row);
    if (error) error.textContent = "";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateForm(form)) {
      status.textContent = "Revise os campos destacados.";
      $(
        ".is-invalid input, .is-invalid select, .is-invalid textarea",
        form,
      )?.focus();
      return;
    }

    const button = $('button[type="submit"]', form);
    const buttonText = $("span", button);
    const data = Object.fromEntries(new FormData(form));
    const endpoint = form.dataset.endpoint?.trim();
    button.classList.add("is-loading");
    button.disabled = true;
    buttonText.textContent = "Enviando...";
    status.textContent = "";

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!response.ok) throw new Error("Form endpoint error");
        status.textContent =
          "Mensagem enviada com sucesso. Obrigado pelo contato!";
        form.reset();
      } else {
        const text = `Olá Raphael! Meu nome é ${data.name}.\nE-mail: ${data.email}\nEmpresa: ${data.company || "Não informada"}\nProjeto: ${data.projectType}\nOrçamento: ${data.budget || "A conversar"}\n\n${data.message}`;
        window.open(createWhatsAppUrl(text), "_blank", "noopener,noreferrer");
        status.textContent =
          "Conversa preparada no WhatsApp. Se a janela não abrir, use o botão flutuante.";
      }
    } catch {
      const text = `Olá Raphael! Meu nome é ${data.name}.\nE-mail: ${data.email}\nEmpresa: ${data.company || "Não informada"}\nProjeto: ${data.projectType}\nOrçamento: ${data.budget || "A conversar"}\n\n${data.message}`;
      status.textContent = "O envio por e-mail não respondeu. ";
      const fallback = document.createElement("a");
      fallback.href = createWhatsAppUrl(text);
      fallback.target = "_blank";
      fallback.rel = "noopener noreferrer";
      fallback.textContent = "Continuar pelo WhatsApp ↗";
      status.append(fallback);
    } finally {
      button.classList.remove("is-loading");
      button.disabled = false;
      buttonText.textContent = "Quero conversar";
    }
  });
}

function initImageFallbacks() {
  $$("img").forEach((image) =>
    image.addEventListener(
      "error",
      () => {
        image.hidden = true;
        image.parentElement?.classList.add("has-image-error");
      },
      { once: true },
    ),
  );
}

async function init() {
  window.clearTimeout(window.__portfolioFallback);
  initLoader();
  initMetadata();
  initTheme();
  initNavigation();
  initTyping();
  initProfileSwap();
  initProjects();
  initModal();
  initReveal();
  initManifesto();
  initTilt();
  initContextCursor();
  await initContacts();
  initWhatsAppPrompt();
  initContactForm();
  initImageFallbacks();
  $("#current-year").textContent = new Date().getFullYear();
}

init().catch((error) => {
  console.error("Não foi possível inicializar o portfólio.", error);
  document.documentElement.classList.remove("js");
});
