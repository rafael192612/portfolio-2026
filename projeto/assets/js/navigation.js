import { isolateBackground, trapTab, lockScroll } from "./dialog-accessibility.js";

export function initNavigation() {
  const siteHeader = document.querySelector(".site-header");
  const headerActivationZone = document.createElement("div");
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
  const HEADER_IDLE_DELAY = 2500;
  let headerIdleTimer = 0;
  let headerScrollFrameId = 0;
  let lastHeaderScrollY = window.scrollY;
  let pointerNearHeader = false;

  headerActivationZone.className = "header-activation-zone";
  headerActivationZone.setAttribute("aria-hidden", "true");
  document.body.append(headerActivationZone);

  function headerHasFocus() {
    return Boolean(
      siteHeader?.contains(document.activeElement) &&
      document.activeElement?.matches(":focus-visible"),
    );
  }

  function clearHeaderIdleTimer() {
    window.clearTimeout(headerIdleTimer);
    headerIdleTimer = 0;
  }

  function hideHeader() {
    headerIdleTimer = 0;
    if (!siteHeader || window.scrollY <= 4 || pointerNearHeader || headerHasFocus()) return;
    siteHeader.classList.add("is-hidden");
    headerActivationZone.classList.add("is-active");
  }

  function scheduleHeaderHide(delay = HEADER_IDLE_DELAY) {
    if (window.scrollY <= 4 || pointerNearHeader || headerHasFocus()) return;
    if (headerIdleTimer) return;
    headerIdleTimer = window.setTimeout(hideHeader, delay);
  }

  function showHeader({ scheduleHide = true } = {}) {
    siteHeader?.classList.remove("is-hidden");
    headerActivationZone.classList.remove("is-active");
    clearHeaderIdleTimer();
    if (scheduleHide) scheduleHeaderHide();
  }

  function updateHeader() {
    headerScrollFrameId = 0;
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastHeaderScrollY;
    siteHeader?.classList.toggle("is-scrolled", currentScrollY > 0);

    if (currentScrollY <= 4) {
      showHeader({ scheduleHide: false });
    } else if (scrollDelta < -6 && coarsePointer.matches) {
      showHeader();
    } else if (scrollDelta > 0) {
      scheduleHeaderHide(coarsePointer.matches ? 650 : HEADER_IDLE_DELAY);
    }

    lastHeaderScrollY = currentScrollY;
  }

  function requestHeaderUpdate() {
    if (headerScrollFrameId) return;
    headerScrollFrameId = window.requestAnimationFrame(updateHeader);
  }

  updateHeader();
  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });

  siteHeader?.addEventListener("pointerenter", () => {
    pointerNearHeader = true;
    showHeader({ scheduleHide: false });
  });
  siteHeader?.addEventListener("pointerleave", () => {
    pointerNearHeader = false;
    clearHeaderIdleTimer();
    hideHeader();
  });
  siteHeader?.addEventListener("focusin", () => showHeader({ scheduleHide: false }));
  siteHeader?.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!headerHasFocus()) scheduleHeaderHide();
    }, 0);
  });

  const mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const mobileMenuClose = document.querySelector("[data-mobile-menu-close]");
  const mobileMenuOverlay = document.querySelector("[data-mobile-menu-overlay]");
  const mobileMenuLinks = [...document.querySelectorAll(".mobile-menu__nav a")];
  let mobileMenuReturnFocus = null;
  let restoreMenuBackground = () => {};
  let restoreMenuScroll = () => {};

  function closeMobileMenu({ returnFocus = true } = {}) {
    if (!mobileMenu || !mobileMenuToggle) return;
    if (!mobileMenu.classList.contains("is-open")) return;
    restoreMenuBackground();
    restoreMenuScroll();
    mobileMenu.classList.remove("is-open");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileMenuToggle.setAttribute("aria-label", "Abrir menu");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.setAttribute("inert", "");
    mobileMenuOverlay?.setAttribute("hidden", "");
    document.body.classList.remove("mobile-menu-open");
    if (returnFocus) (mobileMenuReturnFocus || mobileMenuToggle).focus();
    mobileMenuReturnFocus = null;
  }

  function openMobileMenu() {
    if (!mobileMenu || !mobileMenuToggle) return;
    mobileMenuReturnFocus = document.activeElement;
    mobileMenuOverlay?.removeAttribute("hidden");
    mobileMenu.removeAttribute("inert");
    mobileMenu.setAttribute("aria-hidden", "false");
    mobileMenuToggle.setAttribute("aria-expanded", "true");
    mobileMenuToggle.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("mobile-menu-open");
    mobileMenu.classList.add("is-open");
    mobileMenuClose?.focus();
    restoreMenuBackground = isolateBackground([mobileMenu, mobileMenuOverlay]);
    restoreMenuScroll = lockScroll();
  }

  mobileMenuToggle?.addEventListener("click", () => {
    if (mobileMenu?.classList.contains("is-open")) closeMobileMenu();
    else openMobileMenu();
  });
  mobileMenuClose?.addEventListener("click", () => closeMobileMenu());
  mobileMenuOverlay?.addEventListener("click", () => closeMobileMenu());
  mobileMenuLinks.forEach((link) => link.addEventListener("click", () => {
    closeMobileMenu({ returnFocus: false });
    const target = document.querySelector(link.hash);
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
  }));
  document.addEventListener("keydown", (event) => {
    if (!mobileMenu?.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMobileMenu();
      return;
    }
    trapTab(event, mobileMenu);
  });
  document.addEventListener("focusin", (event) => {
    if (mobileMenu?.classList.contains("is-open") && !mobileMenu.contains(event.target)) mobileMenuClose?.focus();
  });
  const desktopMenu = matchMedia("(min-width: 48.001rem)");
  desktopMenu.addEventListener("change", (event) => {
    if (event.matches && mobileMenu?.classList.contains("is-open")) {
      closeMobileMenu({ returnFocus: false });
      siteHeader?.querySelector("a")?.focus({ preventScroll: true });
    }
  });
  headerActivationZone.addEventListener("pointerenter", () => {
    pointerNearHeader = true;
    showHeader({ scheduleHide: false });
  });
  headerActivationZone.addEventListener("pointerleave", () => {
    pointerNearHeader = false;
    scheduleHeaderHide();
  });


}
