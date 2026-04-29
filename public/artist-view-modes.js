(() => {
  const MODES = [
    {
      id: "list",
      label: "Lista",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>'
    },
    {
      id: "small",
      label: "Ícones pequenos",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>'
    },
    {
      id: "large",
      label: "Ícones grandes",
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"></rect><path d="M8 9h8"></path><path d="M8 13h5"></path></svg>'
    }
  ];

  const STORAGE_KEY = "mdl.songViewMode";
  const DEFAULT_MODE = "large";

  function isDesktopLike() {
    return window.matchMedia("(min-width: 700px)").matches;
  }

  function getMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.some((mode) => mode.id === saved) ? saved : DEFAULT_MODE;
  }

  function setMode(modeId) {
    const next = MODES.some((mode) => mode.id === modeId) ? modeId : DEFAULT_MODE;
    localStorage.setItem(STORAGE_KEY, next);
    document.body.dataset.mdlSongViewMode = isDesktopLike() ? next : "";
    updateButtons(next);
    applyCoverBackgrounds();
  }

  function updateButtons(activeMode) {
    document.querySelectorAll(".mdl-view-mode-button").forEach((button) => {
      const active = button.dataset.mode === activeMode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function removeOldToolbars() {
    document.querySelectorAll(
      "#artistViewModeToolbar, #viewModeToolbar, .artist-view-mode-toolbar, .artist-view-modes, .view-mode-toolbar, .view-modes-toolbar, .library-view-mode-toolbar"
    ).forEach((el) => {
      if (el.id !== "mdlSongViewModeBar") el.remove();
    });
  }

  function ensureToolbar() {
    const acervoView = document.getElementById("view-acervo");
    const songList = document.getElementById("songList");

    if (!acervoView || !songList) return;

    removeOldToolbars();

    let bar = document.getElementById("mdlSongViewModeBar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "mdlSongViewModeBar";
      bar.setAttribute("aria-label", "Modo de visualização das músicas");

      MODES.forEach((mode) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mdl-view-mode-button";
        button.dataset.mode = mode.id;
        button.innerHTML = mode.icon + "<span>" + mode.label + "</span>";
        button.addEventListener("click", () => setMode(mode.id));
        bar.appendChild(button);
      });
    }

    const libraryToolbar = acervoView.querySelector(".library-toolbar");
    if (libraryToolbar) {
      libraryToolbar.insertAdjacentElement("afterend", bar);
    } else {
      songList.insertAdjacentElement("beforebegin", bar);
    }

    setMode(getMode());
  }

  function extractImageUrl(value) {
    const text = String(value || "");
    const match = text.match(/url\(["']?([^"')]+)["']?\)/i);
    return match ? match[1] : "";
  }

  function applyCoverBackgrounds() {
    const songList = document.getElementById("songList");
    if (!songList) return;

    songList.querySelectorAll(".song-card").forEach((card) => {
      const img = card.querySelector("img");
      const imgUrl = img?.getAttribute("src") || img?.src || "";
      const inlineBg = extractImageUrl(card.style.backgroundImage);
      const existing = imgUrl || inlineBg || card.dataset.mdlCover || "";

      if (existing) {
        card.dataset.mdlCover = existing;
        if (document.body.dataset.mdlSongViewMode === "small" || document.body.dataset.mdlSongViewMode === "large") {
          card.style.backgroundImage = `url("${existing}")`;
        } else {
          card.style.backgroundImage = "";
        }
      } else if (document.body.dataset.mdlSongViewMode === "list") {
        card.style.backgroundImage = "";
      }
    });
  }

  function boot() {
    ensureToolbar();
    applyCoverBackgrounds();

    const observer = new MutationObserver(() => {
      ensureToolbar();
      applyCoverBackgrounds();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener("resize", () => setMode(getMode()));
    window.addEventListener("orientationchange", () => setMode(getMode()));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
