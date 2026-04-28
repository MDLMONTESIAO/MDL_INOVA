(function () {
  const STORAGE_KEY = "mdl.artistSongViewMode";
  const MODES = [
    { id: "list", label: "Lista" },
    { id: "small", label: "Ícones pequenos" },
    { id: "large", label: "Ícones grandes" }
  ];

  function getMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.some((mode) => mode.id === saved) ? saved : "list";
  }

  function setMode(mode) {
    const nextMode = MODES.some((item) => item.id === mode) ? mode : "list";
    localStorage.setItem(STORAGE_KEY, nextMode);
    document.documentElement.setAttribute("data-artist-song-view", nextMode);
    updateButtons(nextMode);
  }

  function updateButtons(activeMode) {
    document.querySelectorAll(".artist-view-switcher button[data-artist-song-mode]").forEach((button) => {
      const active = button.dataset.artistSongMode === activeMode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function createSwitcher() {
    const wrapper = document.createElement("div");
    wrapper.className = "artist-view-switcher";
    wrapper.setAttribute("aria-label", "Modo de visualização das músicas");

    MODES.forEach((mode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = mode.label;
      button.dataset.artistSongMode = mode.id;
      button.addEventListener("click", () => setMode(mode.id));
      wrapper.appendChild(button);
    });

    return wrapper;
  }

  function ensureSwitcher() {
    const artistView = document.getElementById("view-artistas");
    if (!artistView) return;

    const sectionHead = artistView.querySelector(".section-head") || artistView;
    if (!sectionHead.querySelector(".artist-view-switcher")) {
      sectionHead.appendChild(createSwitcher());
    }

    updateButtons(getMode());
  }

  function init() {
    setMode(getMode());
    ensureSwitcher();

    const observer = new MutationObserver(() => {
      ensureSwitcher();
      document.documentElement.setAttribute("data-artist-song-view", getMode());
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
