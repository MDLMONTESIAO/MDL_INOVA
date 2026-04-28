(() => {
  const MODE_KEY = "mdl.songViewMode";
  const DEFAULT_MODE = "large";

  const MODES = [
    { id: "list", label: "Lista" },
    { id: "compact", label: "Miniaturas" },
    { id: "large", label: "Cards grandes" }
  ];

  function isTabletOrPc() {
    const width = Math.min(window.innerWidth || 0, window.screen?.width || window.innerWidth || 0);
    const hasTabletWidth = window.matchMedia("(min-width: 600px)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const isCoarseTablet = window.matchMedia("(pointer: coarse)").matches && width >= 600;

    return hasTabletWidth || hasFinePointer || isCoarseTablet;
  }

  function getStoredMode() {
    const mode = localStorage.getItem(MODE_KEY) || DEFAULT_MODE;
    return MODES.some((item) => item.id === mode) ? mode : DEFAULT_MODE;
  }

  function applyMode() {
    const mode = isTabletOrPc() ? getStoredMode() : "list";

    document.documentElement.dataset.songViewMode = mode;
    document.body.dataset.songViewMode = mode;

    ["songList", "favoriteList", "playList"].forEach((id) => {
      const list = document.getElementById(id);
      if (!list) return;

      list.classList.remove("mdl-mode-list", "mdl-mode-compact", "mdl-mode-large");
      list.classList.add(`mdl-mode-${mode}`);
    });

    document.querySelectorAll(".mdl-view-mode-button").forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    refreshSongThumbs();
  }

  function refreshSongThumbs() {
    document.querySelectorAll(".song-card").forEach((card) => {
      const img =
        card.querySelector(".song-cover img") ||
        card.querySelector(".artist-thumb img") ||
        card.querySelector("img");

      if (!img) return;

      const src = img.currentSrc || img.src;
      if (!src) return;

      card.style.setProperty("--mdl-song-thumb", `url("${src}")`);

      if (!card.style.backgroundImage || card.style.backgroundImage === "none") {
        card.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.76)), url("${src}")`;
      }
    });
  }

  function setMode(mode) {
    if (!MODES.some((item) => item.id === mode)) return;
    localStorage.setItem(MODE_KEY, mode);
    applyMode();
  }

  function makeToolbar() {
    if (document.getElementById("mdlViewModeToolbar")) return;

    const toolbar = document.createElement("div");
    toolbar.className = "mdl-view-mode-toolbar";
    toolbar.id = "mdlViewModeToolbar";
    toolbar.setAttribute("aria-label", "Modo de visualização das músicas");

    const label = document.createElement("span");
    label.className = "mdl-view-mode-label";
    label.textContent = "Visualização";
    toolbar.appendChild(label);

    MODES.forEach((mode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mdl-view-mode-button";
      button.dataset.mode = mode.id;
      button.textContent = mode.label;
      button.addEventListener("click", () => setMode(mode.id));
      toolbar.appendChild(button);
    });

    const libraryToolbar = document.querySelector(".library-toolbar");
    const libraryHead = document.querySelector(".library-head") || document.querySelector("#view-acervo .section-head");

    if (libraryToolbar) {
      libraryToolbar.insertAdjacentElement("afterbegin", toolbar);
    } else if (libraryHead) {
      libraryHead.insertAdjacentElement("afterend", toolbar);
    }
  }

  function boot() {
    makeToolbar();
    applyMode();

    const observer = new MutationObserver(() => {
      requestAnimationFrame(applyMode);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "src"]
    });

    window.addEventListener("resize", applyMode);
    window.addEventListener("orientationchange", () => {
      setTimeout(applyMode, 250);
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) applyMode();
    });

    document.addEventListener("click", (event) => {
      if (
        event.target.closest("[data-action='refresh']") ||
        event.target.closest("[data-action='set-artist-thumb']") ||
        event.target.closest("[data-action='set-cover']")
      ) {
        setTimeout(applyMode, 400);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();