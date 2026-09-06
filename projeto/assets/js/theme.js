export function initTheme() {

  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;

  const storageKey = "vertex-theme";
  const systemPreference = window.matchMedia("(prefers-color-scheme: light)");

  function savedTheme() {
    try {
      const value = localStorage.getItem(storageKey);
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  }

  function applyTheme(theme, persist = false) {
    root.dataset.theme = theme;
    const isLight = theme === "light";
    toggle.setAttribute("aria-pressed", String(isLight));
    toggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
    window.dispatchEvent(new CustomEvent("vertex:themechange", { detail: { theme } }));

    if (!persist) return;
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // The selected theme still works for the current page when storage is unavailable.
    }
  }

  applyTheme(root.dataset.theme === "light" ? "light" : "dark");

  toggle.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "light" ? "dark" : "light", true);
  });

  function followSystemPreference(event) {
    if (!savedTheme()) applyTheme(event.matches ? "light" : "dark");
  }

  if ("addEventListener" in systemPreference) {
    systemPreference.addEventListener("change", followSystemPreference);
  } else {
    systemPreference.addListener(followSystemPreference);
  }

}
