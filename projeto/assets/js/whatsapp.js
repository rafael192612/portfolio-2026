import { SITE_CONFIG } from "./config.js";

export function initWhatsApp() {

  const { number: WHATSAPP_NUMBER, message: DEFAULT_MESSAGE } = SITE_CONFIG.contact.whatsapp;

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function openWhatsApp(message) {
    const whatsappWindow = window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    if (whatsappWindow) whatsappWindow.opener = null;
  }

  function initWhatsAppButtons() {
    const buttons = document.querySelectorAll("[data-whatsapp-button]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        openWhatsApp(DEFAULT_MESSAGE);
      });
    });
  }

  function initWhatsAppPrompt() {
    const prompt = document.querySelector("[data-whatsapp-prompt]");
    const button = document.querySelector(".whatsapp-float[data-whatsapp-button]");
    if (!prompt || !button) return;

    let audioContext = null;
    let hasUserInteracted = false;
    let hasPrompted = false;
    let hideTimer = 0;
    let finishHideTimer = 0;

    function showPromptVisual() {
      window.clearTimeout(hideTimer);
      window.clearTimeout(finishHideTimer);
      prompt.hidden = false;
      window.requestAnimationFrame(() => prompt.classList.add("is-visible"));
    }

    function hidePromptVisual(delay = 0) {
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        prompt.classList.remove("is-visible");
        window.clearTimeout(finishHideTimer);
        finishHideTimer = window.setTimeout(() => {
          prompt.hidden = true;
        }, 550);
      }, delay);
    }

    function prepareAudio() {
      hasUserInteracted = true;
      if (audioContext) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      try {
        audioContext = new AudioContext();
        if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      } catch {
        audioContext = null;
      }
    }

    function playWhatsAppChime() {
      if (!hasUserInteracted || !audioContext || audioContext.state !== "running") return;

      try {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startTime = audioContext.currentTime;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(660, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, startTime + 0.16);
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.018, startTime + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.addEventListener("ended", () => {
          audioContext?.close().catch(() => {});
          audioContext = null;
        }, { once: true });
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.19);
      } catch {
        // The visual prompt remains available if audio is unavailable.
      }
    }

    function showPrompt() {
      if (hasPrompted || document.hidden) return;
      hasPrompted = true;
      showPromptVisual();
      playWhatsAppChime();
      hidePromptVisual(5200);
    }

    ["pointerdown", "keydown"].forEach((eventName) => {
      window.addEventListener(eventName, prepareAudio, { once: true, passive: eventName === "pointerdown" });
    });
    window.setTimeout(showPrompt, 2800);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !hasPrompted) window.setTimeout(showPrompt, 600);
    });
    button.addEventListener("pointerenter", showPromptVisual);
    button.addEventListener("pointerleave", () => hidePromptVisual(120));
    button.addEventListener("focus", showPromptVisual);
    button.addEventListener("blur", () => hidePromptVisual(120));
  }

  initWhatsAppButtons();
  initWhatsAppPrompt();

}
