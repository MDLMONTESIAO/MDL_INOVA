const NOTE_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const NOTE_INDEX = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11
};
const CHORD_TOKEN_PATTERN = /\b([A-G](?:#|b)?)([0-9A-Za-zº°+\-#b()]*)(?:\/([A-G](?:#|b)?))?\b/g;
const STRING_LABELS = ["E", "A", "D", "G", "B", "e"];
const CHORD_FAMILY_META = {
  major: { label: "Maior", intervals: [0, 4, 7], lookup: "", shapeFamily: "major" },
  minor: { label: "Menor", intervals: [0, 3, 7], lookup: "m", shapeFamily: "minor" },
  "7": { label: "Sétima", intervals: [0, 4, 7, 10], lookup: "7", shapeFamily: "7" },
  maj7: { label: "Sétima maior", intervals: [0, 4, 7, 11], lookup: "maj7", shapeFamily: "maj7" },
  m7: { label: "Menor com sétima", intervals: [0, 3, 7, 10], lookup: "m7", shapeFamily: "m7" },
  sus2: { label: "Suspenso 2", intervals: [0, 2, 7], lookup: "sus2", shapeFamily: "major", approximate: true },
  sus4: { label: "Suspenso 4", intervals: [0, 5, 7], lookup: "sus4", shapeFamily: "sus4" },
  "7sus4": { label: "Sétima com quarta", intervals: [0, 5, 7, 10], lookup: "7sus4", shapeFamily: "7sus4" },
  add9: { label: "Com nona", intervals: [0, 4, 7, 2], lookup: "add9", shapeFamily: "major", approximate: true },
  madd9: { label: "Menor com nona", intervals: [0, 3, 7, 2], lookup: "madd9", shapeFamily: "minor", approximate: true },
  "9": { label: "Sétima com nona", intervals: [0, 4, 7, 10, 2], lookup: "9", shapeFamily: "7", approximate: true },
  m9: { label: "Menor com nona", intervals: [0, 3, 7, 10, 2], lookup: "m9", shapeFamily: "m7", approximate: true },
  power: { label: "Power chord", intervals: [0, 7], lookup: "5", shapeFamily: "power" },
  dim: { label: "Diminuto", intervals: [0, 3, 6], lookup: "dim", shapeFamily: null },
  aug: { label: "Aumentado", intervals: [0, 4, 8], lookup: "aug", shapeFamily: null }
};
const CHORD_SHAPE_LIBRARY = {
  C: { frets: ["x", 3, 2, 0, 1, 0], label: "Forma aberta" },
  D: { frets: ["x", "x", 0, 2, 3, 2], label: "Forma aberta" },
  E: { frets: [0, 2, 2, 1, 0, 0], label: "Forma aberta" },
  F: { frets: [1, 3, 3, 2, 1, 1], label: "Forma aberta" },
  G: { frets: [3, 2, 0, 0, 0, 3], label: "Forma aberta" },
  A: { frets: ["x", 0, 2, 2, 2, 0], label: "Forma aberta" },
  Bb: { frets: ["x", 1, 3, 3, 3, 1], label: "Forma sugerida", baseFret: 1 },
  B: { frets: ["x", 2, 4, 4, 4, 2], label: "Forma sugerida", baseFret: 2 },
  Cm: { frets: ["x", 3, 5, 5, 4, 3], label: "Forma sugerida", baseFret: 3 },
  Dm: { frets: ["x", "x", 0, 2, 3, 1], label: "Forma aberta" },
  Em: { frets: [0, 2, 2, 0, 0, 0], label: "Forma aberta" },
  Fm: { frets: [1, 3, 3, 1, 1, 1], label: "Forma sugerida", baseFret: 1 },
  "F#m": { frets: [2, 4, 4, 2, 2, 2], label: "Forma sugerida", baseFret: 2 },
  Gm: { frets: [3, 5, 5, 3, 3, 3], label: "Forma sugerida", baseFret: 3 },
  Am: { frets: ["x", 0, 2, 2, 1, 0], label: "Forma aberta" },
  Bm: { frets: ["x", 2, 4, 4, 3, 2], label: "Forma sugerida", baseFret: 2 },
  C7: { frets: ["x", 3, 2, 3, 1, 0], label: "Forma aberta" },
  D7: { frets: ["x", "x", 0, 2, 1, 2], label: "Forma aberta" },
  E7: { frets: [0, 2, 0, 1, 0, 0], label: "Forma aberta" },
  F7: { frets: [1, 3, 1, 2, 1, 1], label: "Forma sugerida", baseFret: 1 },
  G7: { frets: [3, 2, 0, 0, 0, 1], label: "Forma aberta" },
  A7: { frets: ["x", 0, 2, 0, 2, 0], label: "Forma aberta" },
  A9: { frets: ["x", 0, 2, 4, 2, 3], label: "Forma aberta" },
  B7: { frets: ["x", 2, 1, 2, 0, 2], label: "Forma aberta" },
  Cmaj7: { frets: ["x", 3, 2, 0, 0, 0], label: "Forma aberta" },
  Dmaj7: { frets: ["x", "x", 0, 2, 2, 2], label: "Forma aberta" },
  Emaj7: { frets: [0, 2, 1, 1, 0, 0], label: "Forma aberta" },
  Fmaj7: { frets: ["x", "x", 3, 2, 1, 0], label: "Forma aberta" },
  Amaj7: { frets: ["x", 0, 2, 1, 2, 0], label: "Forma aberta" },
  Am7: { frets: ["x", 0, 2, 0, 1, 0], label: "Forma aberta" },
  Bm7: { frets: ["x", 2, 4, 2, 3, 2], label: "Forma sugerida", baseFret: 2 },
  Dm7: { frets: ["x", "x", 0, 2, 1, 1], label: "Forma aberta" },
  Em7: { frets: [0, 2, 2, 0, 3, 0], label: "Forma aberta" },
  "F#m7": { frets: [2, 4, 2, 2, 2, 2], label: "Forma sugerida", baseFret: 2 },
  Gm7: { frets: [3, 5, 3, 3, 3, 3], label: "Forma sugerida", baseFret: 3 },
  Asus4: { frets: ["x", 0, 2, 2, 3, 0], label: "Forma aberta" },
  Dsus4: { frets: ["x", "x", 0, 2, 3, 3], label: "Forma aberta" },
  Esus4: { frets: [0, 2, 2, 2, 0, 0], label: "Forma aberta" },
  A7sus4: { frets: ["x", 0, 2, 0, 3, 0], label: "Forma aberta" },
  Cadd9: { frets: ["x", 3, 2, 0, 3, 3], label: "Forma aberta" },
  Gadd9: { frets: [3, 2, 0, 0, 3, 0], label: "Forma aberta" },
  "G/B": { frets: ["x", 2, 0, 0, 0, 3], label: "Baixo em B" },
  "D/F#": { frets: [2, "x", 0, 2, 3, 2], label: "Baixo em F#" },
  "A/C#": { frets: ["x", 4, 2, 2, 2, 0], label: "Baixo em C#", baseFret: 1 },
  "A9/C#": { frets: ["x", 4, 5, 4, 5, 5], label: "Baixo em C#", baseFret: 4 },
  "E/G#": { frets: [4, 2, 2, 1, 0, 0], label: "Baixo em G#", baseFret: 1 }
};
const MOVABLE_CHORD_SHAPES = {
  major: {
    lowE: { template: [0, 2, 2, 1, 0, 0], label: "Forma móvel de E" },
    a: { template: ["x", 0, 2, 2, 2, 0], label: "Forma móvel de A" }
  },
  minor: {
    lowE: { template: [0, 2, 2, 0, 0, 0], label: "Forma móvel de Em" },
    a: { template: ["x", 0, 2, 2, 1, 0], label: "Forma móvel de Am" }
  },
  "7": {
    lowE: { template: [0, 2, 0, 1, 0, 0], label: "Forma móvel de E7" },
    a: { template: ["x", 0, 2, 0, 2, 0], label: "Forma móvel de A7" }
  },
  maj7: {
    lowE: { template: [0, 2, 1, 1, 0, 0], label: "Forma móvel de E7M" },
    a: { template: ["x", 0, 2, 1, 2, 0], label: "Forma móvel de A7M" }
  },
  m7: {
    lowE: { template: [0, 2, 0, 0, 0, 0], label: "Forma móvel de Em7" },
    a: { template: ["x", 0, 2, 0, 1, 0], label: "Forma móvel de Am7" }
  },
  sus4: {
    lowE: { template: [0, 2, 2, 2, 0, 0], label: "Forma móvel de Esus4" },
    a: { template: ["x", 0, 2, 2, 3, 0], label: "Forma móvel de Asus4" }
  },
  "7sus4": {
    lowE: { template: [0, 2, 0, 2, 0, 0], label: "Forma móvel de E7sus4" },
    a: { template: ["x", 0, 2, 0, 3, 0], label: "Forma móvel de A7sus4" }
  },
  power: {
    lowE: { template: [0, 2, 2, "x", "x", "x"], label: "Power chord" },
    a: { template: ["x", 0, 2, 2, "x", "x"], label: "Power chord" }
  }
};
const OPEN_STRING_NOTE_INDEX = { lowE: 4, a: 9 };
const OFFLINE_DB_NAME = "mdl-acervo-offline";
const OFFLINE_DB_VERSION = 1;

const state = {
  songs: [],
  filtered: [],
  currentView: "acervo",
  currentSongId: null,
  previousView: "acervo",
  currentSheetHtml: "",
  transposeOffset: 0,
  baseKey: null,
  activeChordBase: null,
  chordGuideOpen: false,
  generatedAt: null,
  playEditing: false,
  autoScrollTimer: null,
  offlineSongs: new Set(),
  readerFont: Number(localStorage.getItem("mdl.readerFont") || 14),
  favorites: new Set(JSON.parse(localStorage.getItem("mdl.favorites") || "[]")),
  play: migratePlay(JSON.parse(localStorage.getItem("mdl.playEnsaio") || "[]"))
};

const sampleSongs = [
  { id: "sample-a-casa-e-sua", title: "A Casa É Sua", artist: "Julliany Souza", collection: "Exemplo", fileType: "html", key: "C" },
  { id: "sample-me-atraiu", title: "Me Atraiu", artist: "Gabriela Rocha", collection: "Exemplo", fileType: "html", key: "D" },
  { id: "sample-consagracao", title: "Consagração", artist: "Aline Barros", collection: "Exemplo", fileType: "html", key: "A" }
];

const sampleSheets = {
  "sample-a-casa-e-sua": `<span class="part">Intro</span>
<i>C     G/B     Am7     F</i>

<span class="part">Verso</span>
<i>C</i>        <i>G/B</i>
Linha da letra alinhada
<i>Am7</i>       <i>F</i>
Com acordes destacados

<span class="part">Coro</span>
<i>C</i>         <i>G</i>
Texto grande e limpo
<i>Am7</i>       <i>F</i>
Para leitura no celular`,
  "sample-me-atraiu": `<span class="part">Intro</span>
<i>D     A/C#     Bm7     G</i>

<span class="part">Verso</span>
<i>D</i>         <i>A/C#</i>
Separada para o ensaio
<i>Bm7</i>       <i>G</i>
Com botões grandes`,
  "sample-consagracao": `<span class="part">Tom</span>
<i>A</i>

<span class="part">Verso</span>
<i>A</i>        <i>E/G#</i>
Cifra de exemplo
<i>F#m7</i>     <i>D</i>
Pronta para abrir`
};

const dom = {
  search: document.getElementById("searchInput"),
  libraryStats: document.getElementById("libraryStats"),
  favoriteStats: document.getElementById("favoriteStats"),
  playStats: document.getElementById("playStats"),
  artistStats: document.getElementById("artistStats"),
  playCount: document.getElementById("playCount"),
  worshipCount: document.getElementById("worshipCount"),
  worshipProgress: document.getElementById("worshipProgress"),
  editPlayButton: document.getElementById("editPlayButton"),
  songList: document.getElementById("songList"),
  favoriteList: document.getElementById("favoriteList"),
  playList: document.getElementById("playList"),
  artistList: document.getElementById("artistList"),
  readerTitle: document.getElementById("readerTitle"),
  readerArtist: document.getElementById("readerArtist"),
  toneButton: document.getElementById("toneButton"),
  autoButton: document.getElementById("autoButton"),
  chordSheet: document.getElementById("chordSheet"),
  chordGuide: document.getElementById("chordGuide"),
  chordGuideName: document.getElementById("chordGuideName"),
  chordGuideMeta: document.getElementById("chordGuideMeta"),
  chordGuideDiagram: document.getElementById("chordGuideDiagram"),
  chordGuideNotes: document.getElementById("chordGuideNotes"),
  chordGuideHint: document.getElementById("chordGuideHint"),
  adminSongCount: document.getElementById("adminSongCount"),
  adminArtistCount: document.getElementById("adminArtistCount"),
  adminUpdatedAt: document.getElementById("adminUpdatedAt")
};

init();

async function init() {
  registerServiceWorker();
  savePlay();
  await loadSongs();
  await refreshOfflineSongIds();
  applyPreviewState();
  bindEvents();
  applyReaderPreferences();
  filterSongs();
  renderAll();
  downloadPlayForOffline();

  const requestedView = new URLSearchParams(location.search).get("screen");
  const requestedSong = new URLSearchParams(location.search).get("song");
  if (location.pathname.toLowerCase().startsWith("/admin")) {
    showView("admin");
  } else if (requestedSong) {
    openSong(requestedSong);
  } else if (["acervo", "favoritas", "play", "artistas"].includes(requestedView)) {
    showView(requestedView);
  }

  setInterval(autoRefreshLibrary, 30000);
}

function applyPreviewState() {
  const params = new URLSearchParams(location.search);
  if (params.get("demo") === "culto") {
    state.play = state.songs.slice(0, 5).map((song) => ({ id: song.id, key: song.key || null }));
  }
}

async function loadSongs() {
  try {
    const response = await fetch(`/api/catalog?limit=5000&v=${Date.now()}`);
    if (!response.ok) throw new Error("index-not-found");
    const data = await response.json();
    state.generatedAt = data.generatedAt || null;
    state.songs = Array.isArray(data.songs) && data.songs.length ? data.songs : sampleSongs;
    idbSetMeta("catalog", {
      generatedAt: state.generatedAt,
      songs: state.songs
    }).catch(() => {});
  } catch {
    const offlineCatalog = await idbGetMeta("catalog").catch(() => null);
    state.generatedAt = offlineCatalog?.generatedAt || null;
    state.songs = Array.isArray(offlineCatalog?.songs) && offlineCatalog.songs.length
      ? offlineCatalog.songs
      : sampleSongs;
  }
}

function bindEvents() {
  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeyDown);
  dom.search.addEventListener("input", () => {
    filterSongs();
    renderCatalog();
    if (state.currentView !== "acervo") showView("acervo");
  });
}

function handleClick(event) {
  const chord = event.target.closest("[data-chord]");
  if (chord?.dataset.chord) {
    event.preventDefault();
    return openChordGuide(chord.dataset.chord);
  }

  const button = event.target.closest("button");
  if (!button) return;

  const view = button.dataset.view;
  const action = button.dataset.action;
  const id = button.dataset.id;
  const artist = button.dataset.artist;

  if (view) {
    if (view !== state.currentView && state.currentView !== "reader") {
      state.previousView = state.currentView;
    }
    return showView(view);
  }
  if (artist) return renderArtistSongs(artist);
  if (!action) return;

  if (action === "open") return openSong(id);
  if (action === "add-play") return addToPlay(id);
  if (action === "remove-play") return removeFromPlay(id);
  if (action === "favorite") return toggleFavorite(id);
  if (action === "clear-play") return clearPlay();
  if (action === "refresh") return refreshLibrary();
  if (action === "back") return showView(state.previousView || "acervo");
  if (action === "back-play") return showView(state.previousView && state.previousView !== "play" ? state.previousView : "acervo");
  if (action === "go-home") return showView("acervo");
  if (action === "favorite-current") return toggleFavorite(state.currentSongId);
  if (action === "add-current-play") return addToPlay(state.currentSongId, currentKeyLabel());
  if (action === "font-down") return setReaderFont(state.readerFont - 1);
  if (action === "font-up") return setReaderFont(state.readerFont + 1);
  if (action === "transpose-down") return transposeCurrentSong(-1);
  if (action === "transpose-up") return transposeCurrentSong(1);
  if (action === "reset-tone") return resetTone();
  if (action === "toggle-autoscroll") return toggleAutoScroll();
  if (action === "start-service") return startService();
  if (action === "share-play") return sharePlay();
  if (action === "toggle-edit-play") return togglePlayEditing();
  if (action === "admin-refresh") return adminRefresh();
  if (action === "close-chord-guide") return closeChordGuide();
}

function handleKeyDown(event) {
  if ((event.key === "Enter" || event.key === " ") && event.target?.dataset?.chord) {
    event.preventDefault();
    openChordGuide(event.target.dataset.chord);
    return;
  }

  if (event.key === "Escape" && state.chordGuideOpen) {
    closeChordGuide();
  }
}

function filterSongs() {
  const query = normalize(dom.search.value);
  if (!query) {
    state.filtered = state.songs.slice(0, 80);
    return;
  }

  state.filtered = state.songs
    .filter((song) => normalize(`${song.title} ${song.artist} ${song.collection || ""}`).includes(query))
    .slice(0, 100);
}

function renderAll() {
  renderCatalog();
  renderFavorites();
  renderPlay();
  renderArtists();
  updateStats();
}

function renderCatalog() {
  dom.songList.innerHTML = state.filtered.length
    ? state.filtered.map(renderSongCard).join("")
    : emptyState("Nenhuma música encontrada.");
}

function renderFavorites() {
  const songs = state.songs.filter((song) => state.favorites.has(song.id));
  dom.favoriteList.innerHTML = songs.length
    ? songs.map(renderSongCard).join("")
    : emptyState("Suas favoritas aparecem aqui.");
}

function renderPlay() {
  const entries = state.play
    .map((entry) => ({ entry, song: findSong(entry.id) }))
    .filter(({ song }) => Boolean(song));

  dom.playList.innerHTML = entries.length
    ? entries.map(({ entry, song }, index) => renderWorshipSong(entry, song, index)).join("")
    : emptyState("Adicione músicas pelo botão + no acervo. Elas aparecem aqui para o culto.");

  if (dom.editPlayButton) {
    dom.editPlayButton.textContent = state.playEditing ? "Concluir" : "Editar";
  }
  updateStats();
}

function renderArtists() {
  const groups = new Map();
  state.songs.forEach((song) => {
    groups.set(song.artist, (groups.get(song.artist) || 0) + 1);
  });

  const artists = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  dom.artistList.innerHTML = artists.map(([artist, count]) => `
    <button class="artist-card" type="button" data-artist="${escapeAttr(artist)}">
      <span class="artist-main">
        <span class="artist-title">${escapeHtml(artist)}</span>
        <span class="artist-meta">${count} ${count === 1 ? "música" : "músicas"}</span>
      </span>
      <span class="mini-action primary" aria-hidden="true">›</span>
    </button>
  `).join("");
  updateStats();
}

function renderArtistSongs(artist) {
  dom.search.value = artist;
  state.filtered = state.songs.filter((song) => song.artist === artist).slice(0, 120);
  showView("acervo");
  renderCatalog();
}

function renderSongCard(song) {
  const favoriteClass = state.favorites.has(song.id) ? "mini-action active" : "mini-action";
  return `
    <article class="song-card">
      <button class="song-main" type="button" data-action="open" data-id="${escapeAttr(song.id)}">
        <span class="song-title">${escapeHtml(song.title)}</span>
        <span class="song-meta">${escapeHtml(song.artist)}${song.collection ? ` · ${escapeHtml(song.collection)}` : ""}</span>
      </button>
      <div class="song-actions">
        <button class="${favoriteClass}" type="button" data-action="favorite" data-id="${escapeAttr(song.id)}" title="Favoritar">☆</button>
        <button class="mini-action primary" type="button" data-action="add-play" data-id="${escapeAttr(song.id)}" title="Adicionar ao culto">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
        </button>
      </div>
    </article>
  `;
}

function renderWorshipSong(entry, song, index) {
  const key = entry.key || song.key || "Tom";
  const offlineBadge = state.offlineSongs.has(song.id) ? `<span class="offline-badge">offline</span>` : "";
  const removeButton = state.playEditing
    ? `<button class="worship-remove" type="button" data-action="remove-play" data-id="${escapeAttr(song.id)}" title="Remover cifra">×</button>`
    : "";

  return `
    <article class="worship-song">
      <span class="worship-index">${index + 1}</span>
      <button class="worship-song-main" type="button" data-action="open" data-id="${escapeAttr(song.id)}">
        <strong>${escapeHtml(song.title)}</strong>
        <span>${escapeHtml(song.artist)}</span>
      </button>
      ${offlineBadge}
      <span class="tone-pill">${escapeHtml(key)}</span>
      ${removeButton}
    </article>
  `;
}

async function openSong(id) {
  const song = findSong(id);
  if (!song) return;

  state.previousView = state.currentView === "reader" ? state.previousView : state.currentView;
  state.currentSongId = id;
  state.transposeOffset = 0;
  state.baseKey = song.key || null;
  state.activeChordBase = null;
  state.currentSheetHtml = "";
  dom.readerTitle.textContent = song.title;
  dom.readerArtist.textContent = song.artist;
  dom.chordSheet.innerHTML = `<div class="loader">Abrindo cifra...</div>`;
  closeChordGuide(true);
  showView("reader");

  try {
    const response = await fetch(`/api/songs/${encodeURIComponent(id)}?v=${Date.now()}`);
    if (!response.ok) throw new Error("song-not-found");
    const data = await response.json();
    idbSaveSong(data).catch(() => {});
    state.offlineSongs.add(id);
    state.currentSheetHtml = normalizeSheetContent(data.html || "");
    state.baseKey = song.key || inferKeyFromHtml(state.currentSheetHtml);
  } catch {
    const offlineSong = await idbGetSong(id);
    state.currentSheetHtml = normalizeSheetContent(offlineSong?.html || sampleSheets[id] || `${escapeHtml(song.title)}\n\nCifra ainda não importada.`);
    state.baseKey = song.key || inferKeyFromHtml(state.currentSheetHtml);
  }

  renderCurrentSheet();
}

function renderCurrentSheet() {
  const html = transposeHtml(state.currentSheetHtml, state.transposeOffset);
  dom.chordSheet.innerHTML = `<pre>${decorateChordHtml(html)}</pre>`;
  applyReaderPreferences();
  updateToneButton();
  if (state.chordGuideOpen && state.activeChordBase) {
    refreshChordGuide();
  }
}

function openChordGuide(chordName) {
  const currentChord = String(chordName || "").trim();
  if (!currentChord) return;

  stopAutoScroll();
  state.activeChordBase = transposeChordText(currentChord, -state.transposeOffset);
  state.chordGuideOpen = true;
  refreshChordGuide();
}

function refreshChordGuide() {
  if (!state.activeChordBase) return closeChordGuide();

  const currentChord = transposeChordText(state.activeChordBase, state.transposeOffset);
  const guide = buildChordGuide(currentChord);
  if (!guide) return closeChordGuide();

  dom.chordGuideName.textContent = guide.name;
  dom.chordGuideMeta.textContent = guide.meta;
  dom.chordGuideNotes.innerHTML = guide.notes.map((note) => `<span>${escapeHtml(note)}</span>`).join("");
  dom.chordGuideHint.textContent = guide.hint;
  dom.chordGuideDiagram.innerHTML = renderChordGuideDiagram(guide);
  dom.chordGuide.classList.add("open");
  dom.chordGuide.setAttribute("aria-hidden", "false");
  document.body.classList.add("chord-guide-open");
}

function closeChordGuide(preserveBase = false) {
  state.chordGuideOpen = false;
  if (!preserveBase) state.activeChordBase = null;
  dom.chordGuide.classList.remove("open");
  dom.chordGuide.setAttribute("aria-hidden", "true");
  document.body.classList.remove("chord-guide-open");
}

function addToPlay(id, selectedKey = null) {
  if (!id) return;
  const song = findSong(id);
  if (!song) return;

  const existing = state.play.find((entry) => entry.id === id);
  if (existing) {
    if (selectedKey) existing.key = selectedKey;
  } else {
    state.play.push({ id, key: selectedKey || song.key || null });
  }

  savePlay();
  renderPlay();
  toast("Adicionada ao Culto de Domingo");
  downloadSongForOffline(id);
}

function removeFromPlay(id) {
  state.play = state.play.filter((entry) => entry.id !== id);
  savePlay();
  renderPlay();
}

function clearPlay() {
  state.play = [];
  savePlay();
  renderPlay();
}

function toggleFavorite(id) {
  if (!id) return;
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
  } else {
    state.favorites.add(id);
  }
  localStorage.setItem("mdl.favorites", JSON.stringify(Array.from(state.favorites)));
  renderCatalog();
  renderFavorites();
  updateStats();
}

async function refreshLibrary() {
  await loadSongs();
  filterSongs();
  renderAll();
}

async function autoRefreshLibrary() {
  if (state.currentView === "reader") return;
  const before = state.songs.length;
  await loadSongs();
  if (state.songs.length !== before) {
    filterSongs();
    renderAll();
  }
}

function showView(viewName) {
  if (viewName !== "reader") {
    stopAutoScroll();
    closeChordGuide(true);
  }
  state.currentView = viewName;
  ["acervo", "favoritas", "play", "artistas", "reader", "admin"].forEach((name) => {
    document.body.classList.remove(`screen-${name}`);
  });
  document.body.classList.add(`screen-${viewName}`);

  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelectorAll(".quick-card").forEach((card) => card.classList.remove("active"));

  const view = document.getElementById(`view-${viewName}`);
  if (view) view.classList.add("active");

  const quick = document.querySelector(`[data-view="${viewName}"]`);
  if (quick) quick.classList.add("active");
}

function setReaderFont(size) {
  state.readerFont = Math.max(12, Math.min(24, size));
  localStorage.setItem("mdl.readerFont", String(state.readerFont));
  applyReaderPreferences();
}

function applyReaderPreferences() {
  dom.chordSheet.style.setProperty("--reader-font", `${state.readerFont}px`);
}

function transposeCurrentSong(direction) {
  state.transposeOffset += direction;
  renderCurrentSheet();
}

function resetTone() {
  state.transposeOffset = 0;
  renderCurrentSheet();
}

function toggleAutoScroll() {
  if (state.autoScrollTimer) {
    stopAutoScroll();
    return;
  }

  state.autoScrollTimer = setInterval(() => {
    dom.chordSheet.scrollTop += 1;
    const finished = dom.chordSheet.scrollTop + dom.chordSheet.clientHeight >= dom.chordSheet.scrollHeight - 2;
    if (finished) stopAutoScroll();
  }, 65);

  if (dom.autoButton) dom.autoButton.classList.add("active");
}

function stopAutoScroll() {
  if (state.autoScrollTimer) {
    clearInterval(state.autoScrollTimer);
    state.autoScrollTimer = null;
  }
  if (dom.autoButton) dom.autoButton.classList.remove("active");
}

function updateToneButton() {
  if (!dom.toneButton) return;
  dom.toneButton.textContent = currentKeyLabel();
}

function currentKeyLabel() {
  if (!state.baseKey) return "Tom";
  return `Tom ${transposeNote(state.baseKey, state.transposeOffset)}`;
}

function startService() {
  const first = state.play[0];
  if (!first) return toast("Adicione músicas ao culto primeiro");
  openSong(first.id);
}

async function sharePlay() {
  const songs = state.play.map((entry, index) => {
    const song = findSong(entry.id);
    if (!song) return null;
    return `${index + 1}. ${song.title} - ${song.artist} (${entry.key || song.key || "Tom"})`;
  }).filter(Boolean);

  if (!songs.length) return toast("Nenhuma música no culto");

  const text = `Culto de Domingo - MDL Monte Sião\n\n${songs.join("\n")}`;
  if (navigator.share) {
    await navigator.share({ title: "Culto de Domingo", text });
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    toast("Lista copiada");
  } else {
    toast("Compartilhamento indisponível");
  }
}

function togglePlayEditing() {
  state.playEditing = !state.playEditing;
  renderPlay();
}

async function adminRefresh() {
  try {
    await fetch("/api/import", { method: "POST" });
    toast("Atualizando acervo");
    setTimeout(refreshLibrary, 1600);
  } catch {
    toast("Não foi possível atualizar");
  }
}

function updateStats() {
  const total = state.songs.length;
  const artists = new Set(state.songs.map((song) => song.artist)).size;
  dom.libraryStats.textContent = `${total} ${total === 1 ? "música" : "músicas"} · ${artists} ${artists === 1 ? "artista" : "artistas"}`;
  dom.favoriteStats.textContent = `${state.favorites.size} ${state.favorites.size === 1 ? "música" : "músicas"}`;
  if (dom.playStats) dom.playStats.textContent = `${state.play.length} ${state.play.length === 1 ? "música separada" : "músicas separadas"}`;
  dom.playCount.textContent = String(state.play.length);
  if (dom.worshipCount) dom.worshipCount.textContent = String(state.play.length);
  if (dom.worshipProgress) dom.worshipProgress.style.width = state.play.length ? `${Math.min(100, Math.max(26, state.play.length * 20))}%` : "0%";
  dom.artistStats.textContent = `${artists} ${artists === 1 ? "artista" : "artistas"}`;
  if (dom.adminSongCount) dom.adminSongCount.textContent = formatNumber(total);
  if (dom.adminArtistCount) dom.adminArtistCount.textContent = formatNumber(artists);
  if (dom.adminUpdatedAt) dom.adminUpdatedAt.textContent = state.generatedAt ? `Atualizada hoje às ${formatTime(state.generatedAt)}` : "Atualizada automaticamente";
}

function savePlay() {
  localStorage.setItem("mdl.playEnsaio", JSON.stringify(state.play));
  updateStats();
}

function findSong(id) {
  return state.songs.find((song) => song.id === id);
}

function migratePlay(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === "string") return { id: item, key: null };
      if (item && typeof item.id === "string") return { id: item.id, key: item.key || null };
      return null;
    })
    .filter(Boolean);
}

async function downloadSongForOffline(id) {
  if (!id) return;
  try {
    const response = await fetch(`/api/songs/${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error("download-failed");
    const song = await response.json();
    await idbSaveSong(song);
    state.offlineSongs.add(id);
    renderPlay();
    toast("Cifra disponível offline");
  } catch {
    const cached = await idbGetSong(id);
    if (!cached) toast("Não foi possível baixar offline");
  }
}

async function downloadPlayForOffline() {
  const ids = state.play.map((entry) => entry.id).filter(Boolean);
  if (!ids.length) return;

  try {
    const response = await fetch("/api/offline-bundle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    });
    if (!response.ok) throw new Error("bundle-failed");
    const bundle = await response.json();
    for (const song of bundle.songs || []) {
      await idbSaveSong(song);
      state.offlineSongs.add(song.id);
    }
    renderPlay();
  } catch {
    await Promise.all(ids.map((id) => downloadSongForOffline(id)));
  }
}

async function refreshOfflineSongIds() {
  const songs = await idbGetAllSongs().catch(() => []);
  state.offlineSongs = new Set(songs.map((song) => song.id));
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

function openOfflineDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("indexeddb-unavailable"));
      return;
    }
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("songs")) {
        db.createObjectStore("songs", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSaveSong(song) {
  if (!song?.id) return;
  const db = await openOfflineDb();
  await idbRequest(db.transaction("songs", "readwrite").objectStore("songs").put({
    ...song,
    savedOfflineAt: new Date().toISOString()
  }));
  db.close();
}

async function idbGetSong(id) {
  const db = await openOfflineDb();
  const song = await idbRequest(db.transaction("songs", "readonly").objectStore("songs").get(id));
  db.close();
  return song || null;
}

async function idbGetAllSongs() {
  const db = await openOfflineDb();
  const songs = await idbRequest(db.transaction("songs", "readonly").objectStore("songs").getAll());
  db.close();
  return songs || [];
}

async function idbSetMeta(key, value) {
  const db = await openOfflineDb();
  await idbRequest(db.transaction("meta", "readwrite").objectStore("meta").put({ key, value }));
  db.close();
}

async function idbGetMeta(key) {
  const db = await openOfflineDb();
  const record = await idbRequest(db.transaction("meta", "readonly").objectStore("meta").get(key));
  db.close();
  return record?.value || null;
}

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function normalizeSheetContent(html) {
  const match = String(html || "").match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  return (match ? match[1] : String(html || "")).trim();
}

function decorateChordHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("i").forEach((node) => {
    node.innerHTML = wrapChordNodeTokens(node.textContent || "");
  });
  return template.innerHTML;
}

function wrapChordNodeTokens(text) {
  let markup = "";
  let lastIndex = 0;
  CHORD_TOKEN_PATTERN.lastIndex = 0;

  text.replace(CHORD_TOKEN_PATTERN, (match, root, suffix, bass, offset) => {
    const chordText = `${root}${suffix || ""}${bass ? `/${bass}` : ""}`;
    markup += escapeHtml(text.slice(lastIndex, offset));
    markup += `<span class="chord-token" data-chord="${escapeAttr(chordText)}" role="button" tabindex="0" aria-label="Mostrar acorde ${escapeAttr(chordText)}">${escapeHtml(chordText)}</span>`;
    lastIndex = offset + chordText.length;
    return match;
  });

  if (!markup) return escapeHtml(text);
  markup += escapeHtml(text.slice(lastIndex));
  return markup;
}

function buildChordGuide(chordName) {
  const parsed = parseChordName(chordName);
  if (!parsed) return null;

  const shape = resolveChordShape(parsed);
  const metaParts = [parsed.familyMeta.label];
  if (shape?.label) metaParts.push(shape.label);
  if (parsed.bass) metaParts.push(`baixo em ${parsed.bass}`);

  let hint = "Toque em outro acorde da cifra para ver a próxima posição.";
  if (!shape) {
    hint = `Ainda não há diagrama pronto para ${parsed.name}, mas as notas do acorde já apareceram aqui.`;
  } else if (shape.approximate && parsed.bass && !shape.handlesBass) {
    hint = `Mostrando uma base compatível. Ao tocar, destaque o baixo em ${parsed.bass}.`;
  } else if (shape.approximate) {
    hint = "Mostrando uma base compatível para você ajustar a extensão direto no instrumento.";
  } else if (parsed.bass && !shape.handlesBass) {
    hint = `Use a forma principal e destaque o baixo em ${parsed.bass}.`;
  }

  return {
    name: parsed.name,
    meta: metaParts.join(" · "),
    notes: buildChordNotes(parsed),
    shape,
    hint
  };
}

function renderChordGuideDiagram(guide) {
  if (!guide.shape) {
    return `<div class="chord-guide-empty">Diagrama ainda não disponível para esse tipo de acorde.</div>`;
  }

  return `
    <div class="chord-diagram-card">
      <div class="chord-diagram-top">${renderChordMarkers(guide.shape.frets)}</div>
      <div class="chord-diagram-body${guide.shape.baseFret === 1 ? " is-open" : ""}">
        ${guide.shape.baseFret > 1 ? `<span class="chord-base-fret">${guide.shape.baseFret}</span>` : ""}
        ${STRING_LABELS.map((_, index) => `<span class="chord-string-line" style="--string:${index};"></span>`).join("")}
        ${[0, 1, 2, 3, 4, 5].map((fret) => `<span class="chord-fret-line${fret === 0 && guide.shape.baseFret === 1 ? " nut" : ""}" style="--fret:${fret};"></span>`).join("")}
        ${renderChordDots(guide.shape)}
      </div>
      <div class="chord-string-labels">${STRING_LABELS.map((label) => `<span>${label}</span>`).join("")}</div>
    </div>
  `;
}

function renderChordMarkers(frets) {
  return frets.map((fret) => {
    if (fret === "x") return `<span class="chord-marker muted">x</span>`;
    if (fret === 0) return `<span class="chord-marker open">o</span>`;
    return `<span class="chord-marker"></span>`;
  }).join("");
}

function renderChordDots(shape) {
  return shape.frets.map((fret, index) => {
    if (!Number.isInteger(fret) || fret <= 0) return "";
    const relativeFret = fret - shape.baseFret + 1;
    if (relativeFret < 1 || relativeFret > 5) return "";
    return `<span class="chord-dot" style="--string:${index}; --fret:${relativeFret};"></span>`;
  }).join("");
}

function parseChordName(chordName) {
  const normalized = String(chordName || "").trim().replace(/\s+/g, "");
  const match = normalized.match(/^([A-G](?:#|b)?)([0-9A-Za-zº°+\-#b()]*)(?:\/([A-G](?:#|b)?))?$/);
  if (!match) return null;

  const [, root, suffix = "", bass] = match;
  const family = detectChordFamilyNormalized(suffix);
  return {
    name: `${root}${suffix}${bass ? `/${bass}` : ""}`,
    root,
    suffix,
    bass: bass || null,
    family,
    familyMeta: CHORD_FAMILY_META[family] || CHORD_FAMILY_META.major
  };
}

function detectChordFamily(suffix) {
  const compact = String(suffix || "").replace(/\s+/g, "");
  if (!compact) return "major";
  if (/sus2/i.test(compact)) return "sus2";
  if (/sus4/i.test(compact) || /\(4\)/.test(compact)) return compact.includes("7") ? "7sus4" : "sus4";
  if (/dim/i.test(compact) || /[º°]/.test(compact)) return "dim";
  if (/aug/i.test(compact) || compact.includes("+")) return "aug";
  if (/maj7/i.test(compact) || /7M/.test(compact) || /M7/.test(compact)) return "maj7";
  if (/^m/i.test(compact) && compact.includes("7") && compact.includes("9")) return "m9";
  if (/^m/i.test(compact) && compact.includes("7")) return "m7";
  if (/^m/i.test(compact) && /(add9|9|2)/i.test(compact)) return "madd9";
  if (/(add9|9)/i.test(compact) && compact.includes("7")) return "9";
  if (/(add9|9|2)/i.test(compact)) return "add9";
  if (compact === "5") return "power";
  if (compact.includes("7")) return "7";
  if (/^m/i.test(compact)) return "minor";
  return "major";
}

function detectChordFamilyNormalized(suffix) {
  const compact = String(suffix || "").replace(/\s+/g, "");
  const isMinor = /^m(?!aj)/i.test(compact);
  const hasAddNine = /add\s*9/i.test(compact);
  const hasNine = /(?:^|[^0-9])9(?:$|[^0-9])/.test(compact) || /\(9\)/.test(compact);
  const hasTwo = !hasNine && (/(?:^|[^0-9])2(?:$|[^0-9])/.test(compact) || /\(2\)/.test(compact));

  if (!compact) return "major";
  if (/sus2/i.test(compact)) return "sus2";
  if (/sus4/i.test(compact) || /\(4\)/.test(compact)) return compact.includes("7") ? "7sus4" : "sus4";
  if (/dim/i.test(compact) || /[ÂºÂ°]/.test(compact)) return "dim";
  if (/aug/i.test(compact) || compact.includes("+")) return "aug";
  if (/maj7/i.test(compact) || /7M/.test(compact) || /M7/.test(compact)) return "maj7";
  if (isMinor && hasNine) return hasAddNine ? "madd9" : "m9";
  if (isMinor && compact.includes("7")) return "m7";
  if (isMinor && (hasAddNine || hasTwo)) return "madd9";
  if (hasNine) return hasAddNine ? "add9" : "9";
  if (hasAddNine || hasTwo) return "add9";
  if (compact === "5") return "power";
  if (compact.includes("7")) return "7";
  if (isMinor) return "minor";
  return "major";
}

function buildChordNotes(parsed) {
  const preferFlats = parsed.root.includes("b") || parsed.bass?.includes("b");
  const notes = parsed.familyMeta.intervals.map((interval) => transposeNote(parsed.root, interval, preferFlats));
  if (parsed.bass && !notes.includes(parsed.bass)) notes.unshift(parsed.bass);
  return Array.from(new Set(notes));
}

function resolveChordShape(parsed) {
  const exactKey = `${parsed.root}${parsed.familyMeta.lookup}${parsed.bass ? `/${parsed.bass}` : ""}`;
  const exactShape = CHORD_SHAPE_LIBRARY[exactKey];
  if (exactShape) {
    return normalizeChordShape(exactShape, { approximate: false, handlesBass: true });
  }

  const baseKey = `${parsed.root}${parsed.familyMeta.lookup}`;
  const baseShape = CHORD_SHAPE_LIBRARY[baseKey];
  if (baseShape) {
    return normalizeChordShape(baseShape, {
      approximate: Boolean(parsed.bass) || Boolean(parsed.familyMeta.approximate),
      handlesBass: !parsed.bass
    });
  }

  if (!parsed.familyMeta.shapeFamily) return null;
  return createMovableShape(parsed);
}

function createMovableShape(parsed) {
  const family = parsed.familyMeta.shapeFamily;
  const anchor = pickChordAnchor(parsed.root);
  const model = MOVABLE_CHORD_SHAPES[family]?.[anchor];
  if (!model) return null;

  const rootFret = fretForRoot(parsed.root, OPEN_STRING_NOTE_INDEX[anchor]);
  const frets = model.template.map((value) => value === "x" ? "x" : value + rootFret);
  return normalizeChordShape({
    frets,
    label: model.label,
    baseFret: frets.some((value) => value === 0) ? 1 : Math.max(1, rootFret)
  }, {
    approximate: Boolean(parsed.bass) || Boolean(parsed.familyMeta.approximate),
    handlesBass: !parsed.bass
  });
}

function pickChordAnchor(root) {
  const fretOnLowE = fretForRoot(root, OPEN_STRING_NOTE_INDEX.lowE);
  const fretOnA = fretForRoot(root, OPEN_STRING_NOTE_INDEX.a);
  return fretOnA < fretOnLowE ? "a" : "lowE";
}

function fretForRoot(root, openIndex) {
  return (NOTE_INDEX[root] - openIndex + 120) % 12;
}

function normalizeChordShape(shape, overrides = {}) {
  const positiveFrets = shape.frets.filter((value) => Number.isInteger(value) && value > 0);
  const hasOpenStrings = shape.frets.some((value) => value === 0);
  return {
    frets: shape.frets.slice(),
    label: shape.label || "Forma sugerida",
    baseFret: shape.baseFret || ((!hasOpenStrings && positiveFrets.length) ? Math.min(...positiveFrets) : 1),
    approximate: Boolean(shape.approximate || overrides.approximate),
    handlesBass: overrides.handlesBass ?? true
  };
}

function transposeHtml(html, semitones) {
  if (!semitones) return html;
  const template = document.createElement("template");
  template.innerHTML = html;
  const chordNodes = template.content.querySelectorAll("i");
  chordNodes.forEach((node) => {
    node.textContent = transposeChordText(node.textContent, semitones);
  });
  return template.innerHTML;
}

function transposeChordText(text, semitones) {
  CHORD_TOKEN_PATTERN.lastIndex = 0;
  return String(text || "").replace(CHORD_TOKEN_PATTERN, (match, root, suffix = "", bass) => {
    const nextRoot = transposeNote(root, semitones);
    const nextBass = bass ? `/${transposeNote(bass, semitones)}` : "";
    return `${nextRoot}${suffix}${nextBass}`;
  });
}

function transposeNote(note, semitones, preferFlats = note.includes("b")) {
  const index = NOTE_INDEX[note];
  if (index === undefined) return note;
  const next = (index + semitones + 1200) % 12;
  return preferFlats ? NOTE_FLAT[next] : NOTE_SHARP[next];
}

function inferKeyFromHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const firstChordNode = template.content.querySelector("i");
  const text = firstChordNode ? firstChordNode.textContent : template.content.textContent;
  const match = String(text || "").match(/\b([A-G](?:#|b)?)(?:[0-9A-Za-zº°+\-#b()]*)?(?:\/[A-G](?:#|b)?)?\b/);
  return match ? match[1] : null;
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function toast(text) {
  const previous = document.querySelector(".toast");
  if (previous) previous.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = text;
  Object.assign(node.style, {
    position: "fixed",
    left: "50%",
    bottom: "18px",
    transform: "translateX(-50%)",
    background: "#171615",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "8px",
    boxShadow: "0 12px 28px rgba(0,0,0,.28)",
    fontSize: "13px",
    fontWeight: "850",
    zIndex: "50"
  });
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 1400);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatTime(value) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
