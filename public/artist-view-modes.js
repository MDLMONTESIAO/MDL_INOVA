(function () {
  const MIN_WIDTH = 700;
  const STORAGE_KEY = "mdl.songViewMode";
  const modes = [
    { id: "list", label: "Lista", icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M8 6h13'></path><path d='M8 12h13'></path><path d='M8 18h13'></path><path d='M3 6h.01'></path><path d='M3 12h.01'></path><path d='M3 18h.01'></path></svg>" },
    { id: "small", label: "Ícones pequenos", icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><rect x='3' y='3' width='7' height='7' rx='2'></rect><rect x='14' y='3' width='7' height='7' rx='2'></rect><rect x='3' y='14' width='7' height='7' rx='2'></rect><rect x='14' y='14' width='7' height='7' rx='2'></rect></svg>" },
    { id: "large", label: "Ícones grandes", icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><rect x='3' y='3' width='18' height='18' rx='4'></rect><path d='M8 16h8'></path><path d='M8 12h8'></path></svg>" }
  ];

  function isTabletOrPc() {
    return window.innerWidth >= MIN_WIDTH;
  }

  function getMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return modes.some((mode) => mode.id === saved) ? saved : "large";
  }

  function setMode(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
    applyMode();
  }

  function activeView() {
    return document.querySelector(".view.active") || document.getElementById("view-acervo") || document.body;
  }

  function removeOldPlainTexts() {
    document.querySelectorAll(".mdl-view-toolbar-broken, .artist-view-mode-toolbar-broken").forEach((el) => el.remove());
    document.querySelectorAll("div, span, p").forEach((el) => {
      if (el.classList.contains("mdl-view-toolbar")) return;
      const text = (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (text === "lista ícones pequenos ícones grandes" || text === "lista icones pequenos icones grandes") {
        el.remove();
      }
    });
  }

  function findInsertPoint(view) {
    return view.querySelector(".library-toolbar") || view.querySelector(".section-head") || view.firstElementChild || view;
  }

  function ensureToolbar() {
    removeOldPlainTexts();

    if (!isTabletOrPc()) {
      document.querySelectorAll(".mdl-view-toolbar").forEach((toolbar) => toolbar.remove());
      document.body.classList.remove("mdl-view-mode-enabled", "mdl-view-list", "mdl-view-small", "mdl-view-large");
      return;
    }

    const view = activeView();
    const hasList = view.querySelector("#songList, #favoriteList, #artistList, .song-list");
    if (!hasList) return;

    document.querySelectorAll(".mdl-view-toolbar").forEach((toolbar) => {
      if (!view.contains(toolbar)) toolbar.remove();
    });

    let toolbar = view.querySelector(".mdl-view-toolbar");
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.className = "mdl-view-toolbar";
      toolbar.setAttribute("aria-label", "Modo de visualização");
      modes.forEach((mode) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mdl-view-button";
        button.dataset.viewMode = mode.id;
        button.innerHTML = mode.icon + "<span>" + mode.label + "</span>";
        button.addEventListener("click", () => setMode(mode.id));
        toolbar.appendChild(button);
      });
      const insertPoint = findInsertPoint(view);
      insertPoint.insertAdjacentElement("afterend", toolbar);
    }
  }

  function extractUrl(value) {
    const text = String(value || "");
    const match = text.match(/url\(["']?([^"')]+)["']?\)/i);
    return match ? match[1] : "";
  }

  function applyCardCovers() {
    document.querySelectorAll(".song-card").forEach((card) => {
      let src = "";
      const img = card.querySelector("img[src]");
      if (img && img.src) src = img.src;

      if (!src) {
        const bg = getComputedStyle(card).backgroundImage || card.style.backgroundImage;
        src = extractUrl(bg);
      }

      if (!src) {
        const innerBg = Array.from(card.querySelectorAll("*")).map((el) => getComputedStyle(el).backgroundImage || el.style.backgroundImage).find((bg) => bg && bg !== "none");
        src = extractUrl(innerBg);
      }

      if (src) {
        card.style.setProperty("--mdl-card-cover", "url('" + src.replace(/'/g, "%27") + "')");
      } else {
        card.style.setProperty("--mdl-card-cover", "linear-gradient(135deg, #171925, #0b0c13)");
      }
    });
  }

  function applyMode() {
    ensureToolbar();
    const enabled = isTabletOrPc();
    const mode = getMode();

    document.body.classList.toggle("mdl-view-mode-enabled", enabled);
    document.body.classList.toggle("mdl-view-list", enabled && mode === "list");
    document.body.classList.toggle("mdl-view-small", enabled && mode === "small");
    document.body.classList.toggle("mdl-view-large", enabled && mode === "large");

    document.querySelectorAll(".mdl-view-button").forEach((button) => {
      const active = button.dataset.viewMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    applyCardCovers();
  }

  let timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(applyMode, 80);
  }

  document.addEventListener("DOMContentLoaded", schedule);
  window.addEventListener("resize", schedule);
  document.addEventListener("click", () => setTimeout(schedule, 120), true);
  document.addEventListener("input", () => setTimeout(schedule, 120), true);

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });

  schedule();
})();
