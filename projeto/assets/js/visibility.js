// One shared observer for optional work that depends on viewport visibility.
const callbacks = new Map();
let observer;
export function observeVisibility(element, callback) {
  if (!element) return;
  if (!("IntersectionObserver" in window)) { callback(true); return; }
  if (!observer) observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => callbacks.get(entry.target)?.(entry.isIntersecting));
  });
  callbacks.set(element, callback);
  observer.observe(element);
}
