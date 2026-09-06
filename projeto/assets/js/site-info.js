import { SITE_CONFIG } from "./config.js";
import { safeUrl } from "./works/works-data.js";

export function initSiteInfo() {
  document.querySelectorAll("[data-brand-name]").forEach((node) => { node.textContent = SITE_CONFIG.brand.name; });
  document.querySelectorAll("[data-brand-author]").forEach((node) => { node.textContent = SITE_CONFIG.brand.author; });
  document.querySelectorAll("[data-social]").forEach((node) => {
    const url = safeUrl(SITE_CONFIG.social[node.dataset.social]);
    node.hidden = !url;
    if (url) { node.href = url; node.rel = "noopener noreferrer"; }
  });
  const email = SITE_CONFIG.contact.email;
  document.querySelectorAll("[data-contact-email]").forEach((node) => {
    node.hidden = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!node.hidden) { node.textContent = email; node.href = `mailto:${encodeURIComponent(email)}`; }
  });
}
