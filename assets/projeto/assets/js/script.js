const siteHeader = document.querySelector(".site-header");

function updateHeader() {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 0);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const typedText = document.querySelector(".hero__typed-text");
const slogan = "Sua empresa merece uma presença digital à altura.";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (typedText) {
  if (reduceMotion.matches) {
    typedText.textContent = slogan;
  } else {
    let characterIndex = 0;
    let isDeleting = false;

    function animateSlogan() {
      typedText.textContent = slogan.slice(0, characterIndex);

      if (!isDeleting && characterIndex < slogan.length) {
        characterIndex += 1;
        setTimeout(animateSlogan, 85);
      } else if (!isDeleting) {
        isDeleting = true;
        setTimeout(animateSlogan, 1800);
      } else if (characterIndex > 0) {
        characterIndex -= 1;
        setTimeout(animateSlogan, 45);
      } else {
        isDeleting = false;
        setTimeout(animateSlogan, 500);
      }
    }

    animateSlogan();
  }
}

const changingText = document.querySelector(".hero__changing-text");
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

      changingText.replaceChildren(fragment);
    }

    function changeSubtitlePhrase() {
      const currentCharacters = changingText.querySelectorAll(".hero__character");
      currentCharacters.forEach((character) => character.classList.add("is-leaving"));

      setTimeout(() => {
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

      setTimeout(changeSubtitlePhrase, 3600);
    }

    createScatteredPhrase(subtitlePhrases[phraseIndex]);
    setTimeout(changeSubtitlePhrase, 3600);
  }
}

const hero = document.querySelector(".hero");
const heroVisual = document.querySelector(".hero__visual");
const heroModel = document.querySelector(".hero__model");
const heroCta = document.querySelector(".hero__cta");
const heroModelFallback = document.querySelector(".hero__model-fallback");
const HERO_CAMERA = Object.freeze({
  horizontalAngle: 25,
  verticalAngle: 85,
  distance: 240,
  horizontalMovement: 18,
  verticalMovement: 10,
});

function setHeroCamera(horizontalAngle, verticalAngle) {
  heroModel?.setAttribute(
    "camera-orbit",
    `${horizontalAngle.toFixed(2)}deg ${verticalAngle.toFixed(2)}deg ${HERO_CAMERA.distance}%`,
  );
}

setHeroCamera(HERO_CAMERA.horizontalAngle, HERO_CAMERA.verticalAngle);

heroModel?.addEventListener("error", () => {
  heroModelFallback?.classList.add("is-visible");
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
    const scale = 1.08 - scrollProgress * 1.8;
    const ctaOpacity = Math.max(1 - scrollProgress * 1.6, 0);
    const ctaShift = scrollProgress * -6;
    heroVisual.style.setProperty("--hero-scale", scale.toFixed(3));
    hero.style.setProperty("--cta-opacity", ctaOpacity.toFixed(3));
    hero.style.setProperty("--cta-shift", `${ctaShift.toFixed(3)}rem`);
  }

  function requestHeroZoom() {
    if (heroZoomFrameId) return;
    heroZoomFrameId = window.requestAnimationFrame(() => {
      heroZoomFrameId = 0;
      updateHeroZoom();
    });
  }

  hero.addEventListener("pointermove", (event) => {
    const heroRect = hero.getBoundingClientRect();
    const horizontalPosition = (event.clientX - heroRect.left) / heroRect.width - 1;
    const verticalPosition = (event.clientY - heroRect.top) / heroRect.height - 1;

    hero.style.setProperty("--pointer-x", `${((horizontalPosition + 1) * 100).toFixed(2)}%`);
    hero.style.setProperty("--pointer-y", `${((verticalPosition + 1) * 100).toFixed(2)}%`);

    const orbitAngle = HERO_CAMERA.horizontalAngle + horizontalPosition * HERO_CAMERA.horizontalMovement;
    const orbitPitch = HERO_CAMERA.verticalAngle + verticalPosition * HERO_CAMERA.verticalMovement;
    setHeroCamera(orbitAngle, orbitPitch);
  });

  hero.addEventListener("pointerleave", () => {
    setHeroCamera(HERO_CAMERA.horizontalAngle, HERO_CAMERA.verticalAngle);
  });

  updateHeroZoom();
  window.addEventListener("scroll", requestHeroZoom, { passive: true });
}
