import { SITE_CONFIG } from "./config.js";

export function initContactForm() {
  const MESSAGE_MAX_LENGTH = 500;

  const ERROR_MESSAGES = Object.freeze({
    name: "Informe seu nome com pelo menos 2 caracteres.",
    company: "Informe um nome de empresa válido.",
    whatsapp: "Informe um WhatsApp brasileiro válido.",
    email: "Informe um e-mail válido.",
    need: "Selecione o que você precisa.",
    message: "Conte um pouco sobre o seu projeto usando pelo menos 20 caracteres.",
    messageLength: `Mantenha sua mensagem com no máximo ${MESSAGE_MAX_LENGTH} caracteres.`,
  });
  const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
  const SUBMIT_LABEL = "Quero conversar sobre meu projeto";
  const SENDING_LABEL = "Enviando...";

  // Client-side checks improve UX only. A real endpoint must also provide
  // server-side validation and sanitization, rate limiting, bot/spam controls
  // (such as Turnstile when appropriate), and protection for its destination.

  function hasControlCharacters(value) {
    CONTROL_CHARACTERS.lastIndex = 0;
    return CONTROL_CHARACTERS.test(value);
  }

  function normalizeSingleLine(value, maximumLength) {
    return value.replace(CONTROL_CHARACTERS, "").trim().slice(0, maximumLength);
  }

  function normalizeMessage(value) {
    return value
      .replace(/\r\n?/g, "\n")
      .replace(CONTROL_CHARACTERS, "")
      .trim()
      .slice(0, MESSAGE_MAX_LENGTH);
  }

  function phoneDigits(value) {
    const digits = value.replace(/\D/g, "").slice(0, 13);
    return digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
  }

  function formatPhoneBR(value) {
    const allDigits = value.replace(/\D/g, "").slice(0, 13);
    const hasCountryCode = allDigits.startsWith("55") && allDigits.length > 11;
    const digits = (hasCountryCode ? allDigits.slice(2) : allDigits).slice(0, 11);
    const countryCode = hasCountryCode ? "+55 " : "";

    if (digits.length <= 2) return `${countryCode}${digits}`;
    if (digits.length <= 6) return `${countryCode}(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `${countryCode}(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `${countryCode}(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function validateEmail(value) {
    return value.length <= 254
      && !hasControlCharacters(value)
      && !/\s/.test(value)
      && /^[^@]+@[^@]+\.[^@]{2,}$/.test(value);
  }

  function validatePhoneBR(value) {
    const digits = phoneDigits(value);
    return /^[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/.test(digits);
  }

  function getContactFormData(form) {
    const formData = new FormData(form);
    const rawEmail = String(formData.get("email") || "");
    const rawMessage = String(formData.get("message") || "");
    return {
      name: normalizeSingleLine(String(formData.get("name") || ""), 80),
      company: normalizeSingleLine(String(formData.get("company") || ""), 100),
      whatsapp: String(formData.get("whatsapp") || "").trim(),
      email: rawEmail.trim(),
      emailHasControls: hasControlCharacters(rawEmail),
      need: String(formData.get("need") || ""),
      message: normalizeMessage(rawMessage),
      messageHasControls: hasControlCharacters(rawMessage),
      messageTooLong: rawMessage.length > MESSAGE_MAX_LENGTH,
    };
  }

  function validateContactForm(data) {
    const errors = {};
    if (data.name.length < 2) errors.name = ERROR_MESSAGES.name;
    if (data.company && data.company.length < 2) errors.company = ERROR_MESSAGES.company;
    if (!validatePhoneBR(data.whatsapp)) errors.whatsapp = ERROR_MESSAGES.whatsapp;
    if (data.emailHasControls || !validateEmail(data.email)) errors.email = ERROR_MESSAGES.email;
    if (!["create-page", "improve-site", "promote-services", "facilitate-contact", "unsure", "other"].includes(data.need)) errors.need = ERROR_MESSAGES.need;
    if (data.messageTooLong) {
      errors.message = ERROR_MESSAGES.messageLength;
    } else if (data.messageHasControls || data.message.length < 20) {
      errors.message = ERROR_MESSAGES.message;
    }
    return errors;
  }

  function fieldErrorElement(field) {
    return document.querySelector(`#${field.id}-error`);
  }

  function visualFieldElement(field) {
    return field.matches("[data-custom-select-native]")
      ? field.closest("[data-custom-select]")?.querySelector("[data-custom-select-trigger]") || field
      : field;
  }

  function showFieldError(field, message) {
    const errorElement = fieldErrorElement(field);
    const visualField = visualFieldElement(field);
    visualField.classList.remove("is-valid");
    visualField.classList.add("is-invalid");
    visualField.setAttribute("aria-invalid", "true");
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.hidden = false;
  }

  function clearFieldError(field) {
    const errorElement = fieldErrorElement(field);
    const visualField = visualFieldElement(field);
    visualField.classList.remove("is-invalid");
    visualField.removeAttribute("aria-invalid");
    if (field.value.trim()) visualField.classList.add("is-valid");
    else visualField.classList.remove("is-valid");
    if (!errorElement) return;
    errorElement.textContent = "";
    errorElement.hidden = true;
  }

  function validateField(form, field) {
    const errors = validateContactForm(getContactFormData(form));
    const message = errors[field.name];
    if (message) {
      showFieldError(field, message);
      return false;
    }

    clearFieldError(field);
    return true;
  }

  function configuredEndpoint() {
    const endpoint = SITE_CONFIG.contact.endpoint.trim();
    if (!endpoint) return "";

    try {
      const url = new URL(endpoint);
      return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
    } catch {
      return "";
    }
  }

  function createSubmissionData(form, data) {
    const submission = new FormData();
    submission.set("name", data.name);
    submission.set("company", data.company);
    submission.set("whatsapp", formatPhoneBR(data.whatsapp));
    submission.set("email", data.email);
    submission.set("need", data.need);
    submission.set("message", data.message);
    submission.set("_gotcha", form.querySelector("[data-contact-honeypot]")?.value || "");
    return submission;
  }

  function updateStatus(status, state, message) {
    if (!status) return;
    status.classList.remove("is-error", "is-ready");
    if (state === "error") status.classList.add("is-error");
    if (state === "ready" || state === "sending" || state === "success") {
      status.classList.add("is-ready");
    }
    status.textContent = message;
  }

  function setSubmitting(form, submitButton, isSubmitting) {
    form.setAttribute("aria-busy", String(isSubmitting));
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? SENDING_LABEL : SUBMIT_LABEL;
  }

  async function submitContactForm(form, endpoint, data) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      credentials: "omit",
      redirect: "error",
      method: "POST",
      body: createSubmissionData(form, data),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`Contact form request failed with status ${response.status}.`);
    } finally { clearTimeout(timeout); }
  }

  function initContactForm() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;

    const fields = [...form.elements].filter((element) => (
      element.matches("input, select, textarea") && !element.matches("[data-contact-honeypot]")
    ));
    const submitButton = form.querySelector("button[type='submit']");
    const status = form.querySelector("[data-contact-form-status]");
    const defaultStatusMessage = status?.textContent || "";
    const touchedFields = new WeakSet();
    const messageField = form.querySelector("textarea[name='message']");
    const counter = form.querySelector("[data-message-counter]");
    function updateMessageCounter() {
      if (counter) counter.textContent = `${messageField?.value.length || 0} / ${MESSAGE_MAX_LENGTH}`;
    }
    if (messageField) messageField.maxLength = MESSAGE_MAX_LENGTH;
    updateMessageCounter();
    // Reset fires before native controls receive their default values.
    form.addEventListener("reset", () => queueMicrotask(() => {
      fields.forEach((field) => {
        touchedFields.delete(field);
        clearFieldError(field);
        visualFieldElement(field).classList.remove("is-valid");
        field.removeAttribute("aria-invalid");
      });
      updateMessageCounter();
    }));
    let isSubmitting = false;
    if (submitButton) submitButton.disabled = false;

    function resetFormStatus() {
      if (!status || (!status.classList.contains("is-error") && !status.classList.contains("is-ready"))) return;
      status.classList.remove("is-error", "is-ready");
      status.textContent = defaultStatusMessage;
    }

    fields.forEach((field) => {
      field.addEventListener("blur", () => {
        touchedFields.add(field);
        validateField(form, field);
      });

      field.addEventListener("input", () => {
        if (field === messageField) {
          field.value = field.value.slice(0, MESSAGE_MAX_LENGTH);
          updateMessageCounter();
        }
        if (field.name === "whatsapp") field.value = formatPhoneBR(field.value);
        if (touchedFields.has(field) && visualFieldElement(field).classList.contains("is-invalid")) {
          validateField(form, field);
        }
        resetFormStatus();
      });

      field.addEventListener("change", () => {
        if (field === messageField) updateMessageCounter();
        if (touchedFields.has(field)) validateField(form, field);
        resetFormStatus();
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isSubmitting) return;

      const data = getContactFormData(form);
      const errors = validateContactForm(data);

      fields.forEach((field) => {
        touchedFields.add(field);
        const message = errors[field.name];
        if (message) showFieldError(field, message);
        else clearFieldError(field);
      });

      const firstInvalidField = fields.find((field) => errors[field.name]);
      if (firstInvalidField) {
        updateStatus(status, "error", "Revise os campos indicados antes de continuar.");
        visualFieldElement(firstInvalidField).focus();
        return;
      }

      const endpoint = configuredEndpoint();
      if (!endpoint) {
        updateStatus(status, "ready", "Seus dados estão corretos. O envio online ainda não está ativo. Fale conosco pelo WhatsApp.");
        return;
      }

      isSubmitting = true;
      setSubmitting(form, submitButton, true);
      updateStatus(status, "sending", "Enviando sua mensagem...");

      try {
        await submitContactForm(form, endpoint, data);
        form.reset();
        updateStatus(status, "success", "Mensagem aceita pelo serviço de contato. Obrigado por falar com a VERTEX.");
      } catch (error) {
        console.error("Não foi possível enviar o formulário de contato.", error);
        updateStatus(status, "error", "Não foi possível enviar sua mensagem agora. Tente novamente ou fale conosco pelo WhatsApp.");
      } finally {
        isSubmitting = false;
        setSubmitting(form, submitButton, false);
      }
    });
  }

  initContactForm();

}
