/**
 * AlurCerita Studio — Database Layer (SQLite via native node:sqlite)
 * Provides persistent SQL storage for film projects, sources, and scripts.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const DB_PATH = path.join(__dirname, 'alurcerita.db');
const db = new DatabaseSync(DB_PATH);

// Initialize Tables and Performance Pragmas
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    director_year TEXT,
    release_year TEXT,
    director TEXT,
    synopsis TEXT,
    channel_name TEXT DEFAULT 'AAAlur Cerita',
    opening_hook TEXT DEFAULT 'Halo Nakama',
    outro_bridge TEXT DEFAULT 'Jadi, gak perlu cacicu lagi. langsung aja masuk ke alur ceritanya',
    persona_style TEXT DEFAULT 'teman_ngopi',
    include_analysis INTEGER DEFAULT 1,
    enforce_visual_cues INTEGER DEFAULT 1,
    script_markdown TEXT,
    word_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    greeting TEXT DEFAULT 'Halo Nakama',
    outro_bridge TEXT DEFAULT 'Jadi, gak perlu cacicu lagi. langsung aja masuk ke alur ceritanya',
    persona_style TEXT DEFAULT 'teman_ngopi',
    target_language TEXT DEFAULT 'id',
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS project_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    source_key TEXT NOT NULL,
    source_label TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(project_id, source_key)
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_value TEXT NOT NULL UNIQUE,
    label TEXT,
    is_active INTEGER DEFAULT 1,
    requests_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_used_at DATETIME,
    status TEXT DEFAULT 'active',
    cooldown_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tts_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    colab_url TEXT DEFAULT '',
    model TEXT DEFAULT 'kokoro',
    voice TEXT DEFAULT 'am_michael',
    speed REAL DEFAULT 1.0,
    is_connected INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  INSERT OR IGNORE INTO tts_settings (id, colab_url, model, voice, speed, is_connected)
  VALUES (1, '', 'kokoro', 'am_michael', 1.0, 0);

  CREATE TABLE IF NOT EXISTS project_audios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    model TEXT,
    voice TEXT,
    speed REAL,
    duration_seconds REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS personas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tone_prompt TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tts_voices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    voice_code TEXT NOT NULL,
    display_name TEXT NOT NULL,
    gender TEXT DEFAULT 'neutral',
    description TEXT,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model, voice_code)
  );

  CREATE TABLE IF NOT EXISTS prompt_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    prompt_content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    default_wpm INTEGER DEFAULT 140,
    max_hook_seconds INTEGER DEFAULT 30,
    default_gemini_model TEXT DEFAULT 'auto',
    default_language TEXT DEFAULT 'id',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  INSERT OR IGNORE INTO app_settings (id, default_wpm, max_hook_seconds, default_gemini_model, default_language)
  VALUES (1, 140, 30, 'auto', 'id');

  
  CREATE TABLE IF NOT EXISTS project_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER DEFAULT 0,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    file_size INTEGER DEFAULT 0,
    duration_seconds REAL DEFAULT 0,
    resolution TEXT DEFAULT '',
    mime_type TEXT DEFAULT '',
    file_url TEXT NOT NULL,
    tags TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audio_master_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    preset_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'alur_cerita',
    settings_json TEXT NOT NULL,
    is_system INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration for existing databases: ensure release_year & director columns exist
try {
  db.exec(`ALTER TABLE projects ADD COLUMN release_year TEXT`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE projects ADD COLUMN director TEXT`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE project_audios ADD COLUMN source_type TEXT DEFAULT 'tts'`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE project_audios ADD COLUMN original_filename TEXT`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE project_audios ADD COLUMN is_mastered INTEGER DEFAULT 0`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE project_audios ADD COLUMN preset_used TEXT`);
} catch (e) {}

// Extract and populate release_year and director for existing projects
try {
  const existingProjects = db.prepare(`SELECT id, title, director_year, release_year, director FROM projects`).all();
  for (const p of existingProjects) {
    if (!p.release_year) {
      let foundYear = null;
      let foundDirector = p.director || null;

      if (p.director_year) {
        const match = p.director_year.match(/\((\d{4})\)/) || p.director_year.match(/\b(19\d\d|20\d\d)\b/);
        if (match) {
          foundYear = match[1];
          if (!foundDirector) {
            foundDirector = p.director_year.replace(/\s*\(\d{4}\)\s*/, '').replace(/\b(19\d\d|20\d\d)\b/, '').trim();
          }
        } else if (!foundDirector) {
          foundDirector = p.director_year.trim();
        }
      }

      if (!foundYear && p.title) {
        const titleMatch = p.title.match(/\((\d{4})\)/) || p.title.match(/\b(19\d\d|20\d\d)\b/);
        if (titleMatch) {
          foundYear = titleMatch[1];
        }
      }

      if (foundYear || foundDirector) {
        db.prepare(`UPDATE projects SET release_year = ?, director = ? WHERE id = ?`).run(foundYear, foundDirector, p.id);
      }
    }
  }
} catch (e) {
  console.warn('Project migration warning:', e.message);
}

// Repository Methods
const ProjectRepo = {
  // List all projects with snippet info
  getAll() {
    const stmt = db.prepare(`
      SELECT 
        p.id, p.title, p.director_year, p.release_year, p.director, p.synopsis, p.channel_name,
        p.opening_hook, p.persona_style, p.word_count, p.created_at, p.updated_at,
        COUNT(s.id) as source_count
      FROM projects p
      LEFT JOIN project_sources s ON p.id = s.project_id
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `);
    return stmt.all();
  },

  // Get single project with all sources and full script
  getById(id) {
    const projectStmt = db.prepare(`SELECT * FROM projects WHERE id = ?`);
    const project = projectStmt.get(Number(id));
    if (!project) return null;

    const sourcesStmt = db.prepare(`
      SELECT source_key, source_label, content 
      FROM project_sources 
      WHERE project_id = ? 
      ORDER BY id ASC
    `);
    const sourcesRows = sourcesStmt.all(Number(id));

    const sources = {};
    sourcesRows.forEach(row => {
      sources[row.source_key] = row.content || '';
    });

    return {
      ...project,
      sources
    };
  },

  // Create a new project
  create(data) {
    const now = new Date().toISOString();
    const releaseYear = data.release_year !== undefined ? (data.release_year ? String(data.release_year).trim() : '') : '';
    const director = data.director !== undefined ? (data.director ? String(data.director).trim() : '') : '';
    const directorYear = data.director_year || (director && releaseYear ? `${director} (${releaseYear})` : (director || releaseYear || ''));

    const insertProject = db.prepare(`
      INSERT INTO projects (
        title, director_year, release_year, director, synopsis, channel_name, opening_hook,
        outro_bridge, persona_style, include_analysis, enforce_visual_cues,
        script_markdown, word_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertProject.run(
      data.title || 'Proyek Tanpa Judul',
      directorYear,
      releaseYear,
      director,
      data.synopsis || '',
      data.channel_name || 'AAAlur Cerita',
      data.opening_hook || 'Halo Nakama',
      data.outro_bridge || 'Jadi, gak perlu cacicu lagi. langsung aja masuk ke alur ceritanya',
      data.persona_style || 'teman_ngopi',
      data.include_analysis !== false ? 1 : 0,
      data.enforce_visual_cues !== false ? 1 : 0,
      data.script_markdown || '',
      data.word_count || 0,
      now,
      now
    );

    const projectId = Number(result.lastInsertRowid);

    // Insert sources if provided
    if (data.sources && typeof data.sources === 'object') {
      const insertSource = db.prepare(`
        INSERT INTO project_sources (project_id, source_key, source_label, content)
        VALUES (?, ?, ?, ?)
      `);

      for (const [key, text] of Object.entries(data.sources)) {
        insertSource.run(projectId, key, `Sumber ${key}`, text || '');
      }
    }

    return this.getById(projectId);
  },

  // Update an existing project
  update(id, data) {
    const now = new Date().toISOString();
    const releaseYear = data.release_year !== undefined ? (data.release_year ? String(data.release_year).trim() : null) : undefined;
    const director = data.director !== undefined ? (data.director ? String(data.director).trim() : null) : undefined;

    let computedDirectorYear = data.director_year;
    if (computedDirectorYear === undefined && (releaseYear !== undefined || director !== undefined)) {
      const curr = this.getById(id);
      const effectiveDirector = director !== undefined ? director : curr.director;
      const effectiveYear = releaseYear !== undefined ? releaseYear : curr.release_year;
      computedDirectorYear = effectiveDirector && effectiveYear ? `${effectiveDirector} (${effectiveYear})` : (effectiveDirector || effectiveYear || '');
    }

    const updateStmt = db.prepare(`
      UPDATE projects SET
        title = COALESCE(?, title),
        director_year = COALESCE(?, director_year),
        release_year = COALESCE(?, release_year),
        director = COALESCE(?, director),
        synopsis = COALESCE(?, synopsis),
        channel_name = COALESCE(?, channel_name),
        opening_hook = COALESCE(?, opening_hook),
        outro_bridge = COALESCE(?, outro_bridge),
        persona_style = COALESCE(?, persona_style),
        include_analysis = COALESCE(?, include_analysis),
        enforce_visual_cues = COALESCE(?, enforce_visual_cues),
        script_markdown = COALESCE(?, script_markdown),
        word_count = COALESCE(?, word_count),
        updated_at = ?
      WHERE id = ?
    `);

    updateStmt.run(
      data.title !== undefined ? data.title : null,
      computedDirectorYear !== undefined ? computedDirectorYear : null,
      releaseYear !== undefined ? releaseYear : null,
      director !== undefined ? director : null,
      data.synopsis !== undefined ? data.synopsis : null,
      data.channel_name !== undefined ? data.channel_name : null,
      data.opening_hook !== undefined ? data.opening_hook : null,
      data.outro_bridge !== undefined ? data.outro_bridge : null,
      data.persona_style !== undefined ? data.persona_style : null,
      data.include_analysis !== undefined ? (data.include_analysis ? 1 : 0) : null,
      data.enforce_visual_cues !== undefined ? (data.enforce_visual_cues ? 1 : 0) : null,
      data.script_markdown !== undefined ? data.script_markdown : null,
      data.word_count !== undefined ? data.word_count : null,
      now,
      Number(id)
    );

    // Update sources if provided
    if (data.sources && typeof data.sources === 'object') {
      const upsertSource = db.prepare(`
        INSERT INTO project_sources (project_id, source_key, source_label, content)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(project_id, source_key) DO UPDATE SET
          content = excluded.content
      `);

      for (const [key, text] of Object.entries(data.sources)) {
        upsertSource.run(Number(id), key, `Sumber ${key}`, text || '');
      }
    }

    return this.getById(id);
  },

  // Delete project
  delete(id) {
    const stmt = db.prepare(`DELETE FROM projects WHERE id = ?`);
    const result = stmt.run(Number(id));
    return result.changes > 0;
  },

  // Clone / duplicate project
  clone(id) {
    const original = this.getById(id);
    if (!original) return null;

    const clonedTitle = `${original.title} (Salinan)`;
    return this.create({
      title: clonedTitle,
      release_year: original.release_year,
      director: original.director,
      director_year: original.director_year,
      synopsis: original.synopsis,
      channel_name: original.channel_name,
      opening_hook: original.opening_hook,
      outro_bridge: original.outro_bridge,
      persona_style: original.persona_style,
      include_analysis: original.include_analysis,
      enforce_visual_cues: original.enforce_visual_cues,
      script_markdown: original.script_markdown,
      word_count: original.word_count,
      sources: original.sources || {}
    });
  }
};

// Repository for Smart Round-Robin API Keys
const ApiKeyRepo = {
  // Get all keys with masked values for the UI
  getAll() {
    const stmt = db.prepare(`
      SELECT 
        id, label, is_active, requests_count, error_count,
        last_used_at, status, cooldown_until, created_at,
        CASE 
          WHEN LENGTH(key_value) > 10 THEN SUBSTR(key_value, 1, 8) || '...' || SUBSTR(key_value, -4)
          ELSE '***'
        END as masked_key
      FROM api_keys
      ORDER BY id ASC
    `);
    const rows = stmt.all();
    const now = Date.now();
    return rows.map(k => {
      let effectiveStatus = k.status;
      if (k.cooldown_until && new Date(k.cooldown_until).getTime() <= now && k.status === 'cooldown') {
        effectiveStatus = 'active';
      }
      return {
        ...k,
        status: effectiveStatus
      };
    });
  },

  // Get active keys with actual key_value for API requests
  getActiveKeys() {
    const stmt = db.prepare(`
      SELECT 
        id, key_value, label, is_active, requests_count, error_count,
        last_used_at, status, cooldown_until, created_at,
        CASE 
          WHEN LENGTH(key_value) > 10 THEN SUBSTR(key_value, 1, 8) || '...' || SUBSTR(key_value, -4)
          ELSE '***'
        END as masked_key
      FROM api_keys 
      WHERE is_active = 1 AND status != 'invalid'
      ORDER BY COALESCE(last_used_at, '1970-01-01') ASC, id ASC
    `);
    const rows = stmt.all();
    const now = Date.now();
    return rows.map(k => {
      let isCooldown = false;
      if (k.cooldown_until && new Date(k.cooldown_until).getTime() > now) {
        isCooldown = true;
      }
      return {
        ...k,
        isCooldown
      };
    });
  },

  // Smart round robin:
  // Picks the active key that is NOT in cooldown and has the oldest last_used_at
  getNextSmartKey(excludeIds = []) {
    const keys = this.getActiveKeys();
    if (keys.length === 0) return null;

    const candidates = keys.filter(k => !excludeIds.includes(k.id));
    if (candidates.length === 0) return null;

    const available = candidates.filter(k => !k.isCooldown);
    if (available.length > 0) {
      return available[0];
    }

    // If all available keys are in cooldown, pick the one that cools down earliest
    candidates.sort((a, b) => new Date(a.cooldown_until || 0).getTime() - new Date(b.cooldown_until || 0).getTime());
    return candidates[0];
  },

  // Add one or multiple keys (split by newline or comma)
  addKeys(rawText, defaultLabel = 'Gemini Key') {
    if (!rawText || typeof rawText !== 'string') return { addedCount: 0 };
    const keys = rawText
      .split(/[\r\n,]+/)
      .map(k => k.trim())
      .filter(k => k.length >= 15);

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO api_keys (key_value, label, status)
      VALUES (?, ?, 'active')
    `);

    let addedCount = 0;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const countStmt = db.prepare(`SELECT COUNT(*) as count FROM api_keys`);
      const totalNow = countStmt.get().count;
      const label = keys.length === 1 && defaultLabel ? defaultLabel : `Gemini Key #${totalNow + 1}`;
      const res = insertStmt.run(key, label);
      if (res.changes > 0) addedCount++;
    }
    return { totalSubmitted: keys.length, addedCount };
  },

  // Toggle key active/inactive
  toggleActive(id, isActive) {
    const stmt = db.prepare(`UPDATE api_keys SET is_active = ? WHERE id = ?`);
    stmt.run(isActive ? 1 : 0, Number(id));
    return this.getById(id);
  },

  // Delete key
  delete(id) {
    const stmt = db.prepare(`DELETE FROM api_keys WHERE id = ?`);
    const res = stmt.run(Number(id));
    return res.changes > 0;
  },

  // Record usage metrics & cooldown
  recordUsage(id, success, errorObj = null) {
    const now = new Date().toISOString();
    if (success) {
      const stmt = db.prepare(`
        UPDATE api_keys SET 
          requests_count = requests_count + 1,
          last_used_at = ?,
          status = 'active',
          cooldown_until = NULL
        WHERE id = ?
      `);
      stmt.run(now, Number(id));
    } else {
      const errStr = String(errorObj || '').toLowerCase();
      let status = 'error';
      let cooldown = null;

      if (errStr.includes('429') || errStr.includes('resource_exhausted') || errStr.includes('quota') || errStr.includes('rate limit')) {
        status = 'cooldown';
        // Cooldown for 60 seconds
        cooldown = new Date(Date.now() + 60 * 1000).toISOString();
      } else if (errStr.includes('invalid') || errStr.includes('api_key_invalid') || errStr.includes('unauthenticated') || errStr.includes('403') || errStr.includes('400')) {
        status = 'invalid';
      }

      const stmt = db.prepare(`
        UPDATE api_keys SET 
          error_count = error_count + 1,
          last_used_at = ?,
          status = ?,
          cooldown_until = ?
        WHERE id = ?
      `);
      stmt.run(now, status, cooldown, Number(id));
    }
  },

  getById(id) {
    const stmt = db.prepare(`
      SELECT 
        id, label, is_active, requests_count, error_count,
        last_used_at, status, cooldown_until, created_at,
        CASE 
          WHEN LENGTH(key_value) > 10 THEN SUBSTR(key_value, 1, 8) || '...' || SUBSTR(key_value, -4)
          ELSE '***'
        END as masked_key
      FROM api_keys
      WHERE id = ?
    `);
    return stmt.get(Number(id));
  },

  getKeyWithSecret(id) {
    const stmt = db.prepare(`SELECT * FROM api_keys WHERE id = ?`);
    return stmt.get(Number(id));
  },

  countActive() {
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM api_keys WHERE is_active = 1`);
    return stmt.get().count;
  },

  update(id, data) {
    const stmt = db.prepare(`
      UPDATE api_keys SET
        label = COALESCE(?, label),
        is_active = COALESCE(?, is_active),
        status = COALESCE(?, status)
      WHERE id = ?
    `);
    stmt.run(
      data.label !== undefined ? data.label : null,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : null,
      data.status !== undefined ? data.status : null,
      Number(id)
    );
    return this.getById(id);
  },

  resetStatus(id) {
    const stmt = db.prepare(`
      UPDATE api_keys SET
        status = 'active',
        cooldown_until = NULL,
        error_count = 0
      WHERE id = ?
    `);
    stmt.run(Number(id));
    return this.getById(id);
  }
};

// Repository for TTS & Google Colab Bridge
const TtsRepo = {
  getSettings() {
    const stmt = db.prepare(`SELECT * FROM tts_settings WHERE id = 1`);
    return stmt.get() || { id: 1, colab_url: '', model: 'kokoro', voice: 'am_michael', speed: 1.0, is_connected: 0 };
  },

  updateSettings(data) {
    const stmt = db.prepare(`
      UPDATE tts_settings SET
        colab_url = COALESCE(?, colab_url),
        model = COALESCE(?, model),
        voice = COALESCE(?, voice),
        speed = COALESCE(?, speed),
        is_connected = COALESCE(?, is_connected),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);
    stmt.run(
      data.colab_url !== undefined ? data.colab_url : null,
      data.model !== undefined ? data.model : null,
      data.voice !== undefined ? data.voice : null,
      data.speed !== undefined ? Number(data.speed) : null,
      data.is_connected !== undefined ? (data.is_connected ? 1 : 0) : null
    );
    return this.getSettings();
  },

  addAudio(projectId, filename, model, voice, speed, durationSeconds = 0) {
    const stmt = db.prepare(`
      INSERT INTO project_audios (project_id, filename, model, voice, speed, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(Number(projectId), filename, model, voice, Number(speed), Number(durationSeconds));
    return Number(res.lastInsertRowid);
  },

  getAudiosByProject(projectId) {
    const stmt = db.prepare(`
      SELECT * FROM project_audios 
      WHERE project_id = ? 
      ORDER BY id DESC
    `);
    return stmt.all(Number(projectId));
  }
};

// Repository for Project Audio Files (Voiceover TTS, Mic Recording, Uploads, & Mastered)
const AudioRecordingRepo = {
  add(data) {
    const stmt = db.prepare(`
      INSERT INTO project_audios (project_id, filename, model, voice, speed, duration_seconds, source_type, original_filename, is_mastered, preset_used)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      Number(data.project_id || 0),
      data.filename,
      data.model || null,
      data.voice || null,
      data.speed ? Number(data.speed) : 1.0,
      data.duration_seconds ? Number(data.duration_seconds) : 0,
      data.source_type || 'tts',
      data.original_filename || null,
      data.is_mastered ? 1 : 0,
      data.preset_used || null
    );
    return Number(res.lastInsertRowid);
  },
  getByProject(projectId) {
    const stmt = db.prepare(`
      SELECT * FROM project_audios 
      WHERE project_id = ? 
      ORDER BY id DESC
    `);
    return stmt.all(Number(projectId));
  },
  getById(id) {
    const stmt = db.prepare(`SELECT * FROM project_audios WHERE id = ?`);
    return stmt.get(Number(id));
  },
  delete(id) {
    const stmt = db.prepare(`DELETE FROM project_audios WHERE id = ?`);
    stmt.run(Number(id));
    return true;
  }
};

const DEFAULT_AUDIO_PRESETS = [
  {
    preset_key: 'youtube_recap',
    name: 'YouTube Recap Gold',
    description: 'Standar emas alur cerita YouTube. Artikulasi vokal renyah, dynamic punchy, low-end rapi, dan high air kemilau.',
    category: 'alur_cerita',
    settings_json: JSON.stringify({
      highPass: { enabled: true, frequency: 85 },
      noiseGate: { enabled: true, threshold: -48, attack: 0.010, release: 0.120 },
      deEsser: { enabled: true, frequency: 6200, threshold: -22, amount: -6.0 },
      eq: {
        enabled: true,
        lowShelfFreq: 160,
        lowShelfGain: 1.5,
        midDipFreq: 450,
        midDipGain: -2.5,
        midDipQ: 1.4,
        presenceFreq: 3400,
        presenceGain: 3.0,
        presenceQ: 1.2,
        highShelfFreq: 11000,
        highShelfGain: 2.5
      },
      compressor: {
        enabled: true,
        threshold: -18,
        ratio: 3.5,
        attack: 0.015,
        release: 0.100,
        knee: 6,
        makeupGain: 4.0
      },
      saturation: { enabled: true, warmth: 25 },
      limiter: { enabled: true, ceiling: -1.0, targetLufs: -14 },
      ducking: { enabled: true, duckDb: -14, attack: 0.10, release: 0.45 }
    })
  },
  {
    preset_key: 'deep_cinema',
    name: 'Deep Cinema Radiophonic',
    description: 'Karakter suara narator film bioskop berat. Proximity effect berwibawa, nada bass tebal dan hangat ala radio klasik.',
    category: 'alur_cerita',
    settings_json: JSON.stringify({
      highPass: { enabled: true, frequency: 65 },
      noiseGate: { enabled: true, threshold: -52, attack: 0.015, release: 0.150 },
      deEsser: { enabled: true, frequency: 5800, threshold: -20, amount: -5.0 },
      eq: {
        enabled: true,
        lowShelfFreq: 140,
        lowShelfGain: 3.5,
        midDipFreq: 600,
        midDipGain: -3.0,
        midDipQ: 1.2,
        presenceFreq: 2800,
        presenceGain: 1.8,
        presenceQ: 1.0,
        highShelfFreq: 9000,
        highShelfGain: 1.0
      },
      compressor: {
        enabled: true,
        threshold: -22,
        ratio: 4.0,
        attack: 0.025,
        release: 0.160,
        knee: 8,
        makeupGain: 5.0
      },
      saturation: { enabled: true, warmth: 40 },
      limiter: { enabled: true, ceiling: -1.0, targetLufs: -14 },
      ducking: { enabled: true, duckDb: -15, attack: 0.10, release: 0.50 }
    })
  },
  {
    preset_key: 'crisp_female',
    name: 'Crisp Female Clarifier',
    description: 'Optimal untuk narator wanita / vokal nada tinggi. Menjinakkan desis sibilance (S/T/C) dan memunculkan kejelasan kata.',
    category: 'alur_cerita',
    settings_json: JSON.stringify({
      highPass: { enabled: true, frequency: 100 },
      noiseGate: { enabled: true, threshold: -46, attack: 0.008, release: 0.100 },
      deEsser: { enabled: true, frequency: 6800, threshold: -24, amount: -8.0 },
      eq: {
        enabled: true,
        lowShelfFreq: 220,
        lowShelfGain: -1.0,
        midDipFreq: 800,
        midDipGain: -2.0,
        midDipQ: 1.5,
        presenceFreq: 3800,
        presenceGain: 3.5,
        presenceQ: 1.3,
        highShelfFreq: 12000,
        highShelfGain: 3.0
      },
      compressor: {
        enabled: true,
        threshold: -16,
        ratio: 3.0,
        attack: 0.012,
        release: 0.090,
        knee: 5,
        makeupGain: 3.5
      },
      saturation: { enabled: true, warmth: 15 },
      limiter: { enabled: true, ceiling: -1.0, targetLufs: -14 },
      ducking: { enabled: true, duckDb: -13, attack: 0.08, release: 0.40 }
    })
  },
  {
    preset_key: 'dramatic_trailer',
    name: 'Dramatic Trailer Voice',
    description: 'Suara trailer Hollywood super tegas & agresif. Kompresi padat dan saturasi tebal agar vokal menembus musik aksi keras.',
    category: 'alur_cerita',
    settings_json: JSON.stringify({
      highPass: { enabled: true, frequency: 75 },
      noiseGate: { enabled: true, threshold: -45, attack: 0.006, release: 0.080 },
      deEsser: { enabled: true, frequency: 6000, threshold: -22, amount: -7.0 },
      eq: {
        enabled: true,
        lowShelfFreq: 150,
        lowShelfGain: 3.0,
        midDipFreq: 500,
        midDipGain: -3.5,
        midDipQ: 1.6,
        presenceFreq: 3200,
        presenceGain: 4.5,
        presenceQ: 1.5,
        highShelfFreq: 10000,
        highShelfGain: 3.0
      },
      compressor: {
        enabled: true,
        threshold: -24,
        ratio: 5.5,
        attack: 0.008,
        release: 0.080,
        knee: 4,
        makeupGain: 6.5
      },
      saturation: { enabled: true, warmth: 45 },
      limiter: { enabled: true, ceiling: -0.5, targetLufs: -13 },
      ducking: { enabled: true, duckDb: -16, attack: 0.06, release: 0.40 }
    })
  },
  {
    preset_key: 'tts_healer',
    name: 'TTS Voice Healer',
    description: 'Penyembuh audio AI/TTS. Menghilangkan bunyi sengau sintetis & desis logam, memberi kehangatan analog agar vokal terasa organik.',
    category: 'alur_cerita',
    settings_json: JSON.stringify({
      highPass: { enabled: true, frequency: 90 },
      noiseGate: { enabled: true, threshold: -55, attack: 0.015, release: 0.150 },
      deEsser: { enabled: true, frequency: 6400, threshold: -26, amount: -9.0 },
      eq: {
        enabled: true,
        lowShelfFreq: 200,
        lowShelfGain: 2.5,
        midDipFreq: 2500,
        midDipGain: -3.0,
        midDipQ: 2.0,
        presenceFreq: 4000,
        presenceGain: 1.2,
        presenceQ: 1.0,
        highShelfFreq: 8500,
        highShelfGain: -2.0
      },
      compressor: {
        enabled: true,
        threshold: -19,
        ratio: 3.2,
        attack: 0.020,
        release: 0.140,
        knee: 6,
        makeupGain: 3.0
      },
      saturation: { enabled: true, warmth: 35 },
      limiter: { enabled: true, ceiling: -1.0, targetLufs: -14 },
      ducking: { enabled: true, duckDb: -14, attack: 0.10, release: 0.45 }
    })
  },
  {
    preset_key: 'asmr_whisper',
    name: 'ASMR Intimate Whisper',
    description: 'Vokal bisikan dekat mic yang sangat intim, hangat, dan lembut. Cocok untuk cerita horor, misteri, atau adegan emosional.',
    category: 'alur_cerita',
    settings_json: JSON.stringify({
      highPass: { enabled: true, frequency: 70 },
      noiseGate: { enabled: true, threshold: -58, attack: 0.020, release: 0.200 },
      deEsser: { enabled: true, frequency: 7000, threshold: -20, amount: -4.0 },
      eq: {
        enabled: true,
        lowShelfFreq: 120,
        lowShelfGain: 2.0,
        midDipFreq: 700,
        midDipGain: -1.5,
        midDipQ: 1.0,
        presenceFreq: 4500,
        presenceGain: 2.5,
        presenceQ: 1.2,
        highShelfFreq: 13000,
        highShelfGain: 4.5
      },
      compressor: {
        enabled: true,
        threshold: -26,
        ratio: 2.5,
        attack: 0.030,
        release: 0.220,
        knee: 10,
        makeupGain: 7.0
      },
      saturation: { enabled: true, warmth: 20 },
      limiter: { enabled: true, ceiling: -1.5, targetLufs: -16 },
      ducking: { enabled: true, duckDb: -16, attack: 0.12, release: 0.55 }
    })
  }
];

// Repository for Audio Mixing & Mastering Presets (SQLite CRUD)
const AudioPresetRepo = {
  getAll() {
    const stmt = db.prepare(`SELECT * FROM audio_master_presets ORDER BY is_system DESC, id ASC`);
    return stmt.all();
  },
  getByKey(key) {
    const stmt = db.prepare(`SELECT * FROM audio_master_presets WHERE preset_key = ?`);
    return stmt.get(key);
  },
  getById(id) {
    const stmt = db.prepare(`SELECT * FROM audio_master_presets WHERE id = ?`);
    return stmt.get(Number(id));
  },
  create(data) {
    const key = data.preset_key || `custom_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO audio_master_presets (preset_key, name, description, category, settings_json, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const res = stmt.run(
      key,
      data.name.trim(),
      data.description ? data.description.trim() : null,
      data.category || 'custom',
      typeof data.settings_json === 'string' ? data.settings_json : JSON.stringify(data.settings_json)
    );
    return Number(res.lastInsertRowid);
  },
  update(id, data) {
    const stmt = db.prepare(`
      UPDATE audio_master_presets
      SET name = ?, description = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      data.name.trim(),
      data.description ? data.description.trim() : null,
      typeof data.settings_json === 'string' ? data.settings_json : JSON.stringify(data.settings_json),
      Number(id)
    );
    return this.getById(id);
  },
  delete(id) {
    const item = this.getById(id);
    if (!item) return false;
    if (item.is_system) {
      throw new Error('Preset bawaan sistem tidak boleh dihapus.');
    }
    db.prepare(`DELETE FROM audio_master_presets WHERE id = ?`).run(Number(id));
    return true;
  },
  resetDefaults() {
    DEFAULT_AUDIO_PRESETS.forEach(p => {
      const existing = db.prepare(`SELECT id FROM audio_master_presets WHERE preset_key = ?`).get(p.preset_key);
      if (!existing) {
        db.prepare(`
          INSERT INTO audio_master_presets (preset_key, name, description, category, settings_json, is_system, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(p.preset_key, p.name, p.description, p.category, p.settings_json);
      }
    });
  }
};

// Repository for YouTube / Social Media Channels Management
const ChannelRepo = {
  getAll() {
    const stmt = db.prepare(`SELECT * FROM channels ORDER BY is_default DESC, name ASC`);
    return stmt.all();
  },
  getById(id) {
    const stmt = db.prepare(`SELECT * FROM channels WHERE id = ?`);
    return stmt.get(Number(id));
  },
  create(data) {
    const now = new Date().toISOString();
    const isDefault = data.is_default ? 1 : 0;
    if (isDefault) {
      db.prepare(`UPDATE channels SET is_default = 0`).run();
    }
    const stmt = db.prepare(`
      INSERT INTO channels (name, greeting, outro_bridge, persona_style, target_language, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      data.name.trim(),
      data.greeting || 'Halo Nakama',
      data.outro_bridge || 'Jadi, gak perlu cacicu lagi. langsung aja masuk ke alur ceritanya',
      data.persona_style || 'teman_ngopi',
      data.target_language || 'id',
      isDefault,
      now,
      now
    );
    return this.getById(res.lastInsertRowid);
  },
  update(id, data) {
    const now = new Date().toISOString();
    if (data.is_default) {
      db.prepare(`UPDATE channels SET is_default = 0`).run();
    }
    const stmt = db.prepare(`
      UPDATE channels SET
        name = COALESCE(?, name),
        greeting = COALESCE(?, greeting),
        outro_bridge = COALESCE(?, outro_bridge),
        persona_style = COALESCE(?, persona_style),
        target_language = COALESCE(?, target_language),
        is_default = COALESCE(?, is_default),
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      data.name !== undefined ? data.name.trim() : null,
      data.greeting !== undefined ? data.greeting : null,
      data.outro_bridge !== undefined ? data.outro_bridge : null,
      data.persona_style !== undefined ? data.persona_style : null,
      data.target_language !== undefined ? data.target_language : null,
      data.is_default !== undefined ? (data.is_default ? 1 : 0) : null,
      now,
      Number(id)
    );
    return this.getById(id);
  },
  delete(id) {
    const count = db.prepare(`SELECT COUNT(*) as count FROM channels`).get().count;
    if (count <= 1) {
      throw new Error('Tidak bisa menghapus satu-satunya profil channel tersisa.');
    }
    const stmt = db.prepare(`DELETE FROM channels WHERE id = ?`);
    const res = stmt.run(Number(id));
    return res.changes > 0;
  },
  setDefault(id) {
    db.prepare(`UPDATE channels SET is_default = 0`).run();
    db.prepare(`UPDATE channels SET is_default = 1 WHERE id = ?`).run(Number(id));
    return this.getById(id);
  }
};

// Repository for Persona & Gaya Tutur Scriptwriting
const PersonaRepo = {
  getAll() {
    const stmt = db.prepare(`SELECT * FROM personas ORDER BY is_default DESC, id ASC`);
    return stmt.all();
  },
  getById(id) {
    const stmt = db.prepare(`SELECT * FROM personas WHERE id = ?`);
    return stmt.get(Number(id));
  },
  getByKey(key) {
    if (!key) return null;
    const stmt = db.prepare(`SELECT * FROM personas WHERE key = ?`);
    return stmt.get(String(key));
  },
  create(data) {
    const now = new Date().toISOString();
    const isDefault = data.is_default ? 1 : 0;
    if (isDefault) {
      db.prepare(`UPDATE personas SET is_default = 0`).run();
    }
    const safeKey = (data.key || data.name).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const stmt = db.prepare(`
      INSERT INTO personas (key, name, description, tone_prompt, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      safeKey,
      data.name.trim(),
      data.description || '',
      data.tone_prompt.trim(),
      isDefault,
      now,
      now
    );
    return this.getById(res.lastInsertRowid);
  },
  update(id, data) {
    const now = new Date().toISOString();
    if (data.is_default) {
      db.prepare(`UPDATE personas SET is_default = 0`).run();
    }
    const stmt = db.prepare(`
      UPDATE personas SET
        key = COALESCE(?, key),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        tone_prompt = COALESCE(?, tone_prompt),
        is_default = COALESCE(?, is_default),
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      data.key ? data.key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') : null,
      data.name ? data.name.trim() : null,
      data.description !== undefined ? data.description : null,
      data.tone_prompt ? data.tone_prompt.trim() : null,
      data.is_default !== undefined ? (data.is_default ? 1 : 0) : null,
      now,
      Number(id)
    );
    return this.getById(id);
  },
  delete(id) {
    const count = db.prepare(`SELECT COUNT(*) as count FROM personas`).get().count;
    if (count <= 1) {
      throw new Error('Minimal harus ada 1 persona gaya tutur di database.');
    }
    const stmt = db.prepare(`DELETE FROM personas WHERE id = ?`);
    const res = stmt.run(Number(id));
    return res.changes > 0;
  },
  setDefault(id) {
    db.prepare(`UPDATE personas SET is_default = 0`).run();
    db.prepare(`UPDATE personas SET is_default = 1 WHERE id = ?`).run(Number(id));
    return this.getById(id);
  }
};

// Repository for TTS Voices & Character Presets
const TtsVoiceRepo = {
  getAll(model = null) {
    if (model) {
      const stmt = db.prepare(`SELECT * FROM tts_voices WHERE model = ? ORDER BY is_default DESC, id ASC`);
      return stmt.all(model);
    }
    const stmt = db.prepare(`SELECT * FROM tts_voices ORDER BY model ASC, is_default DESC, id ASC`);
    return stmt.all();
  },
  getById(id) {
    const stmt = db.prepare(`SELECT * FROM tts_voices WHERE id = ?`);
    return stmt.get(Number(id));
  },
  create(data) {
    const now = new Date().toISOString();
    const isDefault = data.is_default ? 1 : 0;
    if (isDefault) {
      db.prepare(`UPDATE tts_voices SET is_default = 0 WHERE model = ?`).run(data.model);
    }
    const stmt = db.prepare(`
      INSERT INTO tts_voices (model, voice_code, display_name, gender, description, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      data.model.trim().toLowerCase(),
      data.voice_code.trim(),
      data.display_name.trim(),
      data.gender || 'neutral',
      data.description || '',
      isDefault,
      now,
      now
    );
    return this.getById(res.lastInsertRowid);
  },
  update(id, data) {
    const now = new Date().toISOString();
    const curr = this.getById(id);
    if (!curr) return null;
    if (data.is_default) {
      db.prepare(`UPDATE tts_voices SET is_default = 0 WHERE model = ?`).run(curr.model);
    }
    const stmt = db.prepare(`
      UPDATE tts_voices SET
        model = COALESCE(?, model),
        voice_code = COALESCE(?, voice_code),
        display_name = COALESCE(?, display_name),
        gender = COALESCE(?, gender),
        description = COALESCE(?, description),
        is_default = COALESCE(?, is_default),
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      data.model ? data.model.trim().toLowerCase() : null,
      data.voice_code ? data.voice_code.trim() : null,
      data.display_name ? data.display_name.trim() : null,
      data.gender !== undefined ? data.gender : null,
      data.description !== undefined ? data.description : null,
      data.is_default !== undefined ? (data.is_default ? 1 : 0) : null,
      now,
      Number(id)
    );
    return this.getById(id);
  },
  delete(id) {
    const stmt = db.prepare(`DELETE FROM tts_voices WHERE id = ?`);
    const res = stmt.run(Number(id));
    return res.changes > 0;
  },
  setDefault(id) {
    const curr = this.getById(id);
    if (!curr) return null;
    db.prepare(`UPDATE tts_voices SET is_default = 0 WHERE model = ?`).run(curr.model);
    db.prepare(`UPDATE tts_voices SET is_default = 1 WHERE id = ?`).run(Number(id));
    return this.getById(id);
  }
};

// Repository for AI Prompt Templates (Stage 1, Stage 2, Stage 3, Transcreation)
const DEFAULT_PROMPT_TEMPLATES = {
  stage1_story: {
    name: 'Tahap 1: Lead Scriptwriter Agent',
    description: 'Menyusun alur cerita 3-babak yang mengalir, visual cue arahan editor, hook pembuka maksimal 30 detik, dan DILARANG spoiler di awal.',
    prompt_content: `Anda adalah Lead Scriptwriter profesional untuk channel YouTube alur cerita film "{{channelName}}".
Tugas Anda adalah menulis naskah alur cerita lengkap, detail, dan mendalam berdasarkan referensi transkrip film yang diberikan.

PANDUAN & ATURAN UTAMA:
1. INFORMASI FILM:
   - Judul: {{movieTitle}}
   - Tahun Rilis: {{releaseYear}}
   - Sutradara: {{movieDirector}}
   - Sinopsis: {{synopsis}}

2. HOOK & OPENING (MAKSIMAL 30 DETIK / ~60-70 KATA):
   - Wajib buka dengan sapaan khas: "{{openingHook}}".
   - Hook harus memancing rasa penasaran penonton dalam 30 detik pertama tanpa bertele-tele.
   - Akhiri opening dengan kalimat jembatan: "{{outroBridge}}".

3. ATURAN KERAS: DILARANG SPOILER DI AWAL / HOOK / PART AWAL (ANTI-SPOILER):
   - DILARANG KERAS membocorkan plot twist, akhir cerita, pengkhianatan, atau rahasia karakter di HOOK/OPENING maupun di PART-PART AWAL cerita!
   - DILARANG menggunakan gaya narasi pembocor masa depan ("foreshadowing spoiler"), seperti contoh terlarang ini:
     * DILARANG: "Tapi nanti kita tahu nih kalau dia ini sebenarnya banyak bohongnya / jahat..."
     * DILARANG: "Yang nantinya bakal mati terbunuh..."
     * DILARANG: "Siapa sangka sosok ramah ini ternyata adalah dalang pembunuhan..."
     * DILARANG: "Tanpa disadari ini adalah akhir perjalanan hidupnya..."
   - Ceritakan secara KRONOLOGIS MURNI (Linear Storytelling):
     * Biarkan penonton melihat dan merasakan peristiwa bersama sang tokoh secara bertahap (in the moment).
     * Jika seorang karakter berbohong atau menyembunyikan identitasnya, perlakukan dia sesuai apa yang tampak di adegan tersebut. Rahasia atau kejahatannya HANYA BOLEH diungkapkan ketika adegan film itu sendiri telah sampai di momen pengungkapan (the reveal moment).
     * Bagian Opening (Hook 30 detik) HANYA boleh menyorot premis awal, tensi pembuka, dan pertanyaan pemancing rasa penasaran, BUKAN membocorkan nasib atau twist film.

4. GAYA TUTUR & PERSONA:
{{personaPrompt}}

5. ARAHAN VISUAL (B-ROLL CUES):
   - Wajib sertakan arahan visual untuk editor video dalam format tag kurung: (Visual: Deskripsi adegan, ekspresi tokoh, atau b-roll)
   - Berikan arahan visual di awal adegan penting.

6. STRUKTUR NASKAH:
   ## [OPENING]
   (Visual: Pembuka film)
   ... teks opening maksimal 30 detik (bebas spoiler) ...

   ## [BODY STORY]
   ### PART 1: ...
   (Visual: ...)
   ...
   ### PART 2: ...
   (Visual: ...)
   ...
   ### PART 3: ...
   (Visual: ...)
   ...

   ## [KESIMPULAN & CLOSING]
   (Visual: Outro penutup)
   ... ajakan like, komentar, dan subscribe ke channel {{channelName}} ...`
  },
  stage2_analysis: {
    name: 'Tahap 2: Film Analyst Agent',
    description: 'Membedah makna filosofis, hikmah moral, dan perkembangan karakter film.',
    prompt_content: `Anda adalah Storyteller & Analis Film untuk channel "{{channelName}}".
Aturan Utama:
1. DILARANG keras pakai salam pembuka atau kata "Halo". Langsung masuk ke pokok pembahasan analisis.
2. DILARANG pakai istilah asing klise seperti "Chef’s kiss", "Stakes", "Arc", atau "Vibe". Pakai bahasa Indonesia sehari-hari yang mudah dipahami penonton umum.
3. Transisi antar paragraf harus mengalir mulus ("Ngomong-ngomong soal itu...", "Bukan cuma itu...", "Nah, yang menariknya...").
4. Persona: Santai, kritis, pakai kata "Gua-Lu", panggil audiens dengan "{{openingHook}}".

Struktur yang wajib dihasilkan:
## [BEDAH ANALISIS & PESAN FILM]
### 1. KENAPA FILM INI SERU BANGET?
(Jelaskan genre, tensi, dan kenapa orang awam bakal betah nonton dari awal sampai akhir)

### 2. BEDAH RENCANA & PESAN MORAL FILM
(Bahas apakah masalah dari awal terjawab di akhir. Apakah ada hikmah atau pesan mendalam soal kehidupan/keadilan)

### 3. ANALISIS SIFAT & PERKEMBANGAN KARAKTER
(Jelaskan motivasi dan kerapuhan tokoh utama, serta bagaimana sifat mereka bertransformasi sepanjang film)`
  },
  stage3_synthesis: {
    name: 'Tahap 3: Synthesizer & Quality Agent',
    description: 'Menggabungkan narasi cerita dan bedah analisis dengan jembatan emosi yang mulus tanpa basa-basi.',
    prompt_content: `Tugas Anda: Satukan Narasi Cerita dan Analisis Film di bawah ini menjadi satu naskah alur cerita utuh yang mengalir sempurna tanpa celah.

Aturan Penempatan:
Sisipkan teks ANALISIS tepat sebelum bagian "## [KESIMPULAN & CLOSING]" dari NARASI CERITA.

Instruksi Jembatan Emosi:
Sebelum masuk ke segmen analisis, buat 1 paragraf singkat yang "menjemput" emosi penonton setelah selesai menonton alur filmnya.
Contoh: "Gimana, {{audienceName}}? Ceritanya gokil dan nendang banget kan? Tapi tunggu dulu, sebenernya ada hal yang lebih dalam yang mungkin lu lewatin pas lagi asyik nonton..."

Gaya Bahasa:
Tetap gunakan kata "Gua", panggil penonton dengan "{{audienceName}}", santai dan natural.

ATURAN OUTPUT MUTLAK (DILARANG CHAT / BASA-BASI):
- DILARANG KERAS membuka dengan kata pengantar, basa-basi, atau salam pembuka ke pembuat prompt (SEPERTI: "Tentu, Nakama! Siap-siap, karena gua udah satukan semua yang lu minta. Ini dia naskah alur cerita...", "Baik, ini naskahnya...").
- DILARANG memberikan kata penutup atau komentar di luar naskah.
- OUTPUT HARUS LANGSUNG 100% NASKAH MURNI, dimulai langsung dari naskah cerita tanpa pengantar apa pun.`
  },
  transcreate: {
    name: 'Tahap 4: Anti-Duplicate Transcreation (Global)',
    description: 'Transkreasi naskah ke bahasa tujuan internasional tanpa terdeteksi konten duplikat.',
    prompt_content: `Anda adalah Master Script Transcreator & Cultural Localization Specialist.
Tugas Anda adalah melakukan TRANSKREASI (bukan sekadar terjemahan kata-demi-kata) dari naskah alur cerita film ini ke bahasa: {{targetLanguage}}.

TARGET UTAMA (LOLOS FILTER DUPLIKASI KONTEN / DUPLICATE CONTENT):
1. DILARANG menerjemahkan secara harafiah atau literal word-for-word.
2. BANGUN KEMBALI setiap kalimat dengan struktur kalimat, metafora, idiom, dan ritme penceritaan khas penutur asli bahasa target.
3. Hook pembuka (maksimal 30 detik) harus sangat memikat dan disesuaikan dengan selera penonton bahasa target.
4. Tag arahan visual (Visual: ...) tetap dipertahankan dan diterjemahkan agar memudahkan editor video internasional.`
  }
};

const PromptTemplateRepo = {
  getAll() {
    const stmt = db.prepare(`SELECT * FROM prompt_templates ORDER BY id ASC`);
    return stmt.all();
  },
  getByKey(stageKey) {
    const stmt = db.prepare(`SELECT * FROM prompt_templates WHERE stage_key = ?`);
    return stmt.get(String(stageKey));
  },
  update(stageKey, data) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE prompt_templates SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        prompt_content = COALESCE(?, prompt_content),
        updated_at = ?
      WHERE stage_key = ?
    `);
    stmt.run(
      data.name ? data.name.trim() : null,
      data.description !== undefined ? data.description : null,
      data.prompt_content ? data.prompt_content.trim() : null,
      now,
      String(stageKey)
    );
    return this.getByKey(stageKey);
  },
  resetDefaults() {
    const now = new Date().toISOString();
    for (const [key, item] of Object.entries(DEFAULT_PROMPT_TEMPLATES)) {
      const exists = this.getByKey(key);
      if (exists) {
        this.update(key, item);
      } else {
        db.prepare(`
          INSERT INTO prompt_templates (stage_key, name, description, prompt_content, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(key, item.name, item.description, item.prompt_content, now, now);
      }
    }
    return this.getAll();
  }
};

// Repository for Global App Settings
const SettingsRepo = {
  get() {
    const stmt = db.prepare(`SELECT * FROM app_settings WHERE id = 1`);
    return stmt.get() || { id: 1, default_wpm: 140, max_hook_seconds: 30, default_gemini_model: 'auto', default_language: 'id' };
  },
  update(data) {
    const stmt = db.prepare(`
      UPDATE app_settings SET
        default_wpm = COALESCE(?, default_wpm),
        max_hook_seconds = COALESCE(?, max_hook_seconds),
        default_gemini_model = COALESCE(?, default_gemini_model),
        default_language = COALESCE(?, default_language),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);
    stmt.run(
      data.default_wpm !== undefined ? Number(data.default_wpm) : null,
      data.max_hook_seconds !== undefined ? Number(data.max_hook_seconds) : null,
      data.default_gemini_model ? String(data.default_gemini_model).trim() : null,
      data.default_language ? String(data.default_language).trim() : null
    );
    return this.get();
  }
};

// Seed sample project if database is empty
(function seedInitialData() {
  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM projects`);
  const { count } = countStmt.get();
  if (count === 0) {
    const fs = require('node:fs');
    try {
      const ref1 = fs.existsSync(path.join(__dirname, 'Ref-Naskah-1.txt')) ? fs.readFileSync(path.join(__dirname, 'Ref-Naskah-1.txt'), 'utf8') : '';
      const ref2 = fs.existsSync(path.join(__dirname, 'Ref-Nashkah-2.txt')) ? fs.readFileSync(path.join(__dirname, 'Ref-Nashkah-2.txt'), 'utf8') : '';
      const finalScript = fs.existsSync(path.join(__dirname, 'Final-Naskah.txt')) ? fs.readFileSync(path.join(__dirname, 'Final-Naskah.txt'), 'utf8') : '';

      ProjectRepo.create({
        title: "The Karate Kid",
        release_year: "2010",
        director: "Harald Zwart",
        synopsis: "Dre Parker (12) pindah ke Beijing bersama ibunya. Menghadapi perundungan oleh Cheng, Dre dibimbing oleh Mr. Han untuk belajar kungfu sejati dan bertanding di turnamen terbuka Beijing.",
        channel_name: "AAAlur Cerita",
        opening_hook: "Halo Nakama",
        outro_bridge: "Jadi, gak perlu cacicu lagi. langsung aja masuk ke alur ceritanya",
        persona_style: "teman_ngopi",
        include_analysis: 1,
        enforce_visual_cues: 1,
        script_markdown: finalScript,
        word_count: 3420,
        sources: {
          source1: ref1,
          source2: ref2,
          source3: `Pada awal film kita diperlihatkan seorang ibu bernama Sherry Parker bersama anak tunggalnya Dre Parker bersiap pindah ke Beijing Tiongkok. Dre mengeluh dan merasa asing.\n\nDre dirundung oleh Cheng dan gengnya. Untungnya Mr. Han, seorang teknisi apartemen yang ternyata mahaguru kungfu, menyelamatkan Dre dan melatihnya dengan filosofi jaket dan ketenangan batin untuk bertanding di turnamen terbuka Beijing.`
        }
      });
      console.log('✅ Berhasil inisialisasi database SQLite dan seed proyek The Karate Kid (2010).');
    } catch (e) {
      console.error('Seed initial error:', e);
    }
  }

  // Seed channels if empty
  const channelCount = db.prepare(`SELECT COUNT(*) as count FROM channels`).get().count;
  if (channelCount === 0) {
    ChannelRepo.create({
      name: 'AAAlur Cerita',
      greeting: 'Halo Nakama',
      outro_bridge: 'Jadi, gak perlu cacicu lagi. langsung aja masuk ke alur ceritanya',
      persona_style: 'teman_ngopi',
      target_language: 'id',
      is_default: 1
    });
    ChannelRepo.create({
      name: 'Malas Movie',
      greeting: 'Halo Malas People',
      outro_bridge: 'Tanpa basa-basi lagi, kita langsung masuk ke ceritanya!',
      persona_style: 'teman_ngopi',
      target_language: 'id',
      is_default: 0
    });
    ChannelRepo.create({
      name: 'Movie Rastis',
      greeting: 'Halo Cinefile',
      outro_bridge: 'Yuk langsung kita kupas tuntas alur filmnya!',
      persona_style: 'kritis_serius',
      target_language: 'id',
      is_default: 0
    });
    ChannelRepo.create({
      name: 'Movie Recap Hub (Global)',
      greeting: 'Hey movie fans, welcome back!',
      outro_bridge: "Without further ado, let's dive straight into the story!",
      persona_style: 'engaging_storyteller',
      target_language: 'en-US',
      is_default: 0
    });
    console.log('📺 Berhasil inisialisasi profil channel default di database SQLite.');
  }

  // Seed / migrate API key from .env if present and api_keys is empty
  const keyCount = db.prepare(`SELECT COUNT(*) as count FROM api_keys`).get().count;
  if (keyCount === 0 && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && !process.env.GEMINI_API_KEY.includes('YOUR_GEMINI')) {
    try {
      ApiKeyRepo.addKeys(process.env.GEMINI_API_KEY.trim(), 'Kunci Default (Migrasi)');
      console.log('🔑 Berhasil migrasi GEMINI_API_KEY dari .env ke database SQLite.');
    } catch (e) {
      console.error('Key migration error:', e);
    }
  }

  // Seed Personas if empty
  const personaCount = db.prepare(`SELECT COUNT(*) as count FROM personas`).get().count;
  if (personaCount === 0) {
    PersonaRepo.create({
      key: 'teman_ngopi',
      name: 'Lo-Gue Santai (Teman Ngopi)',
      description: 'Gaya santai, akrab, natural seperti teman nongkrong di warkop/kafe tanpa lelucon garing.',
      tone_prompt: 'Gaya Tutur: Santai seperti teman nongkrong di warkop/kafe. Gunakan kata sapaan "Lu" dan "Gua". Hindari lelucon garing atau slang berlebihan yang canggung. Alur cerita disampaikan mengalir, ekspresif, dan membuat penonton penasaran tanpa terkesan membaca skrip kaku.',
      is_default: 1
    });
    PersonaRepo.create({
      key: 'kritis_serius',
      name: 'Kritis & Analitis',
      description: 'Fokus pada tensi cerita, motif karakter, dan konsekuensi psikologis.',
      tone_prompt: 'Gaya Tutur: Kritis, berbobot, dan analitis. Soroti motif psikologis karakter, twist plot, dan konsekuensi tindakan tokoh. Gunakan bahasa semi-formal yang tajam dan berwibawa.',
      is_default: 0
    });
    PersonaRepo.create({
      key: 'semi_formal',
      name: 'Semi-Formal Hangat',
      description: 'Estetis dan berkelas, sangat cocok untuk drama emosional, biopik, atau film klasik.',
      tone_prompt: 'Gaya Tutur: Semi-formal, hangat, dan menghormati karya film. Cocok untuk film klasik, biopik, atau drama emosional. Bahasan runtut, pemilihan kata estetis dan berkelas.',
      is_default: 0
    });
    PersonaRepo.create({
      key: 'engaging_storyteller',
      name: 'Engaging Storyteller',
      description: 'Ritme cepat, dinamis, berenergi tinggi dengan pertanyaan retoris pemantik rasa penasaran.',
      tone_prompt: 'Gaya Tutur: Cepat, dinamis, berenergi tinggi, dan interaktif. Sering melempar pertanyaan retoris pemancing rasa penasaran audiens. Ritme narasi cepat dan memikat.',
      is_default: 0
    });
    PersonaRepo.create({
      key: 'cinematic_intense',
      name: 'Cinematic & Intense',
      description: 'Dramatis, tegang, dan mencekam. Menekankan ketegangan atmosfer thriller/horor/aksi.',
      tone_prompt: 'Gaya Tutur: Dramatis, mencekam, dan mendalam. Beri penekanan pada ketegangan adegan, atmosfer horor/thriller, dan emosi yang meledak-ledak.',
      is_default: 0
    });
    console.log('🎭 Berhasil inisialisasi persona gaya tutur default di SQLite.');
  }

  // Ensure video_esai_analitis persona exists in SQLite
  try {
    const existingEsai = db.prepare(`SELECT * FROM personas WHERE key = 'video_esai_analitis'`).get();
    if (!existingEsai) {
      PersonaRepo.create({
        key: 'video_esai_analitis',
        name: 'Video Esai Analitis & Simbolik (Mind-Blowing)',
        description: 'Menenun alur cerita dengan analisis simbolik, metafora monster/konflik batin, dan reinterpretasi ending (ala Video Essay Zack Cregger / Nerdwriter).',
        tone_prompt: `Gaya Tutur: Video Esai Ekspositoris-Analitis (Mind-Blowing Film Deep Dive).
- Sudut Pandang: Orang pertama ("Gua") yang santai, cerdas, akrab, dan reflektif tanpa slang canggung atau istilah AI klise.
- Formula 8 Langkah yang Wajib Diterapkan:
  1. Hook Pembuka Berbingkai Pertanyaan: Buka dengan kebingungan atau pertanyaan kontemplatif penonton ("Baru selesai nonton [Judul], tapi masih bingung gak sih sama nasib tokohnya? Ini film beneran bad ending ya? Nah pertanyaan itu yang mungkin kita tanyain...").
  2. Orientasi Perspektif Segar: Soroti keunikan sudut pandang penceritaan (misal: bukan dari kacamata jagoan/polisi, tapi orang biasa/kurir medis/NPC yang biasanya mati duluan).
  3. Konflik Batin Manusiawi: Tunjukkan bahwa di balik misi fisik/survival, tokoh utama punya konflik batin & ketakutan terbesar yang manusiawi dan relatable (takut perubahan hidup, belum siap jadi ayah/dewasa, trauma masa lalu).
  4. Alur Cerita Diselingi Analisis Simbolik: Ceritakan alur secara kronologis, tetapi JANGAN cuma rangkuman plot kosong. Setiap rintangan, adegan penting, atau monster WAJIB dibaca sebagai representasi/metafora psikologis dari ketakutan tokoh.
  5. Detail Visual Kontras & Titik Balik: Soroti detail visual kecil yang kontras (stiker mobil, foto keluarga, benda peninggalan) yang memicu titik balik karakter dari lari menjadi berani menghadapi kenyataan.
  6. Klimaks Ujian Batin: Ruangan/lokasi pertarungan akhir ditafsirkan maknanya secara simbolik (misal: ruang bersalin = kelahiran kembali / harus melewati ketakutan melahirkan).
  7. Reinterpretasi Ending: Jangan sekadar menyimpulkan "kalah" atau "bad ending". Berikan pembacaan ulang mendalam atas akhir cerita sebagai penyelesaian ark sang karakter (perubahan fisik menjadi monster adalah wujud konkret bahwa dia akhirnya berhenti lari dari perubahan).
  8. Meta Konteks Kreator & Ajakan Diskusi: Hubungkan dengan keresahan sang sutradara/pembuat karya di dunia nyata, lalu tutup dengan ajakan diskusi hangat ke penonton.`,
        is_default: 0
      });
      console.log('🎬 Berhasil menambahkan persona Video Esai Analitis & Simbolik ke SQLite.');
    }

    // Ensure CineThink channel preset exists
    const existingCineThink = db.prepare(`SELECT * FROM channels WHERE name LIKE '%CineThink%' OR name LIKE '%Video Esai%'`).get();
    if (!existingCineThink) {
      ChannelRepo.create({
        name: 'CineThink (Video Esai Film)',
        greeting: 'Halo Cinephile',
        outro_bridge: 'Nah, coba lu renungin satu pertanyaan mendasar ini:',
        persona_style: 'video_esai_analitis',
        target_language: 'id',
        is_default: 0
      });
      console.log('📺 Berhasil menambahkan channel preset CineThink (Video Esai Film) ke SQLite.');
    }
  } catch (err) {
    console.warn('Persona video esai migration notice:', err.message);
  }

  // Seed TTS Voices if empty
  const voiceCount = db.prepare(`SELECT COUNT(*) as count FROM tts_voices`).get().count;
  if (voiceCount === 0) {
    // Kokoro-82M Voices
    TtsVoiceRepo.create({ model: 'kokoro', voice_code: 'am_michael', display_name: 'Michael (Santai & Dalam)', gender: 'male', description: 'Suara pria narator alur cerita favorit, intonasi tenang dan artikulatif', is_default: 1 });
    TtsVoiceRepo.create({ model: 'kokoro', voice_code: 'am_adam', display_name: 'Adam (Hangat & Ramah)', gender: 'male', description: 'Suara pria ramah, tempo natural', is_default: 0 });
    TtsVoiceRepo.create({ model: 'kokoro', voice_code: 'af_bella', display_name: 'Bella (Ekspresif & Jelas)', gender: 'female', description: 'Suara wanita ekspresif dan jernih', is_default: 0 });
    TtsVoiceRepo.create({ model: 'kokoro', voice_code: 'af_nicole', display_name: 'Nicole (Lembut & Elegan)', gender: 'female', description: 'Suara wanita lembut, cocok untuk drama', is_default: 0 });
    TtsVoiceRepo.create({ model: 'kokoro', voice_code: 'bf_alice', display_name: 'Alice (Aksen British)', gender: 'female', description: 'Suara aksen British elegan', is_default: 0 });
    TtsVoiceRepo.create({ model: 'kokoro', voice_code: 'bm_george', display_name: 'George (Aksen British Berat)', gender: 'male', description: 'Suara pria berwibawa aksen British', is_default: 0 });

    // Nari Dia-1.6B Speakers
    TtsVoiceRepo.create({ model: 'dia', voice_code: 'S1', display_name: '[S1] Narator Utama (Penuh Emosi & Bernyawa)', gender: 'male', description: 'Speaker 1 Dia-1.6B: Intonasi dinamis penuh emosi', is_default: 1 });
    TtsVoiceRepo.create({ model: 'dia', voice_code: 'S2', display_name: '[S2] Karakter Pendukung (Santai & Dinamis)', gender: 'female', description: 'Speaker 2 Dia-1.6B: Karakter kedua santai', is_default: 0 });
    TtsVoiceRepo.create({ model: 'dia', voice_code: 'multi', display_name: 'Multi-Speaker [S1] + [S2] (Dialog Percakapan)', gender: 'neutral', description: 'Dialog dinamis multi-speaker otomatis', is_default: 0 });
    TtsVoiceRepo.create({ model: 'dia', voice_code: 'cinematic', display_name: 'Sinematik (Mendukung Tawa, Desah, Bisikan)', gender: 'neutral', description: 'Ekspresif sinematik dengan tawa & desah', is_default: 0 });

    // Coqui XTTS v2 Voices
    TtsVoiceRepo.create({ model: 'xtts', voice_code: 'id_male_1', display_name: 'Narator Indonesia (Pria Dewasa)', gender: 'male', description: 'Suara narator khas YouTube alur cerita Indonesia', is_default: 1 });
    TtsVoiceRepo.create({ model: 'xtts', voice_code: 'id_female_1', display_name: 'Narator Indonesia (Wanita Hangat)', gender: 'female', description: 'Suara wanita bahasa Indonesia ramah', is_default: 0 });
    TtsVoiceRepo.create({ model: 'xtts', voice_code: 'en_male_narrator', display_name: 'Movie Narrator (English Deep)', gender: 'male', description: 'Suara bahasa Inggris berat ala bioskop', is_default: 0 });

    console.log('🎙️ Berhasil inisialisasi karakter suara TTS default di SQLite.');
  }

  // Seed CapCut Voices if not present
  const capcutCount = db.prepare(`SELECT COUNT(*) as count FROM tts_voices WHERE model = 'capcut'`).get().count;
  if (capcutCount === 0) {
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'id_male_putra_uranus_bigtts', display_name: 'Putra (Pria Enerjik / Alur Cerita Populer)', gender: 'male', description: 'Standar emas narator alur cerita YouTube & TikTok Indonesia', is_default: 1 });
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'id_female_icha_uranus_bigtts', display_name: 'Icha (Wanita Lembut / Narator Populer)', gender: 'female', description: 'Suara wanita ramah, ceria, dan artikulasi natural', is_default: 0 });
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'id_male_darma', display_name: 'Darma (Pria Formal / Berwibawa)', gender: 'male', description: 'Nada tegas & dalam, cocok untuk aksi, perang, atau dokumenter', is_default: 0 });
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'id_female_noor', display_name: 'Noor (Wanita Dewasa / Tenang & Elegan)', gender: 'female', description: 'Tenang, sejuk, artikulatif, cocok untuk drama & kisah inspiratif', is_default: 0 });
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'id_male_adi', display_name: 'Adi (Pria Kasual / Santai)', gender: 'male', description: 'Gaya storytelling santai seperti teman mengobrol', is_default: 0 });
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'ICL_id_male_deep_god_dsp', display_name: 'Deep God (Suara Bass Dewa / Horor Thriller)', gender: 'male', description: 'Karakter suara berat dewa/monster menggema untuk horor & villain', is_default: 0 });
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'ICL_id_male_grandpa_sumarno', display_name: 'Kakek Sumarno (Karakter Orang Tua / Kakek)', gender: 'male', description: 'Suara khas orang tua/kakek untuk dongeng atau tokoh tetua', is_default: 0 });
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'ICL_id_female_hantuperempuan', display_name: 'Hantu Perempuan (Karakter Mistis & Horor)', gender: 'female', description: 'Efek suara seram & bisikan mistis untuk adegan jumpscare', is_default: 0 });
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'id_001', display_name: 'TikTok Legend (Suara Bot Wanita Klasik)', gender: 'female', description: 'Suara bot perempuan legendaris TikTok ("Mbak Google")', is_default: 0 });
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'BV138_streaming', display_name: 'Storyteller Female (Universal English)', gender: 'female', description: 'Suara narator wanita storytelling bahasa Inggris/global', is_default: 0 });
    TtsVoiceRepo.create({ model: 'capcut', voice_code: 'en_male_tech_blogger', display_name: 'Tech Blogger (Universal English)', gender: 'male', description: 'Suara pria energik khas presenter teknologi/konten global', is_default: 0 });
    console.log('🎙️ Berhasil inisialisasi karakter suara CapCut TTS di SQLite.');
  }

  // Seed Prompt Templates if empty
  const promptCount = db.prepare(`SELECT COUNT(*) as count FROM prompt_templates`).get().count;
  if (promptCount === 0) {
    PromptTemplateRepo.resetDefaults();
    console.log('📝 Berhasil inisialisasi template prompt AI multi-agent di SQLite.');
  } else {
    // Sync Stage 1 Prompt Template with Anti-Spoiler instructions if not yet updated
    try {
      const stage1Row = db.prepare(`SELECT prompt_content FROM prompt_templates WHERE stage_key = 'stage1_story'`).get();
      if (stage1Row && !stage1Row.prompt_content.includes('ANTI-SPOILER')) {
        PromptTemplateRepo.update('stage1_story', {
          name: DEFAULT_PROMPT_TEMPLATES.stage1_story.name,
          description: DEFAULT_PROMPT_TEMPLATES.stage1_story.description,
          prompt_content: DEFAULT_PROMPT_TEMPLATES.stage1_story.prompt_content
        });
        console.log('🛡️ Berhasil sinkronisasi aturan Anti-Spoiler ke template prompt Stage 1 di SQLite.');
      }

      const stage3Row = db.prepare(`SELECT prompt_content FROM prompt_templates WHERE stage_key = 'stage3_synthesis'`).get();
      if (stage3Row && !stage3Row.prompt_content.includes('DILARANG CHAT')) {
        PromptTemplateRepo.update('stage3_synthesis', {
          name: DEFAULT_PROMPT_TEMPLATES.stage3_synthesis.name,
          description: DEFAULT_PROMPT_TEMPLATES.stage3_synthesis.description,
          prompt_content: DEFAULT_PROMPT_TEMPLATES.stage3_synthesis.prompt_content
        });
        console.log('🛡️ Berhasil sinkronisasi aturan Anti-Preamble ke template Stage 3 di SQLite.');
      }
    } catch (e) {
      console.warn('Sync anti-spoiler prompt warning:', e.message);
    }
  }

  // Seed Audio Mixing & Mastering Presets if empty
  try {
    const presetCount = db.prepare(`SELECT COUNT(*) as count FROM audio_master_presets`).get().count;
    if (presetCount === 0) {
      AudioPresetRepo.resetDefaults();
      console.log('🎚️ Berhasil inisialisasi 6 preset audio mixing & mastering alur cerita di SQLite.');
    } else {
      // Ensure any missing system presets are added
      AudioPresetRepo.resetDefaults();
    }
  } catch (e) {
    console.warn('Preset seed warning:', e.message);
  }
})();


// Repository for Project Media & File Manager CRUD
const MediaRepo = {
  getAll({ projectId = null, fileType = null, category = null, search = null } = {}) {
    let sql = 'SELECT * FROM project_media WHERE 1=1';
    const params = [];

    if (projectId !== null && projectId !== undefined && projectId !== '' && projectId !== 'all' && Number(projectId) > 0) {
      sql += ' AND (project_id = ? OR project_id = 0)';
      params.push(Number(projectId));
    }
    if (fileType && fileType !== 'all') {
      sql += ' AND file_type = ?';
      params.push(String(fileType));
    }
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(String(category));
    }
    if (search && search.trim()) {
      sql += ' AND (original_name LIKE ? OR filename LIKE ? OR tags LIKE ? OR notes LIKE ?)';
      const term = '%' + search.trim() + '%';
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY id DESC';
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },

  getById(id) {
    const stmt = db.prepare('SELECT * FROM project_media WHERE id = ?');
    return stmt.get(Number(id));
  },

  create(data) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO project_media (
        project_id, filename, original_name, file_type, category,
        file_size, duration_seconds, resolution, mime_type, file_url,
        tags, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      Number(data.project_id || 0),
      String(data.filename || '').trim(),
      String(data.original_name || data.filename || 'Untitled').trim(),
      String(data.file_type || 'other').trim(),
      String(data.category || 'general').trim(),
      Number(data.file_size || 0),
      Number(data.duration_seconds || 0),
      String(data.resolution || ''),
      String(data.mime_type || ''),
      String(data.file_url || ''),
      String(data.tags || ''),
      String(data.notes || ''),
      now,
      now
    );
    return this.getById(res.lastInsertRowid);
  },

  update(id, data) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE project_media SET
        original_name = COALESCE(?, original_name),
        category = COALESCE(?, category),
        tags = COALESCE(?, tags),
        notes = COALESCE(?, notes),
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      data.original_name ? data.original_name.trim() : null,
      data.category ? data.category.trim() : null,
      data.tags !== undefined ? data.tags.trim() : null,
      data.notes !== undefined ? data.notes.trim() : null,
      now,
      Number(id)
    );
    return this.getById(id);
  },

  delete(id) {
    const item = this.getById(id);
    if (!item) return null;
    const stmt = db.prepare('DELETE FROM project_media WHERE id = ?');
    stmt.run(Number(id));
    return item;
  },

  getStats(projectId = null) {
    let sql = `SELECT 
      COUNT(*) as total_files,
      COALESCE(SUM(CASE WHEN file_type = 'video' THEN 1 ELSE 0 END), 0) as video_count,
      COALESCE(SUM(CASE WHEN file_type = 'audio' THEN 1 ELSE 0 END), 0) as audio_count,
      COALESCE(SUM(CASE WHEN category = 'footage_sliced' THEN 1 ELSE 0 END), 0) as sliced_count,
      COALESCE(SUM(file_size), 0) as total_size_bytes
    FROM project_media`;
    if (projectId !== null && projectId !== undefined && projectId !== '' && projectId !== 'all' && Number(projectId) > 0) {
      sql += ' WHERE project_id = ? OR project_id = 0';
      return db.prepare(sql).get(Number(projectId));
    }
    return db.prepare(sql).get();
  }
};

module.exports = {
  db,
  ProjectRepo,
  ApiKeyRepo,
  ChannelRepo,
  TtsRepo,
  PersonaRepo,
  TtsVoiceRepo,
  PromptTemplateRepo,
  SettingsRepo,
  AudioPresetRepo,
  AudioRecordingRepo,
  MediaRepo,
  DEFAULT_AUDIO_PRESETS
};
