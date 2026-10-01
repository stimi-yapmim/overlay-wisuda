// eFootball Mobile-First Rundown Controller

let socket = null;
let currentRundown = [];
let activeRundownId = null;
let isLive = false;

// Active data being broadcast or edited
let currentActiveData = {
  template: 'efootball',
  title: 'MUHAMMAD RIZKY',
  subtitle: 'TIMNAS INDONESIA ESPORTS • TOP 10 GLOBAL',
  tag: 'DIV 1',
  socialPlatform: 'youtube',
  socialHandle: 'youtube.com/@RizkyEF',
  accentColor: '#d4ff00',
  secondaryColor: '#001f70'
};

// Social SVG Icons
const SOCIAL_ICONS = {
  youtube: `<svg class="icon-svg" style="width:14px;height:14px;fill:currentColor;vertical-align:middle" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  twitch: `<svg class="icon-svg" style="width:14px;height:14px;fill:currentColor;vertical-align:middle" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
  twitter: `<svg class="icon-svg" style="width:14px;height:14px;fill:currentColor;vertical-align:middle" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  instagram: `<svg class="icon-svg" style="width:14px;height:14px;fill:currentColor;vertical-align:middle" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  tiktok: `<svg class="icon-svg" style="width:14px;height:14px;fill:currentColor;vertical-align:middle" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.16 1.18 2.09 2.35 2.27.75.14 1.54.02 2.21-.36.75-.41 1.25-1.15 1.37-1.99.11-.79.08-1.6.08-2.39V0h-.02z"/></svg>`,
  discord: `<svg class="icon-svg" style="width:14px;height:14px;fill:currentColor;vertical-align:middle" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`
};

// DOM References
const appAirBadge = document.getElementById('app-air-badge');
const airText = document.getElementById('air-text');
const connDot = document.getElementById('conn-dot');
const connText = document.getElementById('conn-text');
const obsCountText = document.getElementById('obs-count-text');
const toastEl = document.getElementById('toast');

// Monitor Preview elements
const previewContainer = document.getElementById('preview-overlay-container');
const prevTitle = document.getElementById('prev-title');
const prevSubtitle = document.getElementById('prev-subtitle');
const prevTag = document.getElementById('prev-tag');
const prevRating = document.getElementById('prev-rating');
const prevSocial = document.getElementById('prev-social');
const prevSocialIcon = document.getElementById('prev-social-icon');
const prevSocialWrapper = document.getElementById('prev-social-wrapper');

// Active Card Elements
const cardActiveTag = document.getElementById('card-active-tag');
const cardActiveTitle = document.getElementById('card-active-title');
const cardActiveSubtitle = document.getElementById('card-active-subtitle');
const cardActiveSocialHandle = document.getElementById('card-active-social-handle');
const cardActiveSocialIcon = document.getElementById('card-active-social-icon');

// Inline Editor Elements
const inlineEditor = document.getElementById('inline-editor');
const btnToggleEditor = document.getElementById('btn-toggle-editor');
const editTitle = document.getElementById('edit-title');
const editSubtitle = document.getElementById('edit-subtitle');
const editTag = document.getElementById('edit-tag');
const editPlatform = document.getElementById('edit-platform');
const editSocial = document.getElementById('edit-social');
const btnSaveEdit = document.getElementById('btn-save-edit');

// Rundown List Container
const rundownContainer = document.getElementById('rundown-container');

// Bottom Action Buttons
const btnActionShow = document.getElementById('btn-action-show');
const btnActionHide = document.getElementById('btn-action-hide');
const btnActionTransition = document.getElementById('btn-action-transition');
const btnTransitionText = document.getElementById('btn-transition-text');
const btnActionNext = document.getElementById('btn-action-next');

// Preview Transition Element
const previewFullscreenTransition = document.getElementById('preview-fullscreen-transition');
let isTransitionActive = false;
let previewTransitionTimer = null;

// Modal Elements
const addModal = document.getElementById('add-modal');
const btnOpenAddModal = document.getElementById('btn-open-add-modal');
const btnCloseAddModal = document.getElementById('btn-close-add-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const btnSubmitAddCue = document.getElementById('btn-submit-add-cue');
const modalInputTitle = document.getElementById('modal-input-title');
const modalInputSubtitle = document.getElementById('modal-input-subtitle');
const modalInputTag = document.getElementById('modal-input-tag');
const modalInputPlatform = document.getElementById('modal-input-platform');
const modalInputSocial = document.getElementById('modal-input-social');

// Running Text (Ticker) Elements
const prevBroadcastTicker = document.getElementById('prev-broadcast-ticker');
const prevTickerBadgeText = document.getElementById('prev-ticker-badge-text');
const prevTickerContent1 = document.getElementById('prev-ticker-content-1');
const prevTickerContent2 = document.getElementById('prev-ticker-content-2');
const btnTickerToggle = document.getElementById('btn-ticker-toggle');
const tickerToggleText = document.getElementById('ticker-toggle-text');
const ctrlTickerLabel = document.getElementById('ctrl-ticker-label');
const ctrlTickerSpeed = document.getElementById('ctrl-ticker-speed');
const ctrlTickerText = document.getElementById('ctrl-ticker-text');
const btnApplyTicker = document.getElementById('btn-apply-ticker');

let currentTickerData = {
  visible: true,
  label: 'INFO WISUDA',
  text: 'SELAMAT DATANG DI WISUDA SARJANA XXIV STIMI YAPMI MAKASSAR • TAHUN AKADEMIK 2025/2026 • TETAP TERTIB & PATUHI PROTOKOL SIARAN • SELAMAT KEPADA SELURUH WISUDAWAN & WISUDAWATI TERBAIK • SUKSES MENJADI GENERASI PEMIMPIN MASA DEPAN',
  speed: 30
};

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

function updateTickerUI(ticker) {
  if (!ticker) return;
  currentTickerData = { ...currentTickerData, ...ticker };

  // 1. Update Preview Monitor
  if (prevTickerBadgeText) {
    prevTickerBadgeText.textContent = (currentTickerData.label || 'INFO').toUpperCase();
  }
  const formatted = formatTickerHTML(currentTickerData.text || '');
  if (prevTickerContent1) prevTickerContent1.innerHTML = formatted;
  if (prevTickerContent2) prevTickerContent2.innerHTML = formatted;

  const duration = currentTickerData.speed || 30;
  document.documentElement.style.setProperty('--prev-ticker-duration', `${duration}s`);

  if (prevBroadcastTicker) {
    if (currentTickerData.visible) {
      prevBroadcastTicker.classList.remove('is-hidden');
    } else {
      prevBroadcastTicker.classList.add('is-hidden');
    }
  }

  // 2. Update Form inputs if not focused
  if (ctrlTickerLabel && document.activeElement !== ctrlTickerLabel) {
    ctrlTickerLabel.value = currentTickerData.label || '';
  }
  if (ctrlTickerSpeed && document.activeElement !== ctrlTickerSpeed) {
    ctrlTickerSpeed.value = String(currentTickerData.speed || 30);
  }
  if (ctrlTickerText && document.activeElement !== ctrlTickerText) {
    ctrlTickerText.value = currentTickerData.text || '';
  }

  // 3. Update Toggle Button
  if (btnTickerToggle && tickerToggleText) {
    if (currentTickerData.visible) {
      btnTickerToggle.className = 'btn-ticker-toggle-power is-on';
      tickerToggleText.textContent = 'TICKER ON';
    } else {
      btnTickerToggle.className = 'btn-ticker-toggle-power is-off';
      tickerToggleText.textContent = 'TICKER OFF';
    }
  }
}

function toggleTickerVisibility() {
  const newVis = !currentTickerData.visible;
  currentTickerData.visible = newVis;
  updateTickerUI(currentTickerData);

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'TICKER_TOGGLE',
      visible: newVis
    }));
  } else {
    fetch('/api/ticker/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: newVis })
    }).catch(() => {});
  }

  showToast(newVis ? '📢 Running Text Ditampilkan (Live)' : '⬛ Running Text Dimatikan');
}

function applyTickerChanges() {
  const label = ctrlTickerLabel ? ctrlTickerLabel.value.trim() : 'INFO WISUDA';
  const speed = ctrlTickerSpeed ? parseInt(ctrlTickerSpeed.value, 10) : 30;
  const text = ctrlTickerText ? ctrlTickerText.value.trim() : '';

  currentTickerData.label = label || 'INFO WISUDA';
  currentTickerData.speed = speed || 30;
  if (text) currentTickerData.text = text;
  currentTickerData.visible = true; // Auto-show on apply

  updateTickerUI(currentTickerData);

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'TICKER_UPDATE',
      ticker: currentTickerData
    }));
  } else {
    fetch('/api/ticker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentTickerData)
    }).catch(() => {});
  }

  showToast('⚡ Running text berhasil diupdate & ditayangkan!');
}

// Helper: Toast
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2200);
}

// Update the Top Monitor Preview and Active Card UI
function updateUIFromActiveData() {
  const data = currentActiveData;
  const ratingMatch = data.tag ? data.tag.match(/\d{2,3}/) : null;
  const ratingVal = ratingMatch ? ratingMatch[0] : '102';
  const svgIcon = SOCIAL_ICONS[data.socialPlatform] || SOCIAL_ICONS.youtube;

  // 1. Monitor Preview
  prevTitle.textContent = data.title || 'MUHAMMAD RIZKY';
  prevSubtitle.textContent = data.subtitle || 'TIMNAS INDONESIA ESPORTS • TOP 10 GLOBAL';
  prevTag.textContent = data.tag ? data.tag.toUpperCase() : 'DIV 1';
  prevRating.textContent = ratingVal;
  prevSocial.textContent = data.socialHandle || '';
  prevSocialIcon.innerHTML = svgIcon;
  prevSocialWrapper.style.display = data.socialHandle ? 'flex' : 'none';

  // 2. Active Cue Card
  cardActiveTitle.textContent = data.title || 'MUHAMMAD RIZKY';
  cardActiveSubtitle.textContent = data.subtitle || 'TIMNAS INDONESIA ESPORTS • TOP 10 GLOBAL';
  cardActiveTag.textContent = data.tag ? data.tag.toUpperCase() : 'DIV 1';
  cardActiveSocialHandle.textContent = data.socialHandle || '';
  cardActiveSocialIcon.innerHTML = svgIcon;

  // 3. Inline Editor Inputs
  editTitle.value = data.title || '';
  editSubtitle.value = data.subtitle || '';
  editTag.value = data.tag || '';
  editPlatform.value = data.socialPlatform || 'youtube';
  editSocial.value = data.socialHandle || '';

  renderRundownList();
}

// Set On-Air status in mobile header & monitor
function setLiveStatus(live) {
  isLive = live;
  if (live) {
    appAirBadge.className = 'air-badge is-live';
    airText.textContent = 'ON AIR';
    previewContainer.classList.remove('is-hidden');
    previewContainer.classList.add('is-visible');
  } else {
    appAirBadge.className = 'air-badge is-off';
    airText.textContent = 'STANDBY';
    previewContainer.classList.remove('is-visible');
    previewContainer.classList.add('is-hidden');
  }
  renderRundownList();
}

// Render Rundown list
function renderRundownList() {
  rundownContainer.innerHTML = '';

  currentRundown.forEach((cue, index) => {
    const card = document.createElement('div');
    const isActive = (cue.id === activeRundownId);
    const isOnAir = isActive && isLive;

    card.className = `rundown-card ${isOnAir ? 'is-active-on-air' : (isActive ? 'is-selected' : '')}`;
    card.id = `cue-item-${cue.id}`;

    card.innerHTML = `
      <div class="rd-main-info">
        <span class="rd-tag">${cue.tag || 'WISUDA'}</span>
        <div class="rd-title">${cue.title}</div>
        <div class="rd-subtitle">${cue.subtitle || ''}</div>
      </div>
      <div class="rd-actions-bar">
        <button class="btn-rd-trigger ${isOnAir ? 'is-on-air' : ''}" data-id="${cue.id}">
          ${isOnAir ? '🔴 SEDANG TAYANG (LIVE)' : (isActive ? '▶ TAMPILKAN KE OBS' : '▶ PILIH & TAMPILKAN')}
        </button>
        <button class="btn-rd-icon edit" data-id="${cue.id}" title="Pilih & Edit">✏️</button>
        <button class="btn-rd-icon del" data-id="${cue.id}" title="Hapus Cue">✕</button>
      </div>
    `;

    // Trigger button (Immediate Go Live)
    card.querySelector('.btn-rd-trigger').addEventListener('click', () => {
      triggerSelectCue(cue, true);
    });

    // Edit button (Select without immediately showing if not wanted)
    card.querySelector('.btn-rd-icon.edit').addEventListener('click', () => {
      triggerSelectCue(cue, false);
      inlineEditor.classList.remove('is-collapsed');
      inlineEditor.scrollIntoView({ behavior: 'smooth' });
    });

    // Delete button
    card.querySelector('.btn-rd-icon.del').addEventListener('click', () => {
      if (confirm(`Hapus "${cue.title}" dari rundown?`)) {
        currentRundown = currentRundown.filter(item => item.id !== cue.id);
        syncRundownToServer();
        renderRundownList();
        showToast('Cue dihapus dari rundown.');
      }
    });

    rundownContainer.appendChild(card);
  });
}

let previewAnimTimer = null;

function animatePreviewTransition(updateContentCallback) {
  if (previewAnimTimer) clearTimeout(previewAnimTimer);
  previewContainer.classList.remove('anim-in');
  previewContainer.classList.add('anim-out');

  previewAnimTimer = setTimeout(() => {
    if (updateContentCallback) updateContentCallback();
    previewContainer.classList.remove('anim-out');
    previewContainer.classList.remove('is-hidden');
    previewContainer.classList.add('is-visible');
    previewContainer.classList.add('anim-in');
  }, 320);
}

// Select a Cue from rundown (Automatically plays OUT then IN if currently ON AIR)
function triggerSelectCue(cue, goLiveImmediately = false) {
  const isDifferent = (activeRundownId !== cue.id);
  activeRundownId = cue.id;
  currentActiveData = {
    ...currentActiveData,
    template: 'efootball',
    currentRundownId: cue.id,
    id: cue.id,
    title: cue.title,
    subtitle: cue.subtitle,
    tag: cue.tag,
    socialPlatform: cue.socialPlatform || 'youtube',
    socialHandle: cue.socialHandle || ''
  };

  if (isLive && isDifferent) {
    // Graphic is currently ON AIR: animate out first, then in!
    animatePreviewTransition(() => {
      updateUIFromActiveData();
    });
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'SHOW',
        data: currentActiveData
      }));
    }
    showToast(`🔄 Beralih: ${cue.title}`);
  } else {
    updateUIFromActiveData();
    if (goLiveImmediately) {
      sendShowCommand();
    }
  }
}

// Next Cue button in bottom action bar
function triggerNextCue() {
  if (currentRundown.length === 0) return;
  let currentIndex = currentRundown.findIndex(r => r.id === activeRundownId);
  if (currentIndex === -1) currentIndex = 0;
  else currentIndex = (currentIndex + 1) % currentRundown.length;

  const nextCue = currentRundown[currentIndex];
  triggerSelectCue(nextCue, true);
}

// WebSocket Actions
function sendShowCommand() {
  currentActiveData.currentRundownId = activeRundownId;
  currentActiveData.id = activeRundownId;
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'SHOW',
      data: currentActiveData
    }));
  }
  previewContainer.classList.remove('is-hidden');
  previewContainer.classList.remove('anim-out');
  previewContainer.classList.add('is-visible');
  previewContainer.classList.add('anim-in');
  setLiveStatus(true);
  showToast('🔴 Ditampilkan ke OBS!');
}

function sendHideCommand() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'HIDE'
    }));
  }
  if (previewAnimTimer) clearTimeout(previewAnimTimer);
  previewContainer.classList.remove('anim-in');
  previewContainer.classList.add('anim-out');
  previewAnimTimer = setTimeout(() => {
    setLiveStatus(false);
  }, 320);
  showToast('⬛ Grafis disembunyikan.');
}

// Fullscreen Transition Controls
function setTransitionStatus(active) {
  isTransitionActive = active;
  if (!btnActionTransition) return;
  const icon = btnActionTransition.querySelector('.transition-icon');
  if (active) {
    btnActionTransition.classList.add('is-active');
    if (btnTransitionText) btnTransitionText.textContent = 'TRANSISI OUT';
    if (icon) icon.textContent = '⏹️';
  } else {
    btnActionTransition.classList.remove('is-active');
    if (btnTransitionText) btnTransitionText.textContent = 'TRANSISI';
    if (icon) icon.textContent = '⚡';
  }
}

function handleTransitionEvent(action) {
  if (!previewFullscreenTransition) return;
  if (previewTransitionTimer) clearTimeout(previewTransitionTimer);

  if (action === 'in') {
    previewFullscreenTransition.classList.remove('is-hidden');
    previewFullscreenTransition.classList.remove('anim-out');
    previewFullscreenTransition.classList.add('is-visible');
    previewFullscreenTransition.classList.add('anim-in');
  } else if (action === 'out') {
    previewFullscreenTransition.classList.remove('anim-in');
    previewFullscreenTransition.classList.add('anim-out');
    previewTransitionTimer = setTimeout(() => {
      if (!isTransitionActive) {
        previewFullscreenTransition.classList.remove('is-visible');
        previewFullscreenTransition.classList.remove('anim-out');
        previewFullscreenTransition.classList.add('is-hidden');
      }
    }, 550);
  }
}

function toggleTransition() {
  const targetAction = isTransitionActive ? 'out' : 'in';
  setTransitionStatus(!isTransitionActive);
  handleTransitionEvent(targetAction);

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'TRANSITION',
      action: targetAction
    }));
  } else {
    fetch(`/api/transition/${targetAction}`, { method: 'POST' }).catch(() => {});
  }

  if (targetAction === 'in') {
    showToast('🎬 Transisi IN: Layar Penuh Aktif');
  } else {
    showToast('✨ Transisi OUT: Layar Terbuka');
  }
}

// Audio Playback Controls (Wisuda Anthems)
let currentPlayingSong = null;

function setAudioButtonPlaying(songKey) {
  currentPlayingSong = songKey;
  const audioButtons = document.querySelectorAll('.btn-action-audio');
  audioButtons.forEach(btn => {
    const isThis = btn.dataset.song === songKey;
    const icon = btn.querySelector('.audio-icon');
    if (isThis) {
      btn.classList.add('is-playing');
      if (icon) {
        if (!icon.dataset.orig) icon.dataset.orig = icon.textContent;
        icon.textContent = '⏹️';
      }
    } else {
      btn.classList.remove('is-playing');
      if (icon && icon.dataset.orig) {
        icon.textContent = icon.dataset.orig;
      }
    }
  });
}

function handleAudioButtonClick(btn) {
  const songKey = btn.dataset.song;
  const songTitle = btn.dataset.title || (btn.querySelector('.action-btn-label') ? btn.querySelector('.action-btn-label').textContent : songKey);

  if (currentPlayingSong === songKey) {
    // Currently playing this song -> stop
    setAudioButtonPlaying(null);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'AUDIO_STOP' }));
    } else {
      fetch('/api/audio/stop', { method: 'POST' }).catch(() => {});
    }
    showToast('⏹️ Musik dihentikan.');
  } else {
    // Play selected audio
    setAudioButtonPlaying(songKey);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'AUDIO_PLAY',
        song: songKey,
        title: songTitle
      }));
    } else {
      fetch('/api/audio/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song: songKey, title: songTitle })
      }).catch(() => {});
    }
    showToast(`🎵 Memutar: ${songTitle}`);
  }
}

function syncRundownToServer() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'SYNC_RUNDOWN',
      rundown: currentRundown
    }));
  }
}

// WebSocket Connection Setup
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    connDot.className = 'status-indicator connected';
    connText.textContent = 'Online / Terhubung';
    socket.send(JSON.stringify({ type: 'REGISTER', role: 'control' }));
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);

      if (msg.type === 'STATE_SYNC') {
        if (msg.rundown && Array.isArray(msg.rundown)) {
          currentRundown = msg.rundown;
        }
        if (msg.state) {
          currentActiveData = { ...currentActiveData, ...msg.state };
          if (msg.state.currentRundownId) {
            activeRundownId = msg.state.currentRundownId;
          } else if (msg.state.title) {
            const found = currentRundown.find(r => r.title === msg.state.title);
            activeRundownId = found ? found.id : (currentRundown[0] ? currentRundown[0].id : null);
          }
          setLiveStatus(msg.state.visible);
          if (typeof msg.state.transitionActive !== 'undefined') {
            setTransitionStatus(msg.state.transitionActive);
            handleTransitionEvent(msg.state.transitionActive ? 'in' : 'out');
          }
        }
        if (msg.audio && msg.audio.playing) {
          setAudioButtonPlaying(msg.audio.song);
        } else {
          setAudioButtonPlaying(null);
        }
        if (msg.ticker) {
          updateTickerUI(msg.ticker);
        }
        updateUIFromActiveData();
      } else if (msg.type === 'SHOW') {
        if (msg.state) {
          currentActiveData = { ...currentActiveData, ...msg.state };
          if (msg.state.currentRundownId) {
            activeRundownId = msg.state.currentRundownId;
          } else if (msg.state.title) {
            const found = currentRundown.find(r => r.title === msg.state.title);
            if (found) activeRundownId = found.id;
          }
          if (msg.state.ticker) {
            updateTickerUI(msg.state.ticker);
          }
        }
        setLiveStatus(true);
        updateUIFromActiveData();
      } else if (msg.type === 'HIDE') {
        setLiveStatus(false);
      } else if (msg.type === 'TRANSITION') {
        setTransitionStatus(msg.action === 'in');
        handleTransitionEvent(msg.action);
      } else if (msg.type === 'AUDIO_PLAY') {
        if (msg.audio) setAudioButtonPlaying(msg.audio.song);
      } else if (msg.type === 'AUDIO_STOP') {
        setAudioButtonPlaying(null);
      } else if (msg.type === 'TICKER_UPDATE' || msg.type === 'RUNNING_TEXT_UPDATE') {
        if (msg.ticker) {
          updateTickerUI(msg.ticker);
        }
      } else if (msg.type === 'RUNDOWN_UPDATED') {
        if (Array.isArray(msg.rundown)) {
          currentRundown = msg.rundown;
          renderRundownList();
        }
      } else if (msg.type === 'STATS_UPDATE') {
        const obsCount = msg.stats.overlayCount || 0;
        obsCountText.textContent = `${obsCount} Terhubung`;
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  };

  socket.onclose = () => {
    connDot.className = 'status-indicator disconnected';
    connText.textContent = 'Terputus (Menghubungkan ulang...)';
    setTimeout(initWebSocket, 2000);
  };

  socket.onerror = (err) => {
    console.error('WebSocket Error:', err);
    socket.close();
  };
}

// Event Listeners Setup
function setupListeners() {
  // Bottom action buttons (Row 1)
  if (btnActionShow) btnActionShow.addEventListener('click', sendShowCommand);
  if (btnActionHide) btnActionHide.addEventListener('click', sendHideCommand);
  if (btnActionTransition) btnActionTransition.addEventListener('click', toggleTransition);
  if (btnActionNext) btnActionNext.addEventListener('click', triggerNextCue);

  // Running Text (Ticker) listeners
  if (btnTickerToggle) btnTickerToggle.addEventListener('click', toggleTickerVisibility);
  if (btnApplyTicker) btnApplyTicker.addEventListener('click', applyTickerChanges);
  if (ctrlTickerText) {
    ctrlTickerText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        applyTickerChanges();
      }
    });
  }

  // Audio buttons (Row 2)
  const audioButtons = document.querySelectorAll('.btn-action-audio');
  audioButtons.forEach(btn => {
    btn.addEventListener('click', () => handleAudioButtonClick(btn));
  });

  // Audio Upload Modal & Dynamic Status
  const btnOpenAudioModal = document.getElementById('btn-open-audio-modal');
  const audioModal = document.getElementById('audio-modal');
  const btnCloseAudioModal = document.getElementById('btn-close-audio-modal');
  const btnCancelAudioModal = document.getElementById('btn-cancel-audio-modal');
  const audioFileInput = document.getElementById('audio-file-input');
  let currentUploadTargetSong = null;

  const refreshAudioStatusList = async () => {
    try {
      const res = await fetch('/api/audio/list');
      const data = await res.json();
      if (data.success && Array.isArray(data.tracks)) {
        data.tracks.forEach(track => {
          const statusEl = document.getElementById(`status-${track.key}`);
          if (statusEl) {
            const sizeMb = (track.size / (1024 * 1024)).toFixed(1);
            const sizeKb = Math.round(track.size / 1024);
            const displaySize = sizeMb >= 1 ? `${sizeMb} MB` : `${sizeKb} KB`;
            statusEl.textContent = `File: ${track.filename} (${displaySize}) ✓`;
            statusEl.style.color = 'var(--ef-volt)';
          }
        });
      }
    } catch (_) {}
  };

  if (btnOpenAudioModal && audioModal) {
    btnOpenAudioModal.addEventListener('click', () => {
      audioModal.classList.remove('is-hidden');
      refreshAudioStatusList();
    });
  }

  // Preload audio status
  refreshAudioStatusList();

  const closeAudioModal = () => audioModal && audioModal.classList.add('is-hidden');
  if (btnCloseAudioModal) btnCloseAudioModal.addEventListener('click', closeAudioModal);
  if (btnCancelAudioModal) btnCancelAudioModal.addEventListener('click', closeAudioModal);

  document.querySelectorAll('.btn-audio-upload-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      currentUploadTargetSong = btn.dataset.song;
      if (audioFileInput) audioFileInput.click();
    });
  });

  if (audioFileInput) {
    audioFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file || !currentUploadTargetSong) return;

      const formData = new FormData();
      formData.append('audioFile', file);
      formData.append('song', currentUploadTargetSong);

      showToast(`⏳ Mengunggah audio untuk ${currentUploadTargetSong}...`);
      try {
        const res = await fetch('/api/audio/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          refreshAudioStatusList();
          showToast(`✅ File audio ${currentUploadTargetSong} berhasil diperbarui!`);
        } else {
          showToast(`❌ Gagal: ${data.message || 'Error saat upload'}`);
        }
      } catch (err) {
        showToast('❌ Gagal mengunggah file audio.');
      } finally {
        audioFileInput.value = '';
      }
    });
  }

  // Toggle inline editor
  if (btnToggleEditor && inlineEditor) {
    btnToggleEditor.addEventListener('click', () => {
      inlineEditor.classList.toggle('is-collapsed');
    });
  }

  // Save inline editor changes
  if (btnSaveEdit) {
    btnSaveEdit.addEventListener('click', () => {
      currentActiveData.title = editTitle.value.trim() || 'MUHAMMAD RIZKY';
      currentActiveData.subtitle = editSubtitle.value.trim();
      currentActiveData.tag = editTag.value.trim() || 'DIV 1';
      currentActiveData.socialPlatform = editPlatform.value;
      currentActiveData.socialHandle = editSocial.value.trim();

      // Update in rundown if match
      const item = currentRundown.find(r => r.id === activeRundownId);
      if (item) {
        item.title = currentActiveData.title;
        item.subtitle = currentActiveData.subtitle;
        item.tag = currentActiveData.tag;
        item.socialPlatform = currentActiveData.socialPlatform;
        item.socialHandle = currentActiveData.socialHandle;
        syncRundownToServer();
      }

      updateUIFromActiveData();

      // Push live update over WebSocket
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'UPDATE',
          data: currentActiveData
        }));
      }

      showToast('⚡ Perubahan berhasil dikirim live!');
    });
  }

  // Modal Add Cue
  if (btnOpenAddModal && addModal) {
    btnOpenAddModal.addEventListener('click', () => {
      addModal.classList.remove('is-hidden');
      modalInputTitle.value = '';
      modalInputSubtitle.value = '';
      modalInputTag.value = 'MATCHDAY';
      modalInputSocial.value = '';
      modalInputTitle.focus();
    });
  }

  const closeModal = () => addModal && addModal.classList.add('is-hidden');
  if (btnCloseAddModal) btnCloseAddModal.addEventListener('click', closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

  if (btnSubmitAddCue) {
    btnSubmitAddCue.addEventListener('click', () => {
      const title = modalInputTitle.value.trim();
      if (!title) {
        alert('Masukkan judul atau nama cue!');
        return;
      }

      const newCue = {
        id: 'rd-' + Date.now(),
        title,
        subtitle: modalInputSubtitle.value.trim(),
        tag: modalInputTag.value.trim() || 'DIV 1',
        socialPlatform: modalInputPlatform.value,
        socialHandle: modalInputSocial.value.trim()
      };

      currentRundown.push(newCue);
      syncRundownToServer();
      renderRundownList();
      closeModal();
      showToast(`Cue "${title}" berhasil ditambahkan!`);
    });
  }

  // Copy OBS URL Buttons
  const copyObs = () => {
    const fullUrl = `${window.location.origin}/overlay`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      showToast(`URL OBS Disalin: ${fullUrl}`);
    }).catch(() => {
      showToast('Gagal menyalin otomatis, silakan copy manual.');
    });
  };

  const btnCopyObs1 = document.getElementById('btn-copy-obs');
  const btnCopyObs2 = document.getElementById('btn-copy-obs-2');
  if (btnCopyObs1) btnCopyObs1.addEventListener('click', copyObs);
  if (btnCopyObs2) btnCopyObs2.addEventListener('click', copyObs);
  const obsUrlInput = document.getElementById('obs-source-url-input');
  if (obsUrlInput) obsUrlInput.value = `${window.location.origin}/overlay`;

  // Excel Toolbar Listeners
  const btnReloadExcel = document.getElementById('btn-reload-excel');
  const btnUploadExcel = document.getElementById('btn-upload-excel');
  const excelFileInput = document.getElementById('excel-file-input');

  if (btnReloadExcel) {
    btnReloadExcel.addEventListener('click', async () => {
      try {
        btnReloadExcel.textContent = '⏳ Loading...';
        const res = await fetch('/api/rundown/reload', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          currentRundown = data.rundown;
          renderRundownList();
          showToast(`🔄 Berhasil memuat ${data.count} cue dari rundown.xlsx!`);
        } else {
          showToast('❌ Gagal memuat file Excel.');
        }
      } catch (err) {
        showToast('❌ Terjadi kesalahan saat membaca Excel.');
      } finally {
        btnReloadExcel.textContent = '🔄 Reload';
      }
    });
  }

  if (btnUploadExcel && excelFileInput) {
    btnUploadExcel.addEventListener('click', () => {
      excelFileInput.click();
    });

    excelFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('excel', file);

      btnUploadExcel.textContent = '⏳ Uploading...';
      try {
        const res = await fetch('/api/rundown/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          currentRundown = data.rundown;
          renderRundownList();
          showToast(`✅ Excel baru aktif! ${data.count} cue dimuat.`);
        } else {
          showToast(`❌ Gagal: ${data.message || 'Format tidak valid'}`);
        }
      } catch (err) {
        showToast('❌ Gagal mengunggah file Excel.');
      } finally {
        btnUploadExcel.textContent = '📤 Upload';
        excelFileInput.value = '';
      }
    });
  }
}

// Fetch initial state via REST immediately for fast rendering
async function fetchInitialState() {
  try {
    const res = await fetch('/api/state');
    const data = await res.json();
    if (data.success) {
      if (data.rundown && Array.isArray(data.rundown)) {
        currentRundown = data.rundown;
        renderRundownList();
      }
      if (data.state) {
        currentActiveData = { ...currentActiveData, ...data.state };
        if (data.state.currentRundownId) {
          activeRundownId = data.state.currentRundownId;
        } else if (data.state.title) {
          const found = currentRundown.find(r => r.title === data.state.title);
          activeRundownId = found ? found.id : (currentRundown[0] ? currentRundown[0].id : null);
        }
        setLiveStatus(data.state.visible);
        if (typeof data.state.transitionActive !== 'undefined') {
          setTransitionStatus(data.state.transitionActive);
          handleTransitionEvent(data.state.transitionActive ? 'in' : 'out');
        }
        updateUIFromActiveData();
      }
      if (data.audio && data.audio.playing) {
        setAudioButtonPlaying(data.audio.song);
      } else {
        setAudioButtonPlaying(null);
      }
    }
  } catch (err) {
    console.warn('Initial state fetch error:', err);
  }
}

// Startup
document.addEventListener('DOMContentLoaded', () => {
  try {
    setupListeners();
  } catch (err) {
    console.error('Error during setupListeners:', err);
  }
  fetchInitialState();
  initWebSocket();
});
