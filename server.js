const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { WebSocketServer, WebSocket } = require('ws');
const xlsx = require('xlsx');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const EXCEL_PATH = path.join(__dirname, 'rundown.xlsx');

// Multer upload config for Excel files
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

app.use(express.json());

// Serve static files with no-cache in dev so browser always gets latest CSS/JS
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

// Default in-memory rundown
let rundown = [];

// Helper function to read Rundown from Excel file
function loadRundownFromExcel(filePath = EXCEL_PATH) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[Excel] File ${filePath} tidak ditemukan, membuat file default...`);
      createDefaultExcel(filePath);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      console.warn('[Excel] File Excel kosong!');
      return false;
    }

    // Normalize rows supporting English & Indonesian column headers
    const parsedRundown = rawRows.map((row, idx) => {
      // Find Title / Judul
      const title = row['Judul'] || row['Title'] || row['Nama'] || row['Player'] || row['Match'] || Object.values(row)[0] || `Match ${idx + 1}`;
      
      // Find Subtitle / Tim
      const subtitle = row['Subtitle'] || row['Tim'] || row['Team'] || row['Detail'] || row['Keterangan'] || Object.values(row)[1] || '';

      // Find Tag / Divisi / Rating
      const tag = row['Tag'] || row['Divisi'] || row['Div'] || row['Rating'] || row['OVR'] || 'DIV 1';

      // Find Social Platform
      let platform = (row['Platform'] || row['Sosmed_Platform'] || 'youtube').toString().toLowerCase().trim();
      if (!['youtube', 'twitch', 'twitter', 'instagram', 'tiktok', 'discord'].includes(platform)) {
        platform = 'youtube';
      }

      // Find Social Handle
      const socialHandle = (row['Sosmed'] || row['Handle'] || row['Username'] || row['Akun'] || row['Social'] || '').toString().trim();

      return {
        id: `rd-${idx + 1}`,
        title: title.toString().trim(),
        subtitle: subtitle.toString().trim(),
        tag: tag.toString().trim(),
        socialPlatform: platform,
        socialHandle: socialHandle
      };
    });

    rundown = parsedRundown;
    console.log(`[Excel] Berhasil memuat ${rundown.length} item rundown dari ${path.basename(filePath)}`);
    return true;
  } catch (err) {
    console.error('[Excel] Gagal membaca file Excel:', err.message);
    return false;
  }
}

// Create starter rundown.xlsx if file not exists
function createDefaultExcel(filePath) {
  const data = [
    { 'Judul': 'STREAM OPENING', 'Subtitle': 'eFootball™ Championship 2026 Season', 'Tag': 'LIVE', 'Platform': 'youtube', 'Sosmed': '@eFootballID' },
    { 'Judul': 'MUHAMMAD RIZKY', 'Subtitle': 'Timnas Indonesia Esports • Top 10 Global', 'Tag': 'DIV 1', 'Platform': 'youtube', 'Sosmed': 'youtube.com/@RizkyEF' },
    { 'Judul': 'MATCH 1: INDONESIA VS JEPANG', 'Subtitle': 'Group Stage • Best of 3 Games', 'Tag': 'MATCHDAY', 'Platform': 'twitch', 'Sosmed': 'twitch.tv/efootball_live' },
    { 'Judul': 'HALF TIME BREAK', 'Subtitle': 'Analisis Formasi & Highlight Babak Pertama', 'Tag': '102 OVR', 'Platform': 'youtube', 'Sosmed': '@eFootballID' },
    { 'Judul': 'MATCH 2: INDONESIA VS KOREA', 'Subtitle': 'Semifinal Match • Leg 2', 'Tag': 'MATCHDAY', 'Platform': 'twitch', 'Sosmed': 'twitch.tv/efootball_live' },
    { 'Judul': 'CLOSING & MVP CEREMONY', 'Subtitle': 'Klasemen Akhir & Penyerahan Penghargaan', 'Tag': 'FINAL', 'Platform': 'youtube', 'Sosmed': '@eFootballID' }
  ];
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Rundown');
  xlsx.writeFile(wb, filePath);
}

// Initial load from Excel
loadRundownFromExcel(EXCEL_PATH);

// Watch for file changes on rundown.xlsx so editing in Excel updates the app automatically!
let fsWait = null;
fs.watchFile(EXCEL_PATH, { interval: 1000 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    if (fsWait) return;
    fsWait = setTimeout(() => {
      fsWait = null;
      console.log('[Excel] Perubahan file rundown.xlsx terdeteksi! Memperbarui rundown...');
      if (loadRundownFromExcel(EXCEL_PATH)) {
        broadcast({ type: 'RUNDOWN_UPDATED', rundown });
      }
    }, 300);
  }
});

// Current State Store (Dedicated eFootball Theme, No Timer)
const firstItem = rundown[0] || {
  title: 'MUHAMMAD RIZKY',
  subtitle: 'Timnas Indonesia Esports • Top 10 Global',
  tag: 'DIV 1',
  socialPlatform: 'youtube',
  socialHandle: 'youtube.com/@RizkyEF'
};

let currentState = {
  visible: false,
  template: 'efootball',
  currentRundownId: firstItem.id || 'rd-1',
  title: firstItem.title,
  subtitle: firstItem.subtitle,
  tag: firstItem.tag,
  socialPlatform: firstItem.socialPlatform || 'youtube',
  socialHandle: firstItem.socialHandle || '',
  position: 'bottom-left',
  accentColor: '#d4ff00', // eFootball Volt Lime
  secondaryColor: '#001f70', // eFootball Midnight Blue
  enableSound: false,
  transitionActive: false,
  updatedAt: Date.now()
};

// Audio Resolution Helper: locates real file with any supported extension in public/audio/
function resolveAudioFile(songKey) {
  if (!songKey) return null;
  const audioDir = path.join(__dirname, 'public', 'audio');
  if (!fs.existsSync(audioDir)) return null;

  const validExts = ['.mp3', '.mpeg', '.aac', '.m4a', '.wav', '.ogg', '.mp4'];
  try {
    const files = fs.readdirSync(audioDir);
    // 1. Exact match with supported extensions
    for (const ext of validExts) {
      const target = `${songKey}${ext}`;
      if (files.includes(target)) {
        const stats = fs.statSync(path.join(audioDir, target));
        return {
          filename: target,
          url: `/audio/${target}?v=${Math.floor(stats.mtimeMs)}`
        };
      }
    }
    // 2. Case-insensitive name match
    const lowerKey = songKey.toLowerCase();
    const matched = files.find(f => {
      const parsed = path.parse(f);
      return parsed.name.toLowerCase() === lowerKey && validExts.includes(parsed.ext.toLowerCase());
    });
    if (matched) {
      const stats = fs.statSync(path.join(audioDir, matched));
      return {
        filename: matched,
        url: `/audio/${matched}?v=${Math.floor(stats.mtimeMs)}`
      };
    }
  } catch (err) {
    console.error('[Audio] Error resolving audio file:', err);
  }

  return {
    filename: `${songKey}.mp3`,
    url: `/audio/${songKey}.mp3?v=${Date.now()}`
  };
}

// Audio Playback Store (Wisuda Anthems & Custom Songs)
let currentAudio = {
  playing: false,
  song: null,
  title: '',
  url: '',
  startedAt: 0
};

// Running Text / News Ticker Store (Bottom Screen Broadcast Marquee)
let currentTicker = {
  visible: true,
  label: 'INFO WISUDA',
  text: 'SELAMAT DATANG DI WISUDA SARJANA XXIV STIMI YAPMI MAKASSAR • TAHUN AKADEMIK 2025/2026 • TETAP TERTIB & PATUHI PROTOKOL SIARAN • SELAMAT KEPADA SELURUH WISUDAWAN & WISUDAWATI TERBAIK • SUKSES MENJADI GENERASI PEMIMPIN MASA DEPAN',
  speed: 30, // seconds for full loop
  updatedAt: Date.now()
};

// Connected client tracking
const clients = new Set();

function broadcast(message) {
  const payload = typeof message === 'string' ? message : JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function sendStats() {
  let overlayCount = 0;
  let controlCount = 0;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      if (client.clientRole === 'overlay') overlayCount++;
      else if (client.clientRole === 'control') controlCount++;
    }
  }
  broadcast({
    type: 'STATS_UPDATE',
    stats: {
      total: clients.size,
      overlayCount,
      controlCount
    }
  });
}

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.clientRole = 'unknown';

  // Send initial state & rundown sync to newly connected client
  ws.send(JSON.stringify({
    type: 'STATE_SYNC',
    state: currentState,
    rundown: rundown,
    audio: currentAudio,
    ticker: currentTicker
  }));

  ws.on('message', (messageRaw) => {
    try {
      const msg = JSON.parse(messageRaw.toString());

      if (msg.type === 'REGISTER') {
        ws.clientRole = msg.role || 'control';
        sendStats();
        return;
      }

      if (msg.type === 'SHOW') {
        const data = msg.data || {};
        let targetRundownId = data.currentRundownId || data.id || currentState.currentRundownId;
        if (!data.currentRundownId && !data.id && data.title) {
          const match = rundown.find(r => r.title === data.title);
          if (match) targetRundownId = match.id;
        }

        currentState = {
          ...currentState,
          template: 'efootball',
          ...data,
          currentRundownId: targetRundownId,
          visible: true,
          updatedAt: Date.now()
        };
        broadcast({ type: 'SHOW', state: currentState });
      } else if (msg.type === 'HIDE') {
        currentState.visible = false;
        currentState.updatedAt = Date.now();
        broadcast({ type: 'HIDE', state: currentState });
      } else if (msg.type === 'UPDATE') {
        const data = msg.data || {};
        let targetRundownId = data.currentRundownId || data.id || currentState.currentRundownId;
        if (!data.currentRundownId && !data.id && data.title) {
          const match = rundown.find(r => r.title === data.title);
          if (match) targetRundownId = match.id;
        }

        currentState = {
          ...currentState,
          template: 'efootball',
          ...data,
          currentRundownId: targetRundownId,
          updatedAt: Date.now()
        };
        broadcast({ type: 'UPDATE', state: currentState });
      } else if (msg.type === 'RELOAD_EXCEL') {
        if (loadRundownFromExcel(EXCEL_PATH)) {
          broadcast({ type: 'RUNDOWN_UPDATED', rundown });
        }
      } else if (msg.type === 'TRIGGER_RUNDOWN') {
        const item = rundown.find(r => r.id === msg.id);
        if (item) {
          currentState = {
            ...currentState,
            currentRundownId: item.id,
            title: item.title,
            subtitle: item.subtitle,
            tag: item.tag,
            socialPlatform: item.socialPlatform || 'youtube',
            socialHandle: item.socialHandle || '',
            visible: true,
            updatedAt: Date.now()
          };
          broadcast({ type: 'SHOW', state: currentState });
        }
      } else if (msg.type === 'TRANSITION') {
        const action = msg.action; // 'in' | 'out' | 'toggle'
        if (action === 'in') {
          currentState.transitionActive = true;
        } else if (action === 'out') {
          currentState.transitionActive = false;
        } else if (action === 'toggle') {
          currentState.transitionActive = !currentState.transitionActive;
        }
        currentState.updatedAt = Date.now();
        broadcast({
          type: 'TRANSITION',
          action: currentState.transitionActive ? 'in' : 'out',
          transitionActive: currentState.transitionActive
        });
      } else if (msg.type === 'AUDIO_PLAY') {
        const songKey = msg.song || 'indonesia_raya';
        const resolved = resolveAudioFile(songKey);
        currentAudio = {
          playing: true,
          song: songKey,
          title: msg.title || msg.song || 'Indonesia Raya',
          url: resolved ? resolved.url : `/audio/${songKey}.mp3`,
          startedAt: Date.now()
        };
        broadcast({ type: 'AUDIO_PLAY', audio: currentAudio });
      } else if (msg.type === 'AUDIO_STOP') {
        currentAudio = {
          playing: false,
          song: null,
          title: '',
          url: '',
          startedAt: 0
        };
        broadcast({ type: 'AUDIO_STOP', audio: currentAudio });
      } else if (msg.type === 'TICKER_UPDATE' || msg.type === 'RUNNING_TEXT_UPDATE') {
        const data = msg.ticker || msg.data || {};
        currentTicker = {
          ...currentTicker,
          ...data,
          updatedAt: Date.now()
        };
        broadcast({ type: 'TICKER_UPDATE', ticker: currentTicker });
      } else if (msg.type === 'TICKER_TOGGLE' || msg.type === 'RUNNING_TEXT_TOGGLE') {
        const targetVis = (typeof msg.visible !== 'undefined') ? !!msg.visible : !currentTicker.visible;
        currentTicker.visible = targetVis;
        currentTicker.updatedAt = Date.now();
        broadcast({ type: 'TICKER_UPDATE', ticker: currentTicker });
      } else if (msg.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    sendStats();
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error:', err);
    clients.delete(ws);
  });
});

// REST API for external triggers & Excel Management
app.get('/api/state', (req, res) => {
  res.json({ success: true, state: currentState, rundown, audio: currentAudio, ticker: currentTicker });
});

// Running Text (Ticker) REST endpoints
app.get('/api/ticker', (req, res) => {
  res.json({ success: true, ticker: currentTicker });
});

app.post('/api/ticker', (req, res) => {
  const data = req.body || {};
  currentTicker = {
    ...currentTicker,
    ...data,
    updatedAt: Date.now()
  };
  broadcast({ type: 'TICKER_UPDATE', ticker: currentTicker });
  res.json({ success: true, ticker: currentTicker });
});

app.post('/api/ticker/toggle', (req, res) => {
  const { visible } = req.body || {};
  currentTicker.visible = typeof visible !== 'undefined' ? !!visible : !currentTicker.visible;
  currentTicker.updatedAt = Date.now();
  broadcast({ type: 'TICKER_UPDATE', ticker: currentTicker });
  res.json({ success: true, ticker: currentTicker });
});

// Reload Excel on demand
app.post('/api/rundown/reload', (req, res) => {
  const ok = loadRundownFromExcel(EXCEL_PATH);
  if (ok) {
    broadcast({ type: 'RUNDOWN_UPDATED', rundown });
    res.json({ success: true, count: rundown.length, rundown });
  } else {
    res.status(500).json({ success: false, message: 'Gagal membaca file Excel' });
  }
});

// Download current Excel file
app.get('/api/rundown/download', (req, res) => {
  if (fs.existsSync(EXCEL_PATH)) {
    res.download(EXCEL_PATH, 'rundown.xlsx');
  } else {
    res.status(404).send('File rundown.xlsx tidak ditemukan');
  }
});
app.get('/rundown.xlsx', (req, res) => {
  res.download(EXCEL_PATH, 'rundown.xlsx');
});

// Upload new Excel file
app.post('/api/rundown/upload', upload.single('excel'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
  }

  try {
    // Copy uploaded file over rundown.xlsx
    fs.copyFileSync(req.file.path, EXCEL_PATH);
    fs.unlinkSync(req.file.path); // remove temp file

    const ok = loadRundownFromExcel(EXCEL_PATH);
    if (ok) {
      broadcast({ type: 'RUNDOWN_UPDATED', rundown });
      res.json({ success: true, count: rundown.length, rundown });
    } else {
      res.status(400).json({ success: false, message: 'Format Excel tidak valid' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/show', (req, res) => {
  const data = req.body || {};
  let targetRundownId = data.currentRundownId || data.id || currentState.currentRundownId;
  if (!data.currentRundownId && !data.id && data.title) {
    const match = rundown.find(r => r.title === data.title);
    if (match) targetRundownId = match.id;
  }

  currentState = {
    ...currentState,
    template: 'efootball',
    ...data,
    currentRundownId: targetRundownId,
    visible: true,
    updatedAt: Date.now()
  };
  broadcast({ type: 'SHOW', state: currentState });
  res.json({ success: true, state: currentState });
});

app.post('/api/hide', (req, res) => {
  currentState.visible = false;
  currentState.updatedAt = Date.now();
  broadcast({ type: 'HIDE', state: currentState });
  res.json({ success: true, state: currentState });
});

app.post('/api/rundown/next', (req, res) => {
  const currentIndex = rundown.findIndex(r => r.id === currentState.currentRundownId);
  const nextIndex = (currentIndex + 1) % rundown.length;
  const nextItem = rundown[nextIndex];
  if (nextItem) {
    currentState = {
      ...currentState,
      currentRundownId: nextItem.id,
      title: nextItem.title,
      subtitle: nextItem.subtitle,
      tag: nextItem.tag,
      socialPlatform: nextItem.socialPlatform || 'youtube',
      socialHandle: nextItem.socialHandle || '',
      visible: true,
      updatedAt: Date.now()
    };
    broadcast({ type: 'SHOW', state: currentState });
  }
  res.json({ success: true, state: currentState });
});

app.post('/api/transition/in', (req, res) => {
  currentState.transitionActive = true;
  currentState.updatedAt = Date.now();
  broadcast({ type: 'TRANSITION', action: 'in', transitionActive: true });
  res.json({ success: true, transitionActive: true });
});

app.post('/api/transition/out', (req, res) => {
  currentState.transitionActive = false;
  currentState.updatedAt = Date.now();
  broadcast({ type: 'TRANSITION', action: 'out', transitionActive: false });
  res.json({ success: true, transitionActive: false });
});

app.post('/api/transition/toggle', (req, res) => {
  currentState.transitionActive = !currentState.transitionActive;
  currentState.updatedAt = Date.now();
  broadcast({
    type: 'TRANSITION',
    action: currentState.transitionActive ? 'in' : 'out',
    transitionActive: currentState.transitionActive
  });
  res.json({ success: true, transitionActive: currentState.transitionActive });
});

// Audio REST API (Wisuda Music / Songs)
app.get('/api/audio/list', (req, res) => {
  const audioDir = path.join(__dirname, 'public', 'audio');
  if (!fs.existsSync(audioDir)) {
    return res.json({ success: true, tracks: [] });
  }

  const validExts = ['.mp3', '.mpeg', '.aac', '.m4a', '.wav', '.ogg', '.mp4'];
  try {
    const files = fs.readdirSync(audioDir);
    const tracks = files
      .filter(file => validExts.includes(path.extname(file).toLowerCase()))
      .map(file => {
        const parsed = path.parse(file);
        const stats = fs.statSync(path.join(audioDir, file));
        return {
          key: parsed.name,
          filename: file,
          ext: parsed.ext,
          size: stats.size,
          url: `/audio/${file}?v=${Math.floor(stats.mtimeMs)}`
        };
      });

    res.json({ success: true, tracks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/audio/play', (req, res) => {
  const { song, title } = req.body || {};
  const songKey = song || 'indonesia_raya';
  const resolved = resolveAudioFile(songKey);
  currentAudio = {
    playing: true,
    song: songKey,
    title: title || song || 'Indonesia Raya',
    url: resolved ? resolved.url : `/audio/${songKey}.mp3`,
    startedAt: Date.now()
  };
  broadcast({ type: 'AUDIO_PLAY', audio: currentAudio });
  res.json({ success: true, audio: currentAudio });
});

app.post('/api/audio/stop', (req, res) => {
  currentAudio = {
    playing: false,
    song: null,
    title: '',
    url: '',
    startedAt: 0
  };
  broadcast({ type: 'AUDIO_STOP', audio: currentAudio });
  res.json({ success: true, audio: currentAudio });
});

app.post('/api/audio/upload', upload.single('audioFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file audio yang diunggah' });
  }
  const songKey = (req.body.song || 'lagu_bebas').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const ext = path.extname(req.file.originalname).toLowerCase() || '.mp3';

  const audioDir = path.join(__dirname, 'public', 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Hapus versi lama dengan key yang sama tapi ekstensi berbeda
  try {
    const files = fs.readdirSync(audioDir);
    for (const f of files) {
      const p = path.parse(f);
      if (p.name.toLowerCase() === songKey) {
        try { fs.unlinkSync(path.join(audioDir, f)); } catch (_) {}
      }
    }
  } catch (_) {}

  const targetPath = path.join(audioDir, `${songKey}${ext}`);
  try {
    fs.copyFileSync(req.file.path, targetPath);
    fs.unlinkSync(req.file.path);
    const resolved = resolveAudioFile(songKey);
    res.json({
      success: true,
      song: songKey,
      filename: `${songKey}${ext}`,
      url: resolved ? resolved.url : `/audio/${songKey}${ext}?v=${Date.now()}`,
      message: `File audio ${songKey}${ext} berhasil diperbarui!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Controller Routes (handles all aliases: /, /control, /control.html, /controller)
const sendIndex = (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
};
app.get('/', sendIndex);
app.get('/control', sendIndex);
app.get('/control.html', sendIndex);
app.get('/controller', sendIndex);

// Overlay Routes (handles /overlay and /overlay.html)
const sendOverlay = (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'overlay.html'));
};
app.get('/overlay', sendOverlay);
app.get('/overlay.html', sendOverlay);

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚽ eFOOTBALL LOWER THIRD CONTROLLER (EXCEL RUNDOWN)`);
  console.log(`📁  Excel Source      : ${EXCEL_PATH}`);
  console.log(`🎛️  Mobile Controller : http://localhost:${PORT}`);
  console.log(`🎥  OBS Overlay URL   : http://localhost:${PORT}/overlay`);
  console.log(`⚡  WebSocket Port    : ${PORT}`);
  console.log(`=======================================================`);
});
