import { initSiteInfo } from "./site-info.js";
import { initTheme } from "./theme.js";
import { initNavigation } from "./navigation.js";
import { initHero } from "./hero.js";
import { initWorks } from "./works/works-renderer.js";
import { initScrollReveal } from "./scroll-reveal.js";
import { initContactForm } from "./contact-form.js";
import { initCustomSelects } from "./custom-select.js";
import { initWhatsApp } from "./whatsapp.js";
import { initBackToTop } from "./back-to-top.js";
import { initParticles } from "./particle-background.js";

// Explicit ordering: render before reveal; enhance selects before form validation.
for (const initialize of [initTheme, initSiteInfo, initNavigation, initHero, initWorks,
  initScrollReveal, initCustomSelects, initContactForm, initWhatsApp,
  initBackToTop, initParticles]) {
  try { initialize(); }
  catch (error) { console.error(`Falha ao iniciar ${initialize.name}.`, error); }
}
