import { observeVisibility } from "./visibility.js";

export function initHero() {
  const heroSection = document.querySelector(".hero");
  let heroVisible = false;
  let subtitleTimer = 0;
  let subtitleExitTimer = 0;
  let resumeSubtitle = () => {};
  let modelRequested = false;
  let typingTimer = 0;
  let finishTyping = () => {};
  function syncActivity() {
    const active = heroVisible && !document.hidden && !reduceMotion.matches;
    heroSection?.classList.toggle("effects-paused", !active);
    clearTimeout(subtitleTimer);
    clearTimeout(subtitleExitTimer);
    if (!active) finishTyping();
    changingText?.querySelectorAll(".hero__character").forEach((node) => node.classList.remove("is-leaving", "is-entering"));
    if (active) resumeSubtitle();
  }
  const typedText = document.querySelector(".hero__typed-text");
  const slogan = typedText?.textContent.trim() || "";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (typedText) {
    typedText.closest("h1")?.setAttribute("aria-label", slogan);
    typedText.setAttribute("aria-hidden", "true");
    if (reduceMotion.matches) {
      typedText.textContent = slogan;
      typedText.classList.add("is-typed");
    } else {
      let characterIndex = 1;
      typedText.textContent = slogan;

      finishTyping = () => {
        clearTimeout(typingTimer);
        typedText.textContent = slogan;
        typedText.classList.add("is-typed");
      };
      function animateSlogan() {
        typedText.textContent = slogan.slice(0, characterIndex);

        if (characterIndex < slogan.length) {
          characterIndex += 1;
          typingTimer = setTimeout(animateSlogan, 85);
        } else {
          typedText.textContent = slogan;
          typedText.classList.add("is-typed");
        }
      }

      animateSlogan();
    }
  }

  const changingText = document.querySelector(".hero__changing-text");
  changingText?.setAttribute("aria-hidden", "true");
  const subtitlePhrases = [
    "Sites que apresentam seu negócio com clareza.",
    "Caminhos simples para novos contatos.",
    "Experiências que fortalecem credibilidade.",
    "Uma presença profissional em qualquer tela.",
  ];

  if (changingText) {
    if (reduceMotion.matches) {
      changingText.textContent = subtitlePhrases[0];
    } else {
      let phraseIndex = 0;

      function createScatteredPhrase(phrase, startsScattered = false) {
        const fragment = document.createDocumentFragment();

        [...phrase].forEach((character, index) => {
          const characterElement = document.createElement("span");
          const horizontalDirection = index % 2 === 0 ? 1 : -1;
          const verticalDirection = index % 3 === 0 ? -1 : 1;

          characterElement.className = `hero__character${startsScattered ? " is-entering" : ""}`;
          characterElement.textContent = character === " " ? "\u00a0" : character;
          characterElement.style.setProperty("--character-delay", `${index * 0.008}s`);
          characterElement.style.setProperty("--scatter-x", `${horizontalDirection * (0.18 + (index % 5) * 0.07)}em`);
          characterElement.style.setProperty("--scatter-exit-x", `${-horizontalDirection * (0.18 + (index % 5) * 0.07)}em`);
          characterElement.style.setProperty("--scatter-y", `${verticalDirection * (0.2 + (index % 4) * 0.08)}em`);
          characterElement.style.setProperty("--scatter-rotation", `${horizontalDirection * (3 + (index % 6) * 1.4)}deg`);
          characterElement.style.setProperty("--scatter-exit-rotation", `${-horizontalDirection * (3 + (index % 6) * 1.4)}deg`);
          fragment.append(characterElement);
        });


        [...fragment.children].forEach((node) => node.setAttribute("aria-hidden", "true"));
        changingText.replaceChildren(fragment);
      }

      function changeSubtitlePhrase() {
        if (!heroVisible || document.hidden || reduceMotion.matches) return;
        const currentCharacters = changingText.querySelectorAll(".hero__character");
        currentCharacters.forEach((character) => character.classList.add("is-leaving"));

        subtitleExitTimer = setTimeout(() => {
          phraseIndex = (phraseIndex + 1) % subtitlePhrases.length;
          createScatteredPhrase(subtitlePhrases[phraseIndex], true);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              changingText.querySelectorAll(".hero__character").forEach((character) => {
                character.classList.remove("is-entering");
              });
            });
          });
        }, 480);

        subtitleTimer = setTimeout(changeSubtitlePhrase, 3600);
      }

      createScatteredPhrase(subtitlePhrases[phraseIndex]);
      resumeSubtitle = () => { subtitleTimer = setTimeout(changeSubtitlePhrase, 3600); };
    }
  }

  const hero = document.querySelector(".hero");
  const heroVisual = document.querySelector(".hero__visual");
  const heroModel = document.querySelector(".hero__model");
  const heroModelViewer = document.querySelector(".hero__model-viewer");
  const heroCta = document.querySelector(".hero__cta");
  const heroModelFallback = document.querySelector(".hero__model-fallback");
  const HERO_CAMERA = Object.freeze({
    horizontalAngle: 22,
    verticalAngle: 90,
    distance: 149.058,
    horizontalMovement: 8,
    verticalMovement: -5,
  });

  function setHeroCamera(horizontalAngle, verticalAngle) {
    heroModelViewer?.setAttribute(
      "camera-orbit",
      `${horizontalAngle.toFixed(2)}deg ${verticalAngle.toFixed(2)}deg ${HERO_CAMERA.distance}%`,
    );
  }

  setHeroCamera(HERO_CAMERA.horizontalAngle, HERO_CAMERA.verticalAngle);

  heroModelViewer?.addEventListener("error", () => {
    heroModelFallback?.classList.add("is-visible");
  });

  heroModelViewer?.addEventListener("load", () => {
    heroModelFallback?.classList.remove("is-visible");
  });

  heroCta?.addEventListener("pointermove", (event) => {
    const buttonRect = heroCta.getBoundingClientRect();
    const pointerX = ((event.clientX - buttonRect.left) / buttonRect.width) * 100;
    const pointerY = ((event.clientY - buttonRect.top) / buttonRect.height) * 100;

    heroCta.style.setProperty("--cta-pointer-x", `${pointerX.toFixed(2)}%`);
    heroCta.style.setProperty("--cta-pointer-y", `${pointerY.toFixed(2)}%`);
  });

  if (hero && heroVisual && heroModel && !reduceMotion.matches) {
    let heroZoomFrameId = 0;

    function updateHeroZoom() {
      const heroRect = hero.getBoundingClientRect();
      const scrollProgress = Math.min(Math.max(-heroRect.top / heroRect.height, 0), 1);
      const scale = Math.max(0.7, 1.08 - scrollProgress * 0.38);
      const ctaOpacity = 1;
      const ctaShift = 0;
      heroVisual.style.setProperty("--hero-scale", scale.toFixed(3));
      hero.style.setProperty("--cta-opacity", ctaOpacity.toFixed(3));
      hero.style.setProperty("--cta-shift", `${ctaShift.toFixed(3)}rem`);
    }

    function requestHeroZoom() {
      if (!heroVisible || document.hidden || reduceMotion.matches) return;
      if (heroZoomFrameId) return;
      heroZoomFrameId = window.requestAnimationFrame(() => {
        heroZoomFrameId = 0;
        updateHeroZoom();
      });
    }

    let pointerFrame = 0;
    let pointerPosition = null;
    hero.addEventListener("pointermove", (event) => {
      if (!heroVisible || document.hidden || reduceMotion.matches || event.pointerType === "touch") return;
      pointerPosition = { clientX: event.clientX, clientY: event.clientY };
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      const event = pointerPosition;
      const heroRect = hero.getBoundingClientRect();
      const visualRect = heroVisual.getBoundingClientRect();
      const horizontalPosition = (event.clientX - heroRect.left) / heroRect.width - 1;
      const verticalPosition = (event.clientY - heroRect.top) / heroRect.height - 1;

      hero.style.setProperty("--pointer-x", `${((horizontalPosition + 1) * 100).toFixed(2)}%`);
      hero.style.setProperty("--pointer-y", `${((verticalPosition + 1) * 100).toFixed(2)}%`);

      const horizontalTilt = horizontalPosition * 2 + 1;
      const verticalTilt = verticalPosition * 2 + 1;
      const orbitAngle = HERO_CAMERA.horizontalAngle + horizontalTilt * HERO_CAMERA.horizontalMovement;
      const orbitPitch = HERO_CAMERA.verticalAngle + verticalTilt * HERO_CAMERA.verticalMovement;
      setHeroCamera(orbitAngle, orbitPitch);

      const localX = (event.clientX - visualRect.left) / visualRect.width;
      const localY = (event.clientY - visualRect.top) / visualRect.height;
      const distanceFromVisual = Math.hypot(
        Math.max(Math.abs(localX - 0.5) - 0.5, 0),
        Math.max(Math.abs(localY - 0.5) - 0.5, 0),
      );
      const lightIntensity = Math.max(1 - distanceFromVisual * 5, 0);
      heroVisual.style.setProperty("--logo-light-x", `${(localX * 100).toFixed(2)}%`);
      heroVisual.style.setProperty("--logo-light-y", `${(localY * 100).toFixed(2)}%`);
      heroVisual.style.setProperty("--logo-light-opacity", (lightIntensity * 0.62).toFixed(3));
      });
    }, { passive: true });

    hero.addEventListener("pointerleave", () => {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      setHeroCamera(HERO_CAMERA.horizontalAngle, HERO_CAMERA.verticalAngle);
      heroVisual.style.setProperty("--logo-light-opacity", "0");
    });

    updateHeroZoom();
    window.addEventListener("scroll", requestHeroZoom, { passive: true });
  }


  observeVisibility(heroSection, (visible) => {
    heroVisible = visible;
    syncActivity();
    if (visible && !modelRequested) {
      modelRequested = true;
      const load = () => import("./model.js").then(({ loadHeroModel }) => loadHeroModel(heroModelViewer)).catch(() => {});
      if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 1500 });
      else requestAnimationFrame(load);
    }
  });
  document.addEventListener("visibilitychange", syncActivity);
  reduceMotion.addEventListener("change", syncActivity);
}
