export function initCustomSelects() {

  function initCustomSelect(root) {
    const nativeSelect = root.querySelector("[data-custom-select-native]");
    const trigger = root.querySelector("[data-custom-select-trigger]");
    const valueElement = root.querySelector("[data-custom-select-value]");
    const listbox = root.querySelector("[data-custom-select-listbox]");
    const options = [...listbox?.querySelectorAll("[role='option']") || []];
    if (!nativeSelect || !trigger || !valueElement || !listbox || !options.length) return;

    let activeIndex = Math.max(options.findIndex((option) => option.dataset.value === nativeSelect.value), 0);
    const label = document.querySelector(`[for="${nativeSelect.id}"]`);
    nativeSelect.setAttribute("aria-hidden", "true");
    nativeSelect.tabIndex = -1;
    if (label) label.htmlFor = trigger.id;
    root.classList.add("custom-select--ready");

    function setActiveOption(index) {
      activeIndex = Math.min(Math.max(index, 0), options.length - 1);
      options.forEach((option, optionIndex) => option.classList.toggle("is-active", optionIndex === activeIndex));
      trigger.setAttribute("aria-activedescendant", `${listbox.id}-option-${activeIndex}`);
      options[activeIndex].scrollIntoView({ block: "nearest" });
    }

    function closeListbox({ returnFocus = false, validate = false } = {}) {
      if (listbox.hidden) return;
      listbox.hidden = true;
      root.classList.remove("opens-up");
      listbox.style.maxHeight = "";
      trigger.setAttribute("aria-expanded", "false");
      trigger.removeAttribute("aria-activedescendant");
      if (validate) nativeSelect.dispatchEvent(new Event("blur"));
      if (returnFocus) trigger.focus();
    }

    function openListbox() {
      listbox.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      const triggerBounds = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - triggerBounds.bottom;
      const spaceAbove = triggerBounds.top;
      const listHeight = Math.min(Math.max(listbox.scrollHeight, options.length * 42), 288);
      const opensUp = spaceBelow < listHeight && spaceAbove > spaceBelow;
      const availableSpace = Math.max(opensUp ? spaceAbove : spaceBelow, 8);
      root.classList.toggle("opens-up", opensUp);
      listbox.style.maxHeight = `${Math.min(listHeight, availableSpace - 8)}px`;
      setActiveOption(Math.max(options.findIndex((option) => option.dataset.value === nativeSelect.value), 0));
    }

    function selectOption(index) {
      const option = options[index];
      nativeSelect.value = option.dataset.value || "";
      valueElement.textContent = option.textContent;
      trigger.classList.toggle("has-value", Boolean(nativeSelect.value));
      options.forEach((item, optionIndex) => item.setAttribute("aria-selected", String(optionIndex === index)));
      // Close before change listeners synchronize the native selection.
      closeListbox({ returnFocus: true, validate: true });
      nativeSelect.dispatchEvent(new Event("input", { bubbles: true }));
      nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function syncNativeValue() {
      activeIndex = Math.max(options.findIndex((option) => option.dataset.value === nativeSelect.value), 0);
      valueElement.textContent = nativeSelect.selectedOptions[0]?.textContent || options[0].textContent;
      trigger.classList.toggle("has-value", Boolean(nativeSelect.value));
      options.forEach((option, index) => {
        option.setAttribute("aria-selected", String(option.dataset.value === nativeSelect.value));
        option.classList.toggle("is-active", index === activeIndex);
      });
      closeListbox();
    }
    nativeSelect.addEventListener("change", syncNativeValue);
    nativeSelect.form?.addEventListener("reset", () => queueMicrotask(syncNativeValue));
    syncNativeValue();

    options.forEach((option, index) => {
      option.id = `${listbox.id}-option-${index}`;
      option.addEventListener("pointerenter", () => setActiveOption(index));
      option.addEventListener("click", () => selectOption(index));
    });

    window.addEventListener("resize", () => closeListbox());
    window.addEventListener("scroll", () => closeListbox(), { passive: true });
    window.visualViewport?.addEventListener("resize", () => closeListbox());
    trigger.setAttribute("aria-required", String(nativeSelect.required));
    trigger.addEventListener("click", () => {
      if (listbox.hidden) openListbox();
      else closeListbox({ returnFocus: true, validate: true });
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !listbox.hidden) {
        event.preventDefault();
        closeListbox({ validate: true });
        return;
      }

      if (event.key === "Tab") {
        closeListbox({ validate: true });
        return;
      }

      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) return;
      event.preventDefault();
      if (listbox.hidden) {
        openListbox();
        if (event.key === "ArrowUp" || event.key === "End") setActiveOption(options.length - 1);
        if (event.key === "Home") setActiveOption(0);
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        setActiveOption(activeIndex + (event.key === "ArrowDown" ? 1 : -1));
      } else if (event.key === "Home" || event.key === "End") {
        setActiveOption(event.key === "Home" ? 0 : options.length - 1);
      } else if (event.key === "Enter" || event.key === " ") {
        selectOption(activeIndex);
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (!root.contains(event.target)) closeListbox({ validate: true });
    });
  }

  document.querySelectorAll("[data-custom-select]").forEach(initCustomSelect);

}
