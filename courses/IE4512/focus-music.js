/* IE 4512 — Focus Music widget
   Floating bottom-right player. Minimized = mini-player pill (play + title +
   progress) when a track is loaded; default pill ("Music") otherwise.
   Expanded = full panel with progress bar, transport, volume, track list.
   State persists across pages via localStorage. */
(function () {
  if (window.__fmLoaded) return;
  window.__fmLoaded = true;

  const STORAGE_KEY = 'ie4512_focus_music_v5';

  // ============ TRACKS — edit/replace URLs to customize ============
  // 20 curated calm/focus tracks hosted on archive.org (stable permanent URLs):
  //   * 3 Persian santur (Faramarz Payvar)
  //   * 12 calm piano (Max Richter, Yann Tiersen, Einaudi, Nils Frahm, ...)
  //   * 5 ambient (Calm Pills compilation + Eluvium)
  // Tag field categorizes each track (santur / piano / ambient).
  // To swap or add, replace title/artist/tag/url. Auto-skip on load error.
  const TRACKS = [
    { title: "Dastgah-e Shur", artist: "Faramarz Payvar (santur)", tag: "santur", url: "https://archive.org/download/santur-faramarz-payvar/01Dastgah_Shur.mp3" },
    { title: "Dastgah-e Homayoun", artist: "Faramarz Payvar (santur)", tag: "santur", url: "https://archive.org/download/santur-faramarz-payvar/02Dastgah_Homayoun.mp3" },
    { title: "Khavaran", artist: "Faramarz Payvar (santur)", tag: "santur", url: "https://archive.org/download/santur-faramarz-payvar/04Khavaran.mp3" },
    { title: "The Departure", artist: "Max Richter", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/01%20Max%20Richter%20-%20The%20Departure.mp3" },
    { title: "Comptine d’un autre été", artist: "Yann Tiersen", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/02%20Yann%20Tiersen%20-%20Comptine%20d%27Un%20Autre%20Ete%20%28L%27Apres-Midi%29%20%28Portrait%20Version%29.mp3" },
    { title: "Una Mattina", artist: "Olga Scheps", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/03%20Olga%20Scheps%20-%20Una%20mattina.mp3" },
    { title: "Serein", artist: "Dmitry Evgrafov", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/05%20Dmitry%20Evgrafov%20-%20Serein.mp3" },
    { title: "Roscian", artist: "Agnes Obel", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/08%20Agnes%20Obel%20-%20Roscian.mp3" },
    { title: "In a Sense", artist: "Eluvium", tag: "ambient", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/10%20Eluvium%20-%20In%20a%20Sense.mp3" },
    { title: "Theme for a Dream", artist: "RIOPY", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/14%20RIOPY%20-%20Theme%20Music%20for%20a%20Dream.mp3" },
    { title: "Matin dans Le Marais", artist: "Jef Martens", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/20%20Jef%20Martens%20-%20Matin%20dans%20Le%20Marais.mp3" },
    { title: "Feather", artist: "Dirk Maassen", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/25%20Dirk%20Maassen%20-%20Feather.mp3" },
    { title: "A Shine", artist: "Nils Frahm", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/32%20Nils%20Frahm%20-%20A%20Shine.mp3" },
    { title: "A Sense of Symmetry", artist: "Ludovico Einaudi", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/34%20Ludovico%20Einaudi%20-%20A%20Sense%20of%20Symmetry%20%28Day%202%29.mp3" },
    { title: "Avril 14th", artist: "Martin Jacoby", tag: "piano", url: "https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/35%20Martin%20Jacoby%20-%20Avril%2014th.mp3" },
    { title: "Still Habitat", artist: "Calm Pills · No. 1", tag: "ambient", url: "https://archive.org/download/CalmPills/Uplifting_Pills_-_Calm_Pill_1_-_Still_Habitat.mp3" },
    { title: "Planetarium", artist: "Calm Pills · No. 25", tag: "ambient", url: "https://archive.org/download/CalmPills/Uplifting_Pills_-_Calm_Pill_25_-_Guest_Mix_on_Planetarium.mp3" },
    { title: "Ocean of Stars", artist: "Calm Pills · No. 40", tag: "ambient", url: "https://archive.org/download/CalmPills/Uplifting_Pills_-_Calm_Pill_40_-_An_Ocean_Of_Stars_-_Guest_Mix_by_Tonepoet.mp3" },
    { title: "Letting Go", artist: "Calm Pills · No. 55", tag: "ambient", url: "https://archive.org/download/CalmPills/Uplifting_Pills_-_Calm_Pill_55_-_Letting_Go.mp3" },
    { title: "I Wish You Well", artist: "Calm Pills · No. 70", tag: "ambient", url: "https://archive.org/download/CalmPills/Uplifting_Pills_-_Calm_Pill_70_-_Signed_I_Wish_You_Well.mp3" },
  ];

  // ============ STATE ============
  let state = { trackIdx: -1, shuffle: false, volume: 60, expanded: false, isPlaying: false, currentTime: 0 };
  try { Object.assign(state, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); } catch (e) {}
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function fmtTime(s) {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2,'0');
  }

  // ============ CSS ============
  const css = `
    .fm-btn {
      position: fixed; bottom: 14px; right: 14px;
      height: 44px; width: 44px; border-radius: 999px;
      background: #1947d6; color: #fff; border: none; cursor: pointer; z-index: 998;
      box-shadow: 0 4px 14px rgba(25,71,214,0.32);
      display: inline-flex; align-items: center; justify-content: center; gap: 0;
      font-family: 'Outfit', -apple-system, system-ui, sans-serif;
      font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
      transition: box-shadow 0.18s, transform 0.18s, width 0.22s, padding 0.22s, border-radius 0.22s;
      padding: 0;
      overflow: hidden;
    }
    .fm-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(25,71,214,0.42); }
    .fm-btn.has-track {
      padding: 0 12px 0 4px; width: 296px; max-width: calc(100vw - 28px);
      gap: 8px; justify-content: flex-start; border-radius: 999px;
    }
    /* Idle state: hide dot + label, show only the music icon */
    .fm-btn:not(.has-track) .dot,
    .fm-btn:not(.has-track) .default-label { display: none; }
    .fm-btn:not(.has-track) > .icon { width: 18px; height: 18px; }
    .fm-btn .dot { width: 8px; height: 8px; border-radius: 999px; background: #ffe66d;
      box-shadow: 0 0 0 0 rgba(255,230,109,0.7); animation: fm-pulse 1.6s ease-in-out infinite; }
    .fm-btn .dot.off { background: rgba(255,255,255,0.45); animation: none; box-shadow: none; }
    @keyframes fm-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(255,230,109,0.7); }
      50%     { box-shadow: 0 0 0 7px rgba(255,230,109,0); }
    }
    .fm-btn > .icon { width: 15px; height: 15px; flex-shrink: 0; }

    /* Mini-player slots (visible only when .has-track) */
    .fm-mini-play {
      width: 34px; height: 34px; border-radius: 999px;
      background: rgba(255,255,255,0.20); display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.15s;
    }
    .fm-mini-play:hover { background: rgba(255,255,255,0.32); }
    .fm-mini-play svg { width: 14px; height: 14px; fill: #fff; }
    .fm-mini-meta {
      flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;
      align-items: flex-start; line-height: 1.1;
    }
    .fm-mini-title {
      font-family: 'Lora', Georgia, serif; font-style: italic; font-weight: 600;
      font-size: 11.5px; max-width: 100%; white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis; letter-spacing: 0;
    }
    .fm-mini-progress {
      width: 100%; height: 3px; background: rgba(255,255,255,0.22);
      border-radius: 999px; position: relative; overflow: hidden;
    }
    .fm-mini-fill {
      position: absolute; left: 0; top: 0; bottom: 0; width: 0%;
      background: #ffe66d; border-radius: 999px;
      transition: width 0.2s linear;
    }
    .fm-mini-expand { width: 18px; height: 18px; opacity: 0.7; flex-shrink: 0; }
    .fm-mini-expand:hover { opacity: 1; }

    /* Show/hide based on track-loaded state */
    .fm-btn.has-track .default-label,
    .fm-btn.has-track > .icon { display: none; }
    .fm-btn:not(.has-track) .fm-mini-play,
    .fm-btn:not(.has-track) .fm-mini-meta,
    .fm-btn:not(.has-track) .fm-mini-expand { display: none; }

    .fm-panel {
      position: fixed; bottom: 14px; right: 14px;
      width: 340px; max-width: calc(100vw - 28px);
      background: #fff; border-radius: 14px; z-index: 998;
      box-shadow: 0 18px 50px rgba(0,0,0,0.22);
      display: none; flex-direction: column; overflow: hidden;
      font-family: 'Outfit', -apple-system, system-ui, sans-serif;
      border: 1px solid #e8e3d4;
    }
    .fm-panel.open { display: flex; animation: fm-fade 0.22s ease-out; }
    @keyframes fm-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

    .fm-head {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: 11px 14px; border-bottom: 1px solid #e8e3d4; background: #faf9f5;
    }
    .fm-head .ttl { font-family: 'Lora', Georgia, serif; font-size: 15px; font-weight: 700; }
    .fm-head .ttl em { font-style: italic; color: #1947d6; font-weight: 400; }
    .fm-head .x {
      width: 26px; height: 26px; border-radius: 999px; border: none; background: transparent;
      color: #5a5247; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .fm-head .x:hover { background: #eef2ff; color: #1947d6; }

    .fm-now {
      padding: 10px 14px; background: linear-gradient(135deg, #faf9f5 0%, #eef2ff 100%);
      border-bottom: 1px solid #e8e3d4; display: flex; align-items: center; gap: 11px;
    }
    .fm-now .art {
      width: 38px; height: 38px; flex-shrink: 0; border-radius: 8px;
      background: #1947d6; color: #fff;
      display: flex; align-items: center; justify-content: center;
    }
    .fm-now .art svg { width: 18px; height: 18px; }
    .fm-now .art.playing { animation: fm-spin 6s linear infinite; }
    @keyframes fm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .fm-now .meta { flex: 1; min-width: 0; }
    .fm-now .meta .title {
      font-family: 'Lora', serif; font-size: 13.5px; font-weight: 600; line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .fm-now .meta .artist {
      font-size: 10.5px; color: #5a5247; margin-top: 2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .fm-now .tag {
      flex-shrink: 0; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase;
      font-weight: 700; padding: 3px 8px; border-radius: 999px;
      background: #eef2ff; color: #1947d6;
    }
    .fm-now .tag.santur  { background: #faf3e0; color: #b8860b; }
    .fm-now .tag.piano   { background: #eef2ff; color: #1947d6; }
    .fm-now .tag.ambient { background: #f0f4ea; color: #5c7a4a; }

    /* Expanded progress row */
    .fm-progress-row {
      padding: 8px 14px 10px; border-bottom: 1px solid #e8e3d4;
      display: flex; align-items: center; gap: 9px;
      font-family: 'JetBrains Mono', Consolas, monospace; font-size: 10px; color: #5a5247;
    }
    .fm-progress-bar {
      flex: 1; height: 4px; background: #e8e3d4; border-radius: 999px;
      position: relative; cursor: pointer;
    }
    .fm-progress-fill {
      position: absolute; left: 0; top: 0; bottom: 0; width: 0%;
      background: #1947d6; border-radius: 999px;
      transition: width 0.15s linear;
    }
    .fm-progress-bar:hover .fm-progress-fill { background: #4a6fe6; }
    .fm-progress-bar::after {
      content: ''; position: absolute; left: var(--seek-pct, 0%); top: 50%;
      transform: translate(-50%, -50%);
      width: 10px; height: 10px; border-radius: 999px; background: #1947d6;
      opacity: 0; transition: opacity 0.15s;
      pointer-events: none;
    }
    .fm-progress-bar:hover::after { opacity: 1; }

    .fm-controls {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 8px 12px; border-bottom: 1px solid #e8e3d4;
    }
    .fm-controls button {
      width: 32px; height: 32px; border-radius: 999px; border: none;
      background: transparent; color: #1a1a1a; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .fm-controls button:hover { background: #eef2ff; color: #1947d6; }
    .fm-controls button.play {
      background: #1947d6; color: #fff; width: 38px; height: 38px;
      box-shadow: 0 3px 10px rgba(25,71,214,0.3);
    }
    .fm-controls button.play:hover { background: #4a6fe6; color: #fff; }
    .fm-controls button.shuf.active { background: #b8860b; color: #fff; }
    .fm-controls button svg { width: 15px; height: 15px; }
    .fm-controls button.play svg { width: 17px; height: 17px; }

    .fm-vol {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 14px; border-bottom: 1px solid #e8e3d4;
    }
    .fm-vol svg { width: 12px; height: 12px; color: #5a5247; flex-shrink: 0; }
    .fm-vol input[type="range"] {
      flex: 1; height: 4px; -webkit-appearance: none; appearance: none;
      background: linear-gradient(to right, #1947d6 var(--pct, 60%), #e8e3d4 var(--pct, 60%));
      border-radius: 999px; outline: none;
    }
    .fm-vol input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 12px; height: 12px; border-radius: 999px; background: #1947d6;
      cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .fm-vol input[type="range"]::-moz-range-thumb {
      width: 12px; height: 12px; border-radius: 999px; background: #1947d6;
      cursor: pointer; border: 2px solid #fff;
    }

    .fm-list { flex: 1; max-height: 220px; overflow-y: auto; padding: 4px 0; }
    .fm-list::-webkit-scrollbar { width: 5px; }
    .fm-list::-webkit-scrollbar-thumb { background: #d4cfc0; border-radius: 999px; }
    .fm-track {
      display: flex; align-items: center; gap: 9px;
      padding: 7px 14px; cursor: pointer; transition: background 0.12s;
    }
    .fm-track:hover { background: #faf9f5; }
    .fm-track.active { background: #eef2ff; }
    .fm-track .idx {
      width: 22px; flex-shrink: 0; font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 10px; color: #8b7355; text-align: right; font-weight: 600;
    }
    .fm-track.active .idx { color: #1947d6; }
    .fm-track.playing .idx { color: transparent; position: relative; }
    .fm-track.playing .idx::before {
      content: ''; position: absolute; left: 6px; top: 5px;
      width: 10px; height: 10px;
      background: radial-gradient(circle, #1947d6 35%, transparent 36%);
      animation: fm-bar 1.1s ease-in-out infinite;
    }
    @keyframes fm-bar { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
    .fm-track .ti { flex: 1; min-width: 0; }
    .fm-track .ti .title {
      font-family: 'Lora', serif; font-size: 12.5px; font-weight: 500; color: #1a1a1a; line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .fm-track.active .ti .title { font-weight: 700; color: #1947d6; }
    .fm-track .ti .artist { font-size: 10px; color: #8b7355; margin-top: 1px; }
    .fm-track .tag-mini {
      flex-shrink: 0; font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase;
      font-weight: 700; padding: 2px 6px; border-radius: 999px;
      background: #eef2ff; color: #1947d6;
    }
    .fm-track .tag-mini.santur  { background: #faf3e0; color: #b8860b; }
    .fm-track .tag-mini.piano   { background: #eef2ff; color: #1947d6; }
    .fm-track .tag-mini.ambient { background: #f0f4ea; color: #5c7a4a; }

    .fm-foot {
      padding: 6px 14px; font-size: 9.5px; color: #8b7355; font-style: italic;
      font-family: 'Lora', serif; text-align: center;
      border-top: 1px solid #e8e3d4; background: #faf9f5;
    }

    @media (max-width: 480px) {
      .fm-panel { width: calc(100vw - 16px); right: 8px; bottom: 8px; }
      .fm-btn { right: 8px; bottom: 8px; }
      .fm-btn.has-track { width: calc(100vw - 16px); max-width: 320px; }
      .fm-list { max-height: 38vh; }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ============ AUDIO + UI ============
  const audio = new Audio();
  audio.preload = 'none';

  // Reset trackIdx to -1 if invalid (e.g. old localStorage with index from a longer list)
  if (state.trackIdx < 0 || state.trackIdx >= TRACKS.length) state.trackIdx = -1;

  function mount() {
    // ----- floating button (default mode + mini-player slots, hidden until has-track) -----
    const btn = document.createElement('div');
    btn.className = 'fm-btn';
    btn.id = 'fm-btn';
    btn.setAttribute('role', 'button');
    btn.innerHTML = `
      <span class="dot off" id="fm-dot"></span>
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      <span class="default-label">Music</span>
      <div class="fm-mini-play" id="fm-mini-play" title="Play / Pause"><svg id="fm-mini-icon" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20"/></svg></div>
      <div class="fm-mini-meta">
        <div class="fm-mini-title" id="fm-mini-title">—</div>
        <div class="fm-mini-progress"><div class="fm-mini-fill" id="fm-mini-fill"></div></div>
      </div>
      <svg class="fm-mini-expand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
    `;
    document.body.appendChild(btn);

    // ----- panel -----
    const panel = document.createElement('div');
    panel.className = 'fm-panel';
    panel.innerHTML = `
      <div class="fm-head">
        <div class="ttl">Focus <em>Music</em></div>
        <button class="x" id="fm-close" aria-label="Close">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="fm-now">
        <div class="art" id="fm-art">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <div class="meta">
          <div class="title" id="fm-now-title">—</div>
          <div class="artist" id="fm-now-artist">pick a track below</div>
        </div>
        <div class="tag" id="fm-now-tag" style="display:none;"></div>
      </div>

      <div class="fm-progress-row">
        <span id="fm-time-cur">0:00</span>
        <div class="fm-progress-bar" id="fm-progress-bar"><div class="fm-progress-fill" id="fm-progress-fill"></div></div>
        <span id="fm-time-dur">0:00</span>
      </div>

      <div class="fm-controls">
        <button class="shuf" id="fm-shuf" title="Shuffle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
        </button>
        <button id="fm-prev" title="Previous">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/></svg>
        </button>
        <button class="play" id="fm-play" title="Play/Pause">
          <svg id="fm-play-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
        </button>
        <button id="fm-next" title="Next">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/></svg>
        </button>
        <button id="fm-stop" title="Stop">
          <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
        </button>
      </div>

      <div class="fm-vol">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
        <input type="range" id="fm-vol" min="0" max="100" value="${state.volume}" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
      </div>

      <div class="fm-list" id="fm-list"></div>

      <div class="fm-foot">20 instrumental tracks &middot; santur · piano · ambient</div>
    `;
    document.body.appendChild(panel);

    const $ = id => document.getElementById(id);
    const elDot       = $('fm-dot');
    const elList      = $('fm-list');
    const elNowT      = $('fm-now-title');
    const elNowA      = $('fm-now-artist');
    const elNowTag    = $('fm-now-tag');
    const elArt       = $('fm-art');
    const elPlay      = $('fm-play');
    const elPlayIcon  = $('fm-play-icon');
    const elShuf      = $('fm-shuf');
    const elVol       = $('fm-vol');
    const elProgBar   = $('fm-progress-bar');
    const elProgFill  = $('fm-progress-fill');
    const elTimeCur   = $('fm-time-cur');
    const elTimeDur   = $('fm-time-dur');
    const elMiniPlay  = $('fm-mini-play');
    const elMiniIcon  = $('fm-mini-icon');
    const elMiniTitle = $('fm-mini-title');
    const elMiniFill  = $('fm-mini-fill');

    function setPlayIcons(playing) {
      const playSvg  = '<polygon points="6,4 20,12 6,20"/>';
      const pauseSvg = '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>';
      elPlayIcon.innerHTML = playing ? pauseSvg : playSvg;
      const playMiniSvg  = '<polygon points="6,4 20,12 6,20" fill="#fff"/>';
      const pauseMiniSvg = '<rect x="6" y="5" width="4" height="14" fill="#fff"/><rect x="14" y="5" width="4" height="14" fill="#fff"/>';
      elMiniIcon.innerHTML = playing ? pauseMiniSvg : playMiniSvg;
    }

    function renderList() {
      elList.innerHTML = TRACKS.map((t, i) => `
        <div class="fm-track ${i === state.trackIdx ? 'active' : ''} ${i === state.trackIdx && state.isPlaying ? 'playing' : ''}" data-i="${i}">
          <div class="idx">${String(i+1).padStart(2,'0')}</div>
          <div class="ti">
            <div class="title">${t.title}</div>
            <div class="artist">${t.artist}</div>
          </div>
          <span class="tag-mini ${t.tag}">${t.tag}</span>
        </div>
      `).join('');
      Array.from(elList.children).forEach(el => {
        el.addEventListener('click', () => loadTrack(+el.dataset.i, true));
      });
    }

    function updateNow() {
      const t = state.trackIdx >= 0 ? TRACKS[state.trackIdx] : null;
      elNowT.textContent = t ? t.title : '—';
      elNowA.textContent = t ? t.artist : 'pick a track below';
      if (t) {
        elNowTag.style.display = '';
        elNowTag.textContent = t.tag;
        elNowTag.className = 'tag ' + t.tag;
      } else {
        elNowTag.style.display = 'none';
      }
      elArt.classList.toggle('playing', state.isPlaying);
      elShuf.classList.toggle('active', !!state.shuffle);
      elDot.classList.toggle('off', !state.isPlaying);
      elVol.style.setProperty('--pct', state.volume + '%');
      setPlayIcons(state.isPlaying);
      // mini-player title
      elMiniTitle.textContent = t ? t.title : '';
      // toggle pill mode
      document.getElementById('fm-btn').classList.toggle('has-track', t != null);
      renderList();
    }

    function updateProgress() {
      const cur = audio.currentTime || 0;
      const dur = audio.duration || 0;
      const pct = dur > 0 ? (cur / dur) * 100 : 0;
      elProgFill.style.width = pct + '%';
      elMiniFill.style.width = pct + '%';
      elTimeCur.textContent = fmtTime(cur);
      elTimeDur.textContent = fmtTime(dur);
      state.currentTime = cur;
    }

    function loadTrack(i, autoplay) {
      state.trackIdx = i; save();
      const t = TRACKS[i];
      audio.src = t.url;
      audio.volume = state.volume / 100;
      if (autoplay) {
        audio.play().then(() => { state.isPlaying = true; save(); updateNow(); })
                    .catch(() => { state.isPlaying = false; save(); updateNow(); });
      }
      updateNow();
    }

    function togglePlay() {
      if (state.trackIdx < 0) { loadTrack(0, true); return; }
      if (audio.paused) {
        if (!audio.src) loadTrack(state.trackIdx, true);
        else audio.play().then(() => { state.isPlaying = true; save(); updateNow(); });
      } else {
        audio.pause(); state.isPlaying = false; save(); updateNow();
      }
    }
    function next() {
      let i;
      if (state.shuffle) {
        do { i = Math.floor(Math.random() * TRACKS.length); } while (i === state.trackIdx && TRACKS.length > 1);
      } else {
        i = state.trackIdx < 0 ? 0 : (state.trackIdx + 1) % TRACKS.length;
      }
      loadTrack(i, true);
    }
    function prev() {
      const i = state.trackIdx <= 0 ? TRACKS.length - 1 : (state.trackIdx - 1);
      loadTrack(i, true);
    }
    function stop() {
      audio.pause(); audio.currentTime = 0; state.isPlaying = false; save(); updateNow(); updateProgress();
    }

    // ----- wire controls -----
    $('fm-close').addEventListener('click', e => {
      e.stopPropagation();
      panel.classList.remove('open');
      state.expanded = false; save();
    });
    btn.addEventListener('click', e => {
      // ignore clicks on the mini play button (it has its own handler)
      if (e.target.closest('#fm-mini-play')) return;
      panel.classList.add('open');
      state.expanded = true; save();
      updateNow(); updateProgress();
    });
    elMiniPlay.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
    elPlay.addEventListener('click', togglePlay);
    $('fm-next').addEventListener('click', next);
    $('fm-prev').addEventListener('click', prev);
    $('fm-stop').addEventListener('click', stop);
    elShuf.addEventListener('click', () => { state.shuffle = !state.shuffle; save(); updateNow(); });
    elVol.addEventListener('input', e => {
      state.volume = +e.target.value; save();
      audio.volume = state.volume / 100;
      elVol.style.setProperty('--pct', state.volume + '%');
    });

    // Seek on click anywhere on the progress bar
    elProgBar.addEventListener('click', e => {
      const r = elProgBar.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      if (audio.duration) audio.currentTime = pct * audio.duration;
    });
    elProgBar.addEventListener('mousemove', e => {
      const r = elProgBar.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
      elProgBar.style.setProperty('--seek-pct', pct + '%');
    });

    audio.addEventListener('ended', next);
    audio.addEventListener('error', () => { state.isPlaying = false; save(); updateNow(); });
    audio.addEventListener('play',  () => { state.isPlaying = true;  save(); updateNow(); });
    audio.addEventListener('pause', () => { /* state set in togglePlay/stop */ });
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);

    elVol.style.setProperty('--pct', state.volume + '%');
    updateNow(); updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
