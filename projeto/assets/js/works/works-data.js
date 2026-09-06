export function safeUrl(value, { local = false } = {}) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim(), document.baseURI);
    if (url.username || url.password) return "";
    if (url.protocol === "https:" || (local && url.origin === location.origin
      && url.protocol === "http:")) return url.href;
  } catch { /* Invalid URLs are omitted, never executed. */ }
  return "";
}

const text = (value, fallback = "") => typeof value === "string" ? value.trim() || fallback : fallback;

export function validateWorks(items) {
  if (!Array.isArray(items)) return [];
  const ids = new Set();
  return items.flatMap((item) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)
      || ids.has(item.id) || !text(item.title) || !text(item.description)
      || !Array.isArray(item.technologies)) {
      console.warn("Trabalho ignorado: confira id único, título, descrição e tecnologias no cadastro.");
      return [];
    }
    ids.add(item.id);
    // Only a CSS gradient of hex colors and optional positions; no url()/var().
    const gradient = text(item.gradient);
    const safeGradient = /^linear-gradient\(\s*\d{1,3}deg\s*,\s*#[\da-f]{3,8}(?:\s+\d{1,3}%)?(?:\s*,\s*#[\da-f]{3,8}(?:\s+\d{1,3}%)?){1,5}\s*\)$/i.test(gradient)
      && CSS.supports("background-image", gradient) ? gradient : "";
    return [{
      id: item.id, title: text(item.title), description: text(item.description),
      category: text(item.category), categoryLabel: text(item.categoryLabel, "Presença digital"),
      status: text(item.status, "Trabalho"), problem: text(item.problem),
      solution: text(item.solution), challenges: text(item.challenges),
      technologies: item.technologies.filter((entry) => typeof entry === "string" && entry.trim()).map((entry) => entry.trim()),
      gradient: safeGradient, github: safeUrl(item.github), demo: safeUrl(item.demo),
      image: safeUrl(item.image, { local: true }),
      gallery: Array.isArray(item.gallery) ? item.gallery.map((url) => safeUrl(url, { local: true })).filter(Boolean) : [],
    }];
  });
}

export function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

export function createPreview(work, className) {
  const preview = element("div", className);
  if (work.gradient) preview.style.backgroundImage = work.gradient;
  if (work.image) {
    const image = element("img");
    image.alt = `Prévia de ${work.title}`;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      preview.replaceChildren(element("span", "", "Prévia indisponível"));
    }, { once: true });
    image.src = work.image;
    preview.append(image);
  } else preview.append(element("span", "", "Prévia em preparação"));
  return preview;
}

export function createTechnologies(work) {
  const list = element("ul", "project-modal__technologies");
  list.setAttribute("aria-label", "Tecnologias utilizadas");
  work.technologies.forEach((technology) => list.append(element("li", "", technology)));
  list.hidden = !work.technologies.length;
  return list;
}
