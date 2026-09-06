export async function loadHeroModel(viewer) {
  if (!viewer || viewer.dataset.loading) return;
  viewer.dataset.loading = "true";
  try {
    await import("https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js");
    viewer.src = viewer.dataset.src;
  } catch {
    viewer.closest(".hero__model")?.querySelector(".hero__model-fallback")?.classList.add("is-visible");
    // Show the textual fallback when the optional CDN cannot load.
  }
}
