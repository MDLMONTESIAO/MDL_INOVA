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
  let songListObserver = null;
  let appShellObserver = null;
  let syncTimer = null;

  function isDesktopLike() {
    return window.matchMedia("(min-width: 700px)").matches;
  }

  function appIsAuthenticated() {
    const appShell = document.getElementById("appShell");
    return Boolean(appShell && !appShell.hidden);
  }

  function getMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.some((mode) => mode.id === saved) ? saved : DEFAULT_MODE;
  }

  function setMode(modeId) {
    const next = MODES.some((mode) => mode.id === modeId) ? modeId : DEFAULT_MODE;
    localStorage.setItem(STORAGE_KEY, next);

    if (isDesktopLike() && appIsAuthenticated()) {
      document.body.classList.add("mdl-authenticated");
      document.body.dataset.mdlSongViewMode = next;
    } else {
      document.body.classList.remove("mdl-authenticated");
      delete document.body.dataset.mdlSongViewMode;
    }

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

  function createToolbar() {
    const bar = document.createElement("div");
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

    return bar;
  }

  function ensureToolbar() {
    if (!appIsAuthenticated() || !isDesktopLike()) {
      const bar = document.getElementById("mdlSongViewModeBar");
      if (bar) bar.remove();
      document.body.classList.remove("mdl-authenticated");
      delete document.body.dataset.mdlSongViewMode;
      return;
    }

    const acervoView = document.getElementById("view-acervo");
    const songList = document.getElementById("songList");
    if (!acervoView || !songList) return;

    removeOldToolbars();

    let bar = document.getElementById("mdlSongViewModeBar");
    if (!bar) bar = createToolbar();

    const libraryToolbar = acervoView.querySelector(".library-toolbar");
    const desiredParent = libraryToolbar?.parentElement || songList.parentElement;
    const desiredPrevious = libraryToolbar || null;

    if (libraryToolbar) {
      if (bar.previousElementSibling !== libraryToolbar) {
        libraryToolbar.insertAdjacentElement("afterend", bar);
      }
    } else if (songList.previousElementSibling !== bar) {
      songList.insertAdjacentElement("beforebegin", bar);
    }

    setMode(getMode());
    attachSongListObserver();
  }

  function extractImageUrl(value) {
    const text = String(value || "");
    const match = text.match(/url\(["']?([^"')]+)["']?\)/i);
    return match ? match[1] : "";
  }

  function applyCoverBackgrounds() {
    if (!appIsAuthenticated()) return;

    const songList = document.getElementById("songList");
    if (!songList) return;

    const mode = document.body.dataset.mdlSongViewMode;
    const useBackground = mode === "small" || mode === "large";

    songList.querySelectorAll(".song-card").forEach((card) => {
      const img = card.querySelector("img");
      const imgUrl = img?.getAttribute("src") || img?.src || "";
      const inlineBg = extractImageUrl(card.style.backgroundImage);
      const existing = imgUrl || card.dataset.mdlCover || inlineBg || "";

      if (existing) card.dataset.mdlCover = existing;

      if (useBackground && existing) {
        card.style.backgroundImage = `url("${existing}")`;
      } else if (card.dataset.mdlCover) {
        card.style.backgroundImage = "";
      }
    });
  }

  function attachSongListObserver() {
    if (songListObserver) return;

    const songList = document.getElementById("songList");
    if (!songList) return;

    songListObserver = new MutationObserver(() => {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        updateButtons(getMode());
        applyCoverBackgrounds();
      }, 80);
    });

    songListObserver.observe(songList, {
      childList: true,
      subtree: true
    });
  }

  function sync() {
    ensureToolbar();
    setMode(getMode());
  }

  function boot() {
    const appShell = document.getElementById("appShell");

    if (appShell) {
      appShellObserver = new MutationObserver(() => {
        clearTimeout(syncTimer);
        syncTimer = setTimeout(sync, 100);
      });

      appShellObserver.observe(appShell, {
        attributes: true,
        attributeFilter: ["hidden"]
      });
    }

    // Não mexe na tela de login; só tenta sincronizar se já estiver logado.
    sync();

    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);

    // Pequeno intervalo para pegar o momento em que o app renderiza depois do login.
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      sync();
      if (attempts > 20 || appIsAuthenticated()) clearInterval(interval);
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
