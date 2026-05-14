/* IE 4512 — Focus Music widget
   Floating bottom-right player. Pick a preset (Lo-fi / Synthwave / Jazz /
   Classical) or paste any YouTube playlist URL. Shuffle baked in.
   State persists across pages via localStorage. */
(function () {
  if (window.__fmLoaded) return;
  window.__fmLoaded = true;

  const STORAGE_KEY = 'ie4512_focus_music_v3';

  // ===== Presets (live streams + curated playlists; user can override) =====
  const PRESETS = [
    { key: 'lofi',       label: 'Lo-fi',       desc: 'beats to relax/study',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },          // Lofi Girl live
    { key: 'synth',      label: 'Synthwave',   desc: 'retro · chill',
      url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY' },          // Lofi Girl synthwave
    { key: 'jazz',       label: 'Jazz',        desc: 'cafe · smooth',
      url: 'https://www.youtube.com/watch?v=Dx5qFachd3A' },          // jazz radio
    { key: 'classical',  label: 'Classical',   desc: 'Bach · Mozart',
      url: 'https://www.youtube.com/watch?v=jgpJVI3tDbY' },          // classical study
    { key: 'piano',      label: 'Piano',       desc: 'solo · ambient',
      url: 'https://www.youtube.com/watch?v=BCBnB5kbXEY' }           // piano focus
  ];

  let state = { presetKey: 'lofi', customUrl: '', useCustom: false, expanded: false, volume: 50 };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    Object.assign(state, saved);
  } catch (e) {}
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }

  // ===== Parse a YouTube URL to playlist or single video =====
  function parseYouTube(url) {
    if (!url) return null;
    try {
      const u = new URL(url.trim());
      const host = u.hostname.replace(/^www\./, '');
      if (host === 'youtu.be') {
        return { kind: 'video', id: u.pathname.slice(1) };
      }
      const list = u.searchParams.get('list');
      const v = u.searchParams.get('v');
      if (list) return { kind: 'playlist', id: list };
      if (v) return { kind: 'video', id: v };
      // /playlist?list=...
      if (u.pathname === '/playlist' && list) return { kind: 'playlist', id: list };
    } catch (e) {}
    return null;
  }

  function buildEmbedSrc(parsed) {
    if (!parsed) return '';
    const base = 'https://www.youtube.com/embed';
    if (parsed.kind === 'playlist') {
      return `${base}/videoseries?list=${parsed.id}&autoplay=1&modestbranding=1&rel=0&shuffle=1&loop=1&enablejsapi=1`;
    }
    // single video: shuffle has no effect; loop requires playlist=
    return `${base}/${parsed.id}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1&playlist=${parsed.id}&loop=1`;
  }

  function activeUrl() {
    if (state.useCustom && state.customUrl) return state.customUrl;
    const p = PRESETS.find(x => x.key === state.presetKey) || PRESETS[0];
    return p.url;
  }

  // ===== CSS =====
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
    .fm-btn .dot { width: 8px; height: 8px; border-radius: 999px; background: #ffe66d; box-shadow: 0 0 0 0 rgba(255,230,109,0.7); animation: fm-pulse 1.6s ease-in-out infinite; }
    .fm-btn .dot.off { background: rgba(255,255,255,0.45); animation: none; box-shadow: none; }
    @keyframes fm-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,230,109,0.7); } 50% { box-shadow: 0 0 0 7px rgba(255,230,109,0); } }
    .fm-btn svg { width: 15px; height: 15px; }

    .fm-panel {
      position: fixed; bottom: 14px; right: 14px;
      width: 360px; max-width: calc(100vw - 28px);
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

    .fm-presets {
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px;
      padding: 10px 12px; border-bottom: 1px solid #e8e3d4;
    }
    .fm-preset {
      padding: 7px 4px; border-radius: 8px; cursor: pointer; text-align: center;
      background: #faf9f5; border: 1px solid transparent;
      font-family: 'Outfit', sans-serif; font-size: 10.5px; font-weight: 600; color: #1a1a1a;
      transition: all 0.15s;
    }
    .fm-preset:hover { border-color: #1947d6; }
    .fm-preset.active { background: #1947d6; color: #fff; border-color: #1947d6; }
    .fm-preset .desc { display: block; font-weight: 400; font-size: 9px; color: #5a5247; margin-top: 1px; letter-spacing: 0.02em; }
    .fm-preset.active .desc { color: rgba(255,255,255,0.78); }

    .fm-iframe-wrap {
      position: relative; padding: 8px 12px;
    }
    .fm-iframe-wrap iframe {
      width: 100%; height: 198px; border: 0; border-radius: 8px;
      background: #000;
    }
    .fm-iframe-wrap .empty {
      width: 100%; height: 198px; border-radius: 8px;
      background: linear-gradient(135deg, #faf9f5 0%, #eef2ff 100%);
      display: flex; align-items: center; justify-content: center; text-align: center;
      font-family: 'Lora', serif; font-style: italic; font-size: 12px; color: #5a5247; padding: 14px;
    }

    .fm-custom {
      padding: 9px 12px 12px; border-top: 1px solid #e8e3d4;
    }
    .fm-custom .row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .fm-custom label {
      font-family: 'Outfit', sans-serif; font-size: 9.5px; letter-spacing: 0.18em;
      text-transform: uppercase; font-weight: 700; color: #1947d6; flex: 1;
    }
    .fm-custom input[type="checkbox"] { accent-color: #1947d6; transform: scale(1.05); }
    .fm-custom .url-row { display: flex; gap: 6px; }
    .fm-custom input[type="text"] {
      flex: 1; padding: 7px 9px; border: 1px solid #e8e3d4; border-radius: 7px;
      font-family: 'JetBrains Mono', Consolas, monospace; font-size: 10.5px; color: #1a1a1a; outline: none;
    }
    .fm-custom input[type="text"]:focus { border-color: #1947d6; }
    .fm-custom .apply {
      padding: 7px 11px; background: #b8860b; color: #fff; border: none; border-radius: 7px;
      font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; cursor: pointer;
    }
    .fm-custom .apply:hover { background: #d4a017; }
    .fm-custom .hint {
      font-size: 10px; color: #8b7355; line-height: 1.4; font-style: italic;
      font-family: 'Lora', serif;
    }
    .fm-custom .hint code { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; background: #faf9f5; padding: 1px 4px; border-radius: 3px; color: #1947d6; }

    @media (max-width: 480px) {
      .fm-panel { width: calc(100vw - 16px); right: 8px; bottom: 8px; }
      .fm-btn { right: 8px; bottom: 8px; }
      .fm-presets { grid-template-columns: repeat(3, 1fr); }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ===== UI =====
  function mount() {
    const btn = document.createElement('button');
    btn.className = 'fm-btn';
    btn.setAttribute('aria-label', 'Focus music');
    btn.innerHTML = `
      <span class="dot off" id="fm-dot"></span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      Music
    `;
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'fm-panel';
    panel.innerHTML = `
      <div class="fm-head">
        <div class="ttl">Focus <em>Music</em></div>
        <button class="x" id="fm-close" aria-label="Close">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="fm-presets" id="fm-presets">
        ${PRESETS.map(p => `<div class="fm-preset" data-k="${p.key}">${p.label}<span class="desc">${p.desc}</span></div>`).join('')}
      </div>
      <div class="fm-iframe-wrap" id="fm-iframe-wrap"></div>
      <div class="fm-custom">
        <div class="row">
          <label for="fm-use-custom">Custom playlist (your YouTube URL)</label>
          <input type="checkbox" id="fm-use-custom" />
        </div>
        <div class="url-row">
          <input type="text" id="fm-custom-url" placeholder="paste a YouTube playlist or video URL" />
          <button class="apply" id="fm-apply">Apply</button>
        </div>
        <div class="hint">Tip: any YouTube playlist URL works (e.g. <code>youtube.com/playlist?list=PL...</code>). Shuffle is enabled automatically for playlists.</div>
      </div>
    `;
    document.body.appendChild(panel);

    const elPresets = document.getElementById('fm-presets');
    const elWrap = document.getElementById('fm-iframe-wrap');
    const elCheck = document.getElementById('fm-use-custom');
    const elUrl = document.getElementById('fm-custom-url');
    const elApply = document.getElementById('fm-apply');
    const elClose = document.getElementById('fm-close');
    const elDot = document.getElementById('fm-dot');

    function renderPlayer() {
      const url = activeUrl();
      const parsed = parseYouTube(url);
      const src = buildEmbedSrc(parsed);
      if (src) {
        elWrap.innerHTML = `<iframe id="fm-iframe" src="${src}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        elDot.classList.remove('off');
      } else {
        elWrap.innerHTML = `<div class="empty">Paste a YouTube playlist or video URL above, then click Apply.</div>`;
        elDot.classList.add('off');
      }
    }

    function renderPresets() {
      Array.from(elPresets.children).forEach(c => {
        c.classList.toggle('active', !state.useCustom && c.dataset.k === state.presetKey);
      });
    }

    function open() {
      panel.classList.add('open');
      btn.style.display = 'none';
      state.expanded = true; save();
      renderPlayer();
      renderPresets();
      elCheck.checked = !!state.useCustom;
      elUrl.value = state.customUrl || '';
    }
    function close() {
      panel.classList.remove('open');
      btn.style.display = '';
      state.expanded = false; save();
      // stop playback by clearing iframe
      elWrap.innerHTML = '';
      elDot.classList.add('off');
    }

    btn.addEventListener('click', open);
    elClose.addEventListener('click', close);
    elPresets.addEventListener('click', e => {
      const t = e.target.closest('.fm-preset');
      if (!t) return;
      state.presetKey = t.dataset.k;
      state.useCustom = false; elCheck.checked = false;
      save(); renderPresets(); renderPlayer();
    });
    elCheck.addEventListener('change', () => {
      state.useCustom = elCheck.checked; save();
      if (state.useCustom && state.customUrl) renderPlayer();
      else if (!state.useCustom) renderPlayer();
      renderPresets();
    });
    elApply.addEventListener('click', () => {
      state.customUrl = elUrl.value.trim();
      state.useCustom = true; elCheck.checked = true;
      save(); renderPresets(); renderPlayer();
    });
    elUrl.addEventListener('keydown', e => { if (e.key === 'Enter') elApply.click(); });

    // Don't auto-open on first load - require user gesture (YouTube autoplay policy).
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
