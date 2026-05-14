/* IE 4512 — Focus Music widget
   Floating bottom-right player with an embedded tiny track list.
   Click a track to play. Shuffle toggle + next/prev. State persists.
   To swap or add tracks, edit the TRACKS array below. */
(function () {
  if (window.__fmLoaded) return;
  window.__fmLoaded = true;

  const STORAGE_KEY = 'ie4512_focus_music_v4';

  // ============ TRACKS — edit/replace URLs to customize ============
  // Defaults: SoundHelix demo tracks (verified-stable URLs since 2010s).
  // Swap any URL with your own MP3 source. Keep the title/artist labels.
  const TRACKS = [
    { title: 'Crystal Drift',     artist: 'SoundHelix',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'Slow Current',      artist: 'SoundHelix',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'Lantern Walk',      artist: 'SoundHelix',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { title: 'Paper Sky',         artist: 'SoundHelix',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { title: 'Morning Wire',      artist: 'SoundHelix',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { title: 'Quiet Loom',        artist: 'SoundHelix',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { title: 'Glass Field',       artist: 'SoundHelix',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { title: 'Open Notebook',     artist: 'SoundHelix',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { title: 'Slate &amp; Pine',  artist: 'SoundHelix',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
    { title: 'Lighthouse',        artist: 'SoundHelix',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' }
  ];

  // ============ STATE ============
  let state = { trackIdx: 0, shuffle: false, volume: 60, expanded: false, isPlaying: false };
  try { Object.assign(state, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); } catch (e) {}
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }

  // ============ CSS ============
  const css = `
    .fm-btn {
      position: fixed; bottom: 14px; right: 14px;
      height: 44px; padding: 0 16px 0 12px; border-radius: 999px;
      background: #1947d6; color: #fff; border: none; cursor: pointer; z-index: 998;
      box-shadow: 0 4px 14px rgba(25,71,214,0.32);
      display: inline-flex; align-items: center; gap: 8px;
      font-family: 'Outfit', -apple-system, system-ui, sans-serif;
      font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
      transition: all 0.18s;
    }
    .fm-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(25,71,214,0.42); }
    .fm-btn .dot {
      width: 8px; height: 8px; border-radius: 999px; background: #ffe66d;
      box-shadow: 0 0 0 0 rgba(255,230,109,0.7); animation: fm-pulse 1.6s ease-in-out infinite;
    }
    .fm-btn .dot.off { background: rgba(255,255,255,0.45); animation: none; box-shadow: none; }
    @keyframes fm-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(255,230,109,0.7); }
      50%     { box-shadow: 0 0 0 7px rgba(255,230,109,0); }
    }
    .fm-btn svg { width: 15px; height: 15px; }

    .fm-panel {
      position: fixed; bottom: 14px; right: 14px;
      width: 320px; max-width: calc(100vw - 28px);
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

    .fm-controls {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 9px 12px; border-bottom: 1px solid #e8e3d4;
    }
    .fm-controls button {
      width: 34px; height: 34px; border-radius: 999px; border: none;
      background: transparent; color: #1a1a1a; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .fm-controls button:hover { background: #eef2ff; color: #1947d6; }
    .fm-controls button.play {
      background: #1947d6; color: #fff; width: 40px; height: 40px;
      box-shadow: 0 3px 10px rgba(25,71,214,0.3);
    }
    .fm-controls button.play:hover { background: #4a6fe6; color: #fff; }
    .fm-controls button.shuf.active { background: #b8860b; color: #fff; }
    .fm-controls button svg { width: 16px; height: 16px; }
    .fm-controls button.play svg { width: 18px; height: 18px; }

    .fm-vol {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px; border-bottom: 1px solid #e8e3d4;
    }
    .fm-vol svg { width: 13px; height: 13px; color: #5a5247; flex-shrink: 0; }
    .fm-vol input[type="range"] {
      flex: 1; height: 4px; -webkit-appearance: none; appearance: none;
      background: linear-gradient(to right, #1947d6 var(--pct, 60%), #e8e3d4 var(--pct, 60%));
      border-radius: 999px; outline: none;
    }
    .fm-vol input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 13px; height: 13px; border-radius: 999px; background: #1947d6;
      cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .fm-vol input[type="range"]::-moz-range-thumb {
      width: 13px; height: 13px; border-radius: 999px; background: #1947d6;
      cursor: pointer; border: 2px solid #fff;
    }

    .fm-list {
      flex: 1; max-height: 240px; overflow-y: auto; padding: 4px 0;
    }
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
    .fm-track .ti .artist {
      font-size: 10px; color: #8b7355; margin-top: 1px;
    }

    .fm-foot {
      padding: 7px 14px; font-size: 10px; color: #8b7355; font-style: italic;
      font-family: 'Lora', serif; text-align: center;
      border-top: 1px solid #e8e3d4; background: #faf9f5;
    }
    .fm-foot a { color: #1947d6; text-decoration: none; border-bottom: 1px dotted #1947d6; }

    @media (max-width: 480px) {
      .fm-panel { width: calc(100vw - 16px); right: 8px; bottom: 8px; }
      .fm-btn { right: 8px; bottom: 8px; }
      .fm-list { max-height: 38vh; }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ============ AUDIO + UI ============
  const audio = new Audio();
  audio.preload = 'none';

  function mount() {
    // ----- floating button -----
    const btn = document.createElement('button');
    btn.className = 'fm-btn';
    btn.setAttribute('aria-label', 'Focus music');
    btn.innerHTML = `
      <span class="dot off" id="fm-dot"></span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      Music
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
          <div class="title" id="fm-now-title">&mdash;</div>
          <div class="artist" id="fm-now-artist">pick a track below</div>
        </div>
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

      <div class="fm-foot">10 instrumental tracks &middot; loops and shuffles for as long as you study</div>
    `;
    document.body.appendChild(panel);

    const $ = id => document.getElementById(id);
    const elDot = $('fm-dot');
    const elList = $('fm-list');
    const elNowT = $('fm-now-title');
    const elNowA = $('fm-now-artist');
    const elArt = $('fm-art');
    const elPlay = $('fm-play');
    const elPlayIcon = $('fm-play-icon');
    const elShuf = $('fm-shuf');
    const elVol = $('fm-vol');

    // ----- track list -----
    function renderList() {
      elList.innerHTML = TRACKS.map((t, i) => `
        <div class="fm-track ${i === state.trackIdx ? 'active' : ''} ${i === state.trackIdx && state.isPlaying ? 'playing' : ''}" data-i="${i}">
          <div class="idx">${String(i+1).padStart(2,'0')}</div>
          <div class="ti">
            <div class="title">${t.title}</div>
            <div class="artist">${t.artist}</div>
          </div>
        </div>
      `).join('');
      Array.from(elList.children).forEach(el => {
        el.addEventListener('click', () => {
          const i = +el.dataset.i;
          loadTrack(i, true);
        });
      });
    }

    function updateNow() {
      const t = TRACKS[state.trackIdx];
      elNowT.innerHTML = t ? t.title : '—';
      elNowA.textContent = t ? t.artist : '';
      elArt.classList.toggle('playing', state.isPlaying);
      elPlayIcon.innerHTML = state.isPlaying
        ? '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>'
        : '<polygon points="6,4 20,12 6,20"/>';
      elShuf.classList.toggle('active', !!state.shuffle);
      elDot.classList.toggle('off', !state.isPlaying);
      elVol.style.setProperty('--pct', state.volume + '%');
      renderList();
    }

    function loadTrack(i, autoplay) {
      state.trackIdx = i;
      save();
      const t = TRACKS[i];
      audio.src = t.url;
      audio.volume = state.volume / 100;
      if (autoplay) {
        audio.play().then(() => {
          state.isPlaying = true; save(); updateNow();
        }).catch(() => {
          state.isPlaying = false; save(); updateNow();
        });
      }
      updateNow();
    }

    function togglePlay() {
      if (audio.paused) {
        if (!audio.src) loadTrack(state.trackIdx, true);
        else audio.play().then(() => { state.isPlaying = true; save(); updateNow(); });
      } else {
        audio.pause();
        state.isPlaying = false; save(); updateNow();
      }
    }

    function next() {
      let i;
      if (state.shuffle) {
        do { i = Math.floor(Math.random() * TRACKS.length); } while (i === state.trackIdx && TRACKS.length > 1);
      } else {
        i = (state.trackIdx + 1) % TRACKS.length;
      }
      loadTrack(i, true);
    }
    function prev() {
      const i = (state.trackIdx - 1 + TRACKS.length) % TRACKS.length;
      loadTrack(i, true);
    }
    function stop() {
      audio.pause(); audio.currentTime = 0;
      state.isPlaying = false; save(); updateNow();
    }

    // ----- wire controls -----
    $('fm-close').addEventListener('click', () => {
      panel.classList.remove('open'); btn.style.display = '';
      state.expanded = false; save();
    });
    btn.addEventListener('click', () => {
      panel.classList.add('open'); btn.style.display = 'none';
      state.expanded = true; save();
      updateNow();
    });
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

    audio.addEventListener('ended', next);
    audio.addEventListener('error', () => { state.isPlaying = false; save(); updateNow(); });
    audio.addEventListener('play',  () => { state.isPlaying = true;  save(); updateNow(); });
    audio.addEventListener('pause', () => { /* state already set by togglePlay */ });

    elVol.style.setProperty('--pct', state.volume + '%');
    updateNow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
