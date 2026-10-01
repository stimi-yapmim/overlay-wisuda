// eFootball Lower Third Overlay (OBS Browser Source)

const container = document.getElementById('overlay-container');
let currentSettings = {
  template: 'efootball',
  enableSound: false
};
let audioCtx = null;
let transitionTimeout = null;

// Social Icons SVG
const SOCIAL_ICONS = {
  youtube: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  twitch: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
  twitter: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  instagram: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  tiktok: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.16 1.18 2.09 2.35 2.27.75.14 1.54.02 2.21-.36.75-.41 1.25-1.15 1.37-1.99.11-.79.08-1.6.08-2.39V0h-.02z"/></svg>`,
  discord: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`
};

// Sound Effect Synthesis (Muted per user request)
function playSound(type) {
  // Silent / No sound effects
  return;
}

// Update DOM Text Content
function updateDOMContent(state) {
  const title = state.title || 'MUHAMMAD RIZKY';
  const subtitle = state.subtitle || 'TIMNAS INDONESIA ESPORTS • TOP 10 GLOBAL';
  const tag = state.tag || 'DIV 1';
  const socialHandle = state.socialHandle || '';
  const socialPlatform = state.socialPlatform || 'youtube';
  const socialSvg = SOCIAL_ICONS[socialPlatform] || SOCIAL_ICONS.youtube;

  const efTitleEl = document.getElementById('ef-title');
  const efSubtitleEl = document.getElementById('ef-subtitle');
  const efTagEl = document.getElementById('ef-tag');
  const efRatingEl = document.getElementById('ef-rating');
  const efSocialEl = document.getElementById('ef-social');
  const efSocialIconEl = document.getElementById('ef-social-icon');
  const efSocialWrapper = document.getElementById('ef-social-wrapper');

  if (efTitleEl) efTitleEl.textContent = title;
  if (efSubtitleEl) efSubtitleEl.textContent = subtitle;
  if (efTagEl) efTagEl.textContent = tag ? tag.toUpperCase() : 'DIV 1';
  
  if (efRatingEl) {
    const numMatch = tag.match(/\d{2,3}/);
    efRatingEl.textContent = numMatch ? numMatch[0] : 'XXIV';
  }

  if (efSocialEl) efSocialEl.textContent = socialHandle;
  if (efSocialIconEl) efSocialIconEl.innerHTML = socialSvg;
  if (efSocialWrapper) {
    efSocialWrapper.style.display = socialHandle ? 'flex' : 'none';
  }
}

// Main State Handler
function applyState(state) {
  if (transitionTimeout) clearTimeout(transitionTimeout);
  currentSettings = { ...currentSettings, ...state };

  if (state.accentColor) {
    document.documentElement.style.setProperty('--ef-volt', state.accentColor);
  }

  // Update Position Class
  const positionClass = `position-${state.position || 'bottom-left'}`;
  container.className = container.className
    .replace(/position-[a-z0-9_-]+/g, '')
    .trim();
  container.classList.add(positionClass);

  if (state.visible) {
    triggerShowWithTransition(state);
  } else {
    triggerHideWithAnimation();
  }
}

// Trigger Show with Automatic OUT-then-IN Transition when switching Rundown
function triggerShowWithTransition(newState) {
  const isCurrentlyShowing = container.classList.contains('is-visible') || container.classList.contains('anim-in');

  // Check if content is actually changing while on-air
  const currentTitle = document.getElementById('ef-title').textContent.trim();
  const isDifferentContent = (currentTitle !== (newState.title || '').trim());

  if (isCurrentlyShowing && isDifferentContent) {
    // 1. Play OUT animation first
    container.classList.remove('anim-in');
    container.classList.add('anim-out');
    playSound('hide');

    // 2. Wait for OUT animation (320ms), then load new rundown content and trigger IN animation
    transitionTimeout = setTimeout(() => {
      updateDOMContent(newState);
      container.classList.remove('anim-out');
      container.classList.remove('is-hidden');
      container.classList.add('is-visible');
      container.classList.add('anim-in');
      playSound('show');
    }, 320);
  } else {
    // Graphic was not showing, or same content: directly animate in
    updateDOMContent(newState);
    container.classList.remove('is-hidden');
    container.classList.remove('anim-out');
    container.classList.add('is-visible');
    container.classList.add('anim-in');
    playSound('show');
  }
}

// Trigger Smooth OUT Animation on Hide
function triggerHideWithAnimation() {
  const isCurrentlyShowing = container.classList.contains('is-visible') || container.classList.contains('anim-in');

  if (isCurrentlyShowing) {
    container.classList.remove('anim-in');
    container.classList.add('anim-out');
    playSound('hide');

    transitionTimeout = setTimeout(() => {
      container.classList.remove('anim-out');
      container.classList.remove('is-visible');
      container.classList.add('is-hidden');
    }, 320);
  } else {
    container.classList.remove('anim-in');
    container.classList.remove('anim-out');
    container.classList.remove('is-visible');
    container.classList.add('is-hidden');
  }
}

// Fullscreen Broadcast Stinger Transition Logic
const fullscreenTransition = document.getElementById('fullscreen-transition');
let transitionActive = false;
let transitionAnimTimer = null;

function handleTransition(action) {
  if (!fullscreenTransition) return;
  if (transitionAnimTimer) clearTimeout(transitionAnimTimer);

  if (action === 'in') {
    transitionActive = true;
    fullscreenTransition.classList.remove('is-hidden');
    fullscreenTransition.classList.remove('anim-out');
    fullscreenTransition.classList.add('is-visible');
    fullscreenTransition.classList.add('anim-in');
  } else if (action === 'out') {
    transitionActive = false;
    fullscreenTransition.classList.remove('anim-in');
    fullscreenTransition.classList.add('anim-out');
    transitionAnimTimer = setTimeout(() => {
      if (!transitionActive) {
        fullscreenTransition.classList.remove('is-visible');
        fullscreenTransition.classList.remove('anim-out');
        fullscreenTransition.classList.add('is-hidden');
      }
    }, 600);
  }
}

// Broadcast Audio Player & Ceremonial Synthesizer
const broadcastAudio = document.getElementById('broadcast-audio');
const nowPlayingBug = document.getElementById('now-playing-bug');
const npTitle = document.getElementById('np-title');
let currentPlayingAudio = null;
let synthAudioCtx = null;
let synthTimeouts = [];

const SONG_TITLES = {
  indonesia_raya: 'INDONESIA RAYA',
  gaudeamus_igitur: 'GAUDEAMUS IGITUR',
  mars_stimi: 'MARS STIMI',
  pasti_bisa: 'PASTI BISA',
  bagimu_negeri: 'BAGIMU NEGERI',
  lagu_bebas: 'LAGU BEBAS / INSTRUMEN'
};

function playAudioTrack(audioData) {
  if (!audioData || !audioData.song) return;
  const songKey = audioData.song;
  const displayTitle = audioData.title || SONG_TITLES[songKey] || songKey.replace(/_/g, ' ').toUpperCase();
  currentPlayingAudio = songKey;

  // Show Now Playing Bug
  if (nowPlayingBug && npTitle) {
    npTitle.textContent = displayTitle;
    nowPlayingBug.classList.remove('is-hidden');
  }

  stopSynthMelody();

  if (broadcastAudio) {
    broadcastAudio.pause();
    broadcastAudio.currentTime = 0;
    broadcastAudio.volume = 0.95;

    // Gunakan URL yang diberikan server (sudah terdeteksi .mpeg, .aac, .mp3, dll)
    const targetUrl = audioData.url || `/audio/${songKey}.mp3?v=${Date.now()}`;
    broadcastAudio.src = targetUrl;

    const playPromise = broadcastAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn(`[Overlay Audio] File ${targetUrl} gagal diputar langsung:`, err);
        // Jika format gagal, coba sintetis fallback
        playSynthMelody(songKey);
      });
    }

    broadcastAudio.onended = () => {
      stopAudioTrack();
    };
  } else {
    playSynthMelody(songKey);
  }
}

function stopAudioTrack() {
  currentPlayingAudio = null;
  if (nowPlayingBug) {
    nowPlayingBug.classList.add('is-hidden');
  }
  if (broadcastAudio) {
    broadcastAudio.pause();
    broadcastAudio.currentTime = 0;
  }
  stopSynthMelody();
}

// Web Audio API Melodic Fallback Synthesizer
function playSynthMelody(songKey) {
  stopSynthMelody();
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    synthAudioCtx = new AudioContext();
  } catch (e) {
    return;
  }

  const melodies = {
    indonesia_raya: [
      { f: 392.00, d: 0.6 }, // Sol
      { f: 523.25, d: 0.9 }, // Do
      { f: 659.25, d: 0.5 }, // Mi
      { f: 587.33, d: 0.5 }, // Re
      { f: 523.25, d: 0.9 }, // Do
      { f: 392.00, d: 0.6 }, // Sol
      { f: 659.25, d: 0.5 }, // Mi
      { f: 698.46, d: 0.5 }, // Fa
      { f: 783.99, d: 1.0 }, // Sol
      { f: 880.00, d: 0.6 }, // La
      { f: 783.99, d: 0.6 }, // Sol
      { f: 698.46, d: 0.6 }, // Fa
      { f: 659.25, d: 0.9 }, // Mi
      { f: 587.33, d: 1.2 }  // Re
    ],
    gaudeamus_igitur: [
      { f: 261.63, d: 0.6 },
      { f: 261.63, d: 0.6 },
      { f: 293.66, d: 0.6 },
      { f: 261.63, d: 0.6 },
      { f: 329.63, d: 0.9 },
      { f: 293.66, d: 0.9 },
      { f: 329.63, d: 0.6 },
      { f: 349.23, d: 0.6 },
      { f: 392.00, d: 1.1 },
      { f: 349.23, d: 0.6 },
      { f: 329.63, d: 0.6 },
      { f: 293.66, d: 1.2 }
    ],
    bagimu_negeri: [
      { f: 261.63, d: 0.8 },
      { f: 329.63, d: 0.8 },
      { f: 392.00, d: 0.8 },
      { f: 523.25, d: 1.2 },
      { f: 493.88, d: 0.7 },
      { f: 440.00, d: 0.7 },
      { f: 392.00, d: 1.2 },
      { f: 329.63, d: 0.6 },
      { f: 349.23, d: 0.6 },
      { f: 392.00, d: 0.9 },
      { f: 440.00, d: 0.9 },
      { f: 392.00, d: 1.4 }
    ],
    lagu_bebas: [
      { f: 392.00, d: 0.5 },
      { f: 493.88, d: 0.5 },
      { f: 587.33, d: 0.5 },
      { f: 783.99, d: 0.9 },
      { f: 739.99, d: 0.5 },
      { f: 659.25, d: 0.5 },
      { f: 587.33, d: 0.9 },
      { f: 493.88, d: 0.5 },
      { f: 523.25, d: 0.5 },
      { f: 587.33, d: 0.9 },
      { f: 659.25, d: 0.9 },
      { f: 587.33, d: 1.2 }
    ]
  };

  const notes = melodies[songKey] || melodies.indonesia_raya;
  let delay = 0;

  notes.forEach(note => {
    const t = setTimeout(() => {
      if (!synthAudioCtx) return;
      try {
        const osc = synthAudioCtx.createOscillator();
        const gain = synthAudioCtx.createGain();
        osc.type = (songKey === 'gaudeamus_igitur') ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(note.f, synthAudioCtx.currentTime);

        gain.gain.setValueAtTime(0.01, synthAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.28, synthAudioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, synthAudioCtx.currentTime + note.d);

        osc.connect(gain);
        gain.connect(synthAudioCtx.destination);

        osc.start();
        osc.stop(synthAudioCtx.currentTime + note.d + 0.05);
      } catch (err) {}
    }, delay * 1000);

    synthTimeouts.push(t);
    delay += note.d;
  });

  const endT = setTimeout(() => {
    stopAudioTrack();
  }, (delay + 1) * 1000);
  synthTimeouts.push(endT);
}

function stopSynthMelody() {
  synthTimeouts.forEach(t => clearTimeout(t));
  synthTimeouts = [];
  if (synthAudioCtx) {
    try {
      synthAudioCtx.close();
    } catch (e) {}
    synthAudioCtx = null;
  }
}

// =========================================================
// BROADCAST RUNNING TEXT / TICKER CONTROLLER
// =========================================================
function formatTickerHTML(rawText) {
  if (!rawText) return '';
  const parts = rawText.split(/[•*||\n]/).map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return `<span class="ticker-item">${rawText}</span><span class="ticker-separator">✦</span>`;
  }
  let html = parts.map(part => `<span class="ticker-item">${part}</span>`).join('<span class="ticker-separator">✦</span>');
  html += '<span class="ticker-separator">✦</span>';
  return html;
}

function renderTicker(ticker) {
  if (!ticker) return;
  const tickerEl = document.getElementById('broadcast-ticker');
  const badgeEl = document.getElementById('ticker-badge-label');
  const content1 = document.getElementById('ticker-content-1');
  const content2 = document.getElementById('ticker-content-2');

  if (!tickerEl) return;

  if (badgeEl && ticker.label) {
    badgeEl.textContent = ticker.label.toUpperCase();
  }

  const raw = ticker.text || 'SELAMAT DATANG DI WISUDA SARJANA XXIV STIMI YAPMI MAKASSAR';
  const formatted = formatTickerHTML(raw);
  if (content1) content1.innerHTML = formatted;
  if (content2) content2.innerHTML = formatted;

  const duration = ticker.speed || 30;
  document.documentElement.style.setProperty('--ticker-duration', `${duration}s`);

  if (ticker.visible) {
    tickerEl.classList.remove('is-hidden');
  } else {
    tickerEl.classList.add('is-hidden');
  }
}

// WebSocket Connection Setup with Auto-Reconnect
let socket = null;
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('[eFootball Overlay] Connected to server.');
    socket.send(JSON.stringify({ type: 'REGISTER', role: 'overlay' }));
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'STATE_SYNC') {
        if (msg.state && msg.state.transitionActive) {
          handleTransition('in');
        }
        if (msg.audio && msg.audio.playing) {
          playAudioTrack(msg.audio);
        }
        if (msg.ticker) {
          renderTicker(msg.ticker);
        }
        applyState(msg.state);
      } else if (msg.type === 'UPDATE' || msg.type === 'SHOW') {
        if (msg.state && msg.state.ticker) {
          renderTicker(msg.state.ticker);
        }
        applyState(msg.state);
      } else if (msg.type === 'HIDE') {
        triggerHideWithAnimation();
      } else if (msg.type === 'TRANSITION') {
        handleTransition(msg.action);
      } else if (msg.type === 'AUDIO_PLAY') {
        playAudioTrack(msg.audio);
      } else if (msg.type === 'AUDIO_STOP') {
        stopAudioTrack();
      } else if (msg.type === 'TICKER_UPDATE' || msg.type === 'RUNNING_TEXT_UPDATE') {
        renderTicker(msg.ticker);
      }
    } catch (e) {
      console.error('Error handling WS event:', e);
    }
  };

  socket.onclose = () => {
    setTimeout(connectWebSocket, 2000);
  };

  socket.onerror = (err) => {
    console.error('[eFootball Overlay] Socket error:', err);
    socket.close();
  };
}

connectWebSocket();

