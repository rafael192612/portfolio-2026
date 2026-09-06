// Shared by the work modal and mobile drawer. Restore exact prior states.
export function isolateBackground(excluded) {
  const snapshots = [...document.body.children]
    .filter((node) => !excluded.includes(node) && !node.matches("script, style"))
    .map((node) => ({ node, inert: node.hasAttribute("inert"), aria: node.getAttribute("aria-hidden") }));
  for (const { node } of snapshots) {
    node.setAttribute("inert", "");
    node.setAttribute("aria-hidden", "true");
  }
  return () => {
    for (const { node, inert, aria } of snapshots) {
      node.toggleAttribute("inert", inert);
      if (aria === null) node.removeAttribute("aria-hidden");
      else node.setAttribute("aria-hidden", aria);
    }
  };
}

export function trapTab(event, panel) {
  if (event.key !== "Tab") return;
  const items = [...panel.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]')]
    .filter((node) => node.getClientRects().length && !node.closest("[hidden], [inert]"));
  const first = items[0] || panel;
  const last = items.at(-1) || panel;
  if (!panel.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)
    || (!event.shiftKey && document.activeElement === last)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
}

export function lockScroll() {
  const { scrollX, scrollY } = window;
  const style = document.body.style;
  const properties = ["position", "top", "left", "width", "overflow"];
  const previous = properties.map((property) => [property, style.getPropertyValue(property), style.getPropertyPriority(property)]);
  Object.assign(style, { position: "fixed", top: `${-scrollY}px`, left: `${-scrollX}px`, width: "100%", overflow: "hidden" });
  return () => {
    previous.forEach(([property, value, priority]) => value ? style.setProperty(property, value, priority) : style.removeProperty(property));
    const root = document.documentElement.style;
    const behavior = root.getPropertyValue("scroll-behavior");
    root.setProperty("scroll-behavior", "auto");
    window.scrollTo(scrollX, scrollY);
    if (behavior) root.setProperty("scroll-behavior", behavior);
    else root.removeProperty("scroll-behavior");
  };
}
