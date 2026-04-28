(function () {
  const STORAGE_KEY = "mdl.artistViewMode";
  const MODES = [
    { id: "list", label: "Lista", icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>' },
    { id: "small", label: "Pequenos", icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"></rect><rect x="14" y="4" width="6" height="6" rx="1"></rect><rect x="4" y="14" width="6" height="6" rx="1"></rect><rect x="14" y="14" width="6" height="6" rx="1"></rect></svg>' },
    { id: "large", label: "Grandes", icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2"></rect><rect x="13" y="3" width="8" height="8" rx="2"></rect><rect x="3" y="13" width="8" height="8" rx="2"></rect><rect x="13" y="13" width="8" height="8" rx="2"></rect></svg>' }
  ];

  function getMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.some((mode) => mode.id === saved) ? saved : "large";
  }

  function setMode(modeId) {
    const mode = MODES.some((item) => item.id === modeId) ? modeId : "large";
    localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.dataset.mdlViewMode = mode;
    document.querySelectorAll(".mdl-view-mode-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === mode);
      button.setAttribute("aria-pressed", button.dataset.mode === mode ? "true" : "false");
    });
  }

  function removeOldPlainTextControls() {
    document.querySelectorAll(".artist-view-mode-controls, .artist-display-controls, .artist-view-toggle, .view-mode-controls").forEach((node) => {
      if (!node.classList.contains("mdl-view-mode-toolbar")) node.remove();
    });
  }

  function createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "mdl-view-mode-toolbar";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", "Modo de visualização");

    MODES.forEach((mode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mdl-view-mode-button";
      button.dataset.mode = mode.id;
      button.innerHTML = mode.icon + "<span>" + mode.label + "</span>";
      button.addEventListener("click", () => setMode(mode.id));
      toolbar.appendChild(button);
    });

    return toolbar;
  }

  function ensureToolbar() {
    removeOldPlainTextControls();

    const current = document.querySelector(".mdl-view-mode-toolbar");
    if (current) {
      setMode(getMode());
      return;
    }

    const artistView = document.getElementById("view-artistas");
    const acervoView = document.getElementById("view-acervo");
    const targetHead = artistView?.querySelector(".section-head") || acervoView?.querySelector(".library-head") || document.querySelector(".section-head");
    if (!targetHead) return;

    targetHead.appendChild(createToolbar());
    setMode(getMode());
  }

  function init() {
    setMode(getMode());
    ensureToolbar();

    const observer = new MutationObserver(() => ensureToolbar());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
