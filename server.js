'use strict';

/**
 * server.js
 * A clean, well-structured Node HTTP server that serves a themed HTML page
 * and a small JSON API backed by PostgreSQL.
 *
 * Endpoints:
 *  - GET /            -> themed HTML page (fetches /api/students)
 *  - GET /api/students -> JSON array of students from `students` table
 *
 * Env:
 *  - DATABASE_URL (required for DB access)
 *  - NODE_ENV (set to 'production' to enable poolOptions.ssl.rejectUnauthorized = false)
 *  - PORT (optional, default 3000)
 */

const http = require('http');
const { Pool } = require('pg');

const PORT = Number(process.env.PORT) || 3000;
const DATABASE_URL = process.env.DATABASE_URL || '';

const poolOptions = {};
if (DATABASE_URL) poolOptions.connectionString = DATABASE_URL;
// Many PaaS examples require SSL but don't validate CA — enable explicitly in production only
if (process.env.NODE_ENV === 'production' && DATABASE_URL) {
  poolOptions.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolOptions);

function serializableRow(row) {
  const out = {};
  for (const k of Object.keys(row)) {
    const v = row[k];
    out[k] = v === undefined ? null : (v === null ? null : String(v));
  }
  return out;
}

function respondJSON(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload, 'utf8'),
  });
  res.end(payload);
}

function respondHTML(res, status, html) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html, 'utf8'),
  });
  res.end(html);
}

// Root HTML (keeps the original Disneyland Princess theme but cleaned up)
const ROOT_HTML = `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Disneyland Princess — นางสาวณัฐชา พิมพ์ทวด</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Sarabun:wght@300;400;600&display=swap" rel="stylesheet">
<style>
  :root{--accent1:#ff69b4;--accent2:#db7093;--bg1:#ffd1e8}
  *{box-sizing:border-box}
  html,body{height:100%}
  body{
    margin:0;
    font-family:'Sarabun',system-ui,-apple-system,Arial, sans-serif;
    background:linear-gradient(135deg,var(--bg1),#f3aed9 50%,#d78ec6 100%);
    display:flex;align-items:center;justify-content:center;padding:32px;color:#302033;
  }
  .frame{width:100%;max-width:980px}
  .card{
    background:linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,240,245,0.98));
    border-radius:20px;padding:28px;border:4px solid var(--accent1);box-shadow:0 18px 40px rgba(0,0,0,0.08);
  }
  h1{margin:0 0 6px;color:#a81a58}
  .meta{color:#6b2b4b;margin-bottom:12px}
  .status{display:inline-block;padding:10px 14px;background:linear-gradient(90deg,var(--accent1),var(--accent2));color:#fff;border-radius:10px;font-weight:600}

  .students{margin-top:18px}
  table{width:100%;border-collapse:collapse;background:transparent}
  th,td{padding:10px;border:1px solid rgba(255,182,193,0.6);text-align:left}
  thead th{background:linear-gradient(90deg,rgba(255,182,193,0.25),rgba(255,150,200,0.25));}

  .controls{margin-top:14px;display:flex;gap:12px;flex-wrap:wrap}
  .btn{background:linear-gradient(90deg,var(--accent1),var(--accent2));color:#fff;padding:10px 16px;border-radius:10px;border:none;cursor:pointer;font-weight:700}
  .hint{margin-top:14px;color:#5b2a45;font-size:0.95rem}

  /* particle styles: use CSS variable --tx for horizontal offset per particle */
  .particle{position:fixed;pointer-events:none;font-size:22px;will-change:transform,opacity;}
  @keyframes particle-fall{
    0%{transform:translateY(0) translateX(0) scale(1);opacity:1}
    100%{transform:translateY(320px) translateX(var(--tx,0px)) scale(0.2);opacity:0}
  }

  /* responsive */
  @media (max-width:640px){.card{padding:18px}}
</style>
</head>
<body>
  <div class="frame">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <div>
          <h1>ยินดีต้อนรับ — นางสาวณัฐชา พิมพ์ทวด</h1>
          <div class="meta">Web Server ธีม Disneyland Princess</div>
        </div>
        <div class="status">ระบบ: พร้อมใช้งาน ✨</div>
      </div>

      <p class="hint">ข้อมูลนักศึกษาจะถูกอ่านจากตาราง <code>students</code> ในฐานข้อมูล (ดู /api/students)</p>

      <div class="controls">
        <button id="refresh" class="btn">รีเฟรชข้อมูลนักศึกษา</button>
        <button id="demo" class="btn" style="background:linear-gradient(90deg,#ffd1e8,#ffb6d9);color:#6b2b4b">เรียกเอฟเฟกต์เวทมนตร์</button>
      </div>

      <div class="students" id="students">กำลังโหลดข้อมูล...</div>

      <section class="hint" aria-live="polite">
        <strong>ตัวอย่าง SQL:</strong>
        <pre style="background:#fff1f6;padding:10px;border-radius:8px;overflow:auto">CREATE TABLE students (
  student_id VARCHAR(50) PRIMARY KEY,
  student_name TEXT
);

INSERT INTO students (student_id, student_name) VALUES ('69319010047', 'นางสาวณัฐชา พิมพ์ทวด');</pre>
      </section>
    </div>
  </div>

<script>
  async function fetchStudents() {
    const container = document.getElementById('students');
    container.textContent = 'กำลังโหลดข้อมูล...';
    try {
      const res = await fetch('/api/students');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('ข้อมูลไม่ถูกต้อง');
      if (data.length === 0) {
        container.innerHTML = '<p>ไม่มีข้อมูลนักศึกษาในตาราง students</p>';
        return;
      }

      // build table
      const cols = Object.keys(data[0]);
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const thr = document.createElement('tr');
      for (const c of cols) {
        const th = document.createElement('th'); th.textContent = c; thr.appendChild(th);
      }
      thead.appendChild(thr);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      for (const row of data) {
        const tr = document.createElement('tr');
        for (const c of cols) {
          const td = document.createElement('td');
          td.textContent = row[c] ?? '';
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      container.innerHTML = '';
      container.appendChild(table);
    } catch (err) {
      container.innerHTML = '<p>เกิดข้อผิดพลาด: ' + (err.message || err) + '</p>';
      console.error('fetchStudents error', err);
    }
  }

  document.getElementById('refresh').addEventListener('click', fetchStudents);

  // particle magic: create small floating particles that fall using CSS animation and a per-particle --tx var
  function spawnParticles(count = 10, originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      // pick an emoji
      const emojis = ['✨','💗','⭐','💖','🎀'];
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const size = 16 + Math.floor(Math.random() * 22);
      p.style.fontSize = size + 'px';
      // start near origin (use viewport fixed coordinates)
      const left = originX + Math.floor(Math.random() * 80 - 40);
      const top = originY + Math.floor(Math.random() * 30 - 10);
      p.style.left = left + 'px';
      p.style.top = top + 'px';
      // horizontal offset during fall
      const tx = Math.floor(Math.random() * 200 - 100) + 'px';
      p.style.setProperty('--tx', tx);
      // random animation duration
      const dur = (1.6 + Math.random() * 1.6).toFixed(2) + 's';
      p.style.animation = `particle-fall ${dur} cubic-bezier(.2,.8,.2,1) forwards`;
      document.body.appendChild(p);
      // remove after animation
      setTimeout(() => p.remove(), 2200);
    }
  }

  document.getElementById('demo').addEventListener('click', (e) => {
    // spawn at button center
    const r = e.currentTarget.getBoundingClientRect();
    spawnParticles(12, r.left + r.width/2, r.top + r.height/2);
  });

  // initial load
  fetchStudents();
</script>
</body>
</html>`;

// Server logic
const server = http.createServer(async (req, res) => {
  try {
    // ignore favicon
    if (req.url === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Serve root HTML
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      respondHTML(res, 200, ROOT_HTML);
      return;
    }

    // API: GET /api/students
    if (req.method === 'GET' && req.url === '/api/students') {
      let client = null;
      try {
        client = await pool.connect();
        const { rows } = await client.query('SELECT * FROM students');
        const safe = (rows || []).map(serializableRow);
        respondJSON(res, 200, safe);
      } catch (err) {
        console.error('Database query failed:', err);
        respondJSON(res, 500, { error: 'Database query failed', message: err.message });
      } finally {
        if (client) client.release();
      }
      return;
    }

    // not found
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (err) {
    console.error('Unexpected server error:', err);
    respondJSON(res, 500, { error: 'Server error', message: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Graceful shutdown helper
async function gracefulShutdown(signal) {
  try {
    console.log(`Received ${signal} — shutting down...`);
    // stop accepting new connections
    await new Promise((resolve) => server.close(resolve));
    // close DB pool
    await pool.end();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
