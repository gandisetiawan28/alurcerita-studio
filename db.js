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
`);

// Repository Methods
const ProjectRepo = {
  // List all projects with snippet info
  getAll() {
    const stmt = db.prepare(`
      SELECT 
        p.id, p.title, p.director_year, p.synopsis, p.channel_name,
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
    const insertProject = db.prepare(`
      INSERT INTO projects (
        title, director_year, synopsis, channel_name, opening_hook,
        outro_bridge, persona_style, include_analysis, enforce_visual_cues,
        script_markdown, word_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertProject.run(
      data.title || 'Proyek Tanpa Judul',
      data.director_year || '',
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
    const updateStmt = db.prepare(`
      UPDATE projects SET
        title = COALESCE(?, title),
        director_year = COALESCE(?, director_year),
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
      data.director_year !== undefined ? data.director_year : null,
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
        title: "The Karate Kid (2010)",
        director_year: "Harald Zwart (2010)",
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
})();

module.exports = {
  db,
  ProjectRepo,
  ApiKeyRepo,
  TtsRepo
};
