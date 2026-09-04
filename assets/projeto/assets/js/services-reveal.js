(() => {
  const servicesSection = document.querySelector("#servicos");
  if (!servicesSection) return;

  const grid = servicesSection.querySelector(".services__grid");
  const brandVisual = servicesSection.querySelector(".services__brand-visual");
  const serviceItems = [...servicesSection.querySelectorAll(".service-item")];
  if (!grid || !serviceItems.length) return;

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionPreference.matches;
  const mobileLayout = window.matchMedia("(max-width: 48rem)");
  const settleTimers = new Map();
  let frameId = 0;

  const cards = serviceItems.map((item, index) => {
    const card = document.createElement("div");
    const content = document.createElement("div");
    const icon = item.querySelector(":scope > .service-item__icon");
    const copy = item.querySelector(":scope > div");
    card.className = "service-card";
    content.className = "service-card__content";
    card.style.setProperty("--stack-order", index + 1);
    item.before(card);
    card.append(item);
    if (icon) content.append(icon);
    if (copy) content.append(copy);
    item.append(content);
    item.classList.add("service-item--stack-content");
    item.style.setProperty("--item-delay", "0s");
    return card;
  });

  servicesSection.classList.add("services--motion-ready");

  function settleItem(item) {
    window.clearTimeout(settleTimers.get(item));
    const timer = window.setTimeout(() => {
      item.classList.add("is-settled");
      settleTimers.delete(item);
    }, reducedMotion ? 0 : 900);
    settleTimers.set(item, timer);
  }

  function revealItem(item) {
    if (item.classList.contains("is-revealed")) return;
    item.classList.add("is-revealed");
    settleItem(item);
  }

  function concealItem(item) {
    if (!item.classList.contains("is-revealed")) return;
    window.clearTimeout(settleTimers.get(item));
    settleTimers.delete(item);
    item.classList.remove("is-revealed", "is-settled");
  }

  function revealBrandVisual() {
    brandVisual?.classList.add("is-revealed");
  }

  if (reducedMotion) {
    revealBrandVisual();
    serviceItems.forEach(revealItem);
  } else {
    servicesSection.classList.add("services--stack-ready");

    if (brandVisual && "IntersectionObserver" in window) {
      const brandObserver = new IntersectionObserver(([entry], observer) => {
        if (!entry.isIntersecting) return;
        revealBrandVisual();
        observer.disconnect();
      }, { threshold: 0.25 });
      brandObserver.observe(brandVisual);
    } else {
      revealBrandVisual();
    }
  }

  function clamp(value, minimum = 0, maximum = 1) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function ease(value) {
    return value * value * (3 - 2 * value);
  }

  function renderStack() {
    frameId = 0;
    const bounds = servicesSection.getBoundingClientRect();
    const scrollRange = Math.max(servicesSection.offsetHeight - window.innerHeight, 1);
    const sectionProgress = clamp(-bounds.top / scrollRange);
    const stackProgress = sectionProgress * (cards.length - 1);
    const inActivationZone = bounds.top <= window.innerHeight * 0.78 && bounds.bottom > 0;
    const currentIndex = Math.min(Math.round(stackProgress), cards.length - 1);
    const mobile = mobileLayout.matches;
    const entryOffset = mobile ? 2.75 : 4.5;
    const depthOffset = mobile ? 0.32 : 0.5;
    const depthScale = mobile ? 0.008 : 0.015;

    cards.forEach((card, index) => {
      const arrival = ease(clamp(stackProgress - index + 1));
      const depth = clamp(stackProgress - index, 0, 4);
      const depthOpacity = Math.max(0.35, 1 - depth * 0.27);
      const translateY = entryOffset * (1 - arrival) - depth * depthOffset;
      const scale = 1 - (1 - arrival) * (mobile ? 0.005 : 0.015) - depth * depthScale;
      const opacity = arrival * depthOpacity;

      card.style.setProperty("--stack-y", `${translateY.toFixed(3)}rem`);
      card.style.setProperty("--stack-scale", scale.toFixed(4));
      card.style.setProperty("--stack-opacity", opacity.toFixed(3));
      card.classList.toggle("is-current", index === currentIndex && arrival > 0.5);

      if (inActivationZone && arrival > 0.68) revealItem(serviceItems[index]);
      if (arrival < 0.08) concealItem(serviceItems[index]);
    });
  }

  function requestRender() {
    if (frameId) return;
    frameId = window.requestAnimationFrame(renderStack);
  }

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });
  renderStack();

  function updateMotionPreference(event) {
    reducedMotion = event.matches;
    settleTimers.forEach((timer) => window.clearTimeout(timer));
    settleTimers.clear();

    if (reducedMotion) {
      servicesSection.classList.remove("services--stack-ready");
      revealBrandVisual();
      serviceItems.forEach(revealItem);
      return;
    }

    servicesSection.classList.add("services--stack-ready");
    requestRender();
  }

  if ("addEventListener" in motionPreference) {
    motionPreference.addEventListener("change", updateMotionPreference);
  } else {
    motionPreference.addListener(updateMotionPreference);
  }
})();
