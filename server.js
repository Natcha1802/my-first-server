'use strict';

// Improved server: serves a themed HTML page and provides a /api/students endpoint
// - Uses native http + pg Pool
// - / serves the Disneyland Princess themed page (client fetches /api/students)
// - /api/students returns JSON list of students
// - Properly releases DB clients, handles SSL for production, and graceful shutdown

const http = require('http');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || '';
const poolOptions = { connectionString };
if (process.env.NODE_ENV === 'production' && connectionString) {
  // Railway / Heroku often require ssl with rejectUnauthorized: false
  poolOptions.ssl = { rejectUnauthorized: false };
}
const pool = new Pool(poolOptions);

const port = Number(process.env.PORT) || 3000;

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const rootHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Disneyland Princess Server</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Sarabun:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    /* Minimal trimmed styles from original theme for clarity */
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;font-family:'Sarabun',sans-serif;background:linear-gradient(135deg,#ffd1e8 0,#f3aed9 50%,#d78ec6 100%);display:flex;align-items:center;justify-content:center;color:#333}
    .card{max-width:920px;width:94%;background:linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,240,245,0.98));border-radius:20px;padding:28px;border:4px solid #ff69b4;box-shadow:0 20px 60px rgba(219,112,147,0.3)}
    h1{color:#c2185b;margin-top:0}
    .status{background:linear-gradient(135deg,#ff69b4,#db7093);color:#fff;padding:10px;border-radius:12px;display:inline-block;margin-bottom:12px}
    .students-table{width:100%;border-collapse:collapse;margin-top:16px}
    .students-table th,.students-table td{padding:10px;border:1px solid #ffb6d9}
    .hint{color:#6a4056;font-size:0.9rem;margin-top:12px}
    .interactive-btn{display:inline-block;margin-top:14px;padding:10px 20px;background:linear-gradient(135deg,#ff1493,#ff69b4);color:#fff;border-radius:20px;border:none;cursor:pointer}
    pre{background:#fff1f6;padding:12px;border-radius:8px}
  </style>
</head>
<body>
  <div class="card">
    <h1>ยินดีต้อนรับสู่ Web Server ของ นางสาวณัฐชา พิมพ์ทวด</h1>
    <div class="status">ดินแดนเวทมนตร์บนระบบ Railway เปิดทำงานปกติแล้วค่ะ! 👑</div>

    <p class="hint">ข้อมูลนักศึกษาจะแสดงด้านล่าง (อ่านจากตาราง <code>students</code> ในฐานข้อมูล)</p>

    <div id="students">
      <p>กำลังโหลดข้อมูลนักศึกษา...</p>
    </div>

    <button class="interactive-btn" id="refresh">✨ รีเฟรชข��อมูลนักศึกษา ✨</button>

    <hr/>
    <p class="hint">หมายเหตุ: หากยังไม่มีตาราง <code>students</code> ให้สร้างด้วยตัวอย่าง SQL ด้านล่าง</p>
    <pre><code>CREATE TABLE students (
  student_id VARCHAR(50) PRIMARY KEY,
  student_name TEXT
);

INSERT INTO students (student_id, student_name) VALUES ('69319010047', 'นางสาวณัฐชา พิมพ์ทวด');
</code></pre>
  </div>

  <script>
    async function fetchStudents() {
      const el = document.getElementById('students');
      try {
        const r = await fetch('/api/students');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        if (!Array.isArray(data)) throw new Error('Invalid response');
        if (data.length === 0) {
          el.innerHTML = '<p>ไม่มีข้อมูลนักศึกษาในตาราง students</p>';
          return;
        }
        // build table
        const cols = Object.keys(data[0]);
        let html = '<table class="students-table"><thead><tr>';
        for (const c of cols) html += '<th>' + c + '</th>';
        html += '</tr></thead><tbody>';
        for (const row of data) {
          html += '<tr>';
          for (const c of cols) html += '<td>' + String(row[c] ?? '') + '</td>';
          html += '</tr>';
        }
        html += '</tbody></table>';
        el.innerHTML = html;
      } catch (err) {
        el.innerHTML = '<p>เกิดข้อผิดพลาดในการดึงข้อมูล: ' + (err.message || err) + '</p>';
      }
    }

    document.getElementById('refresh').addEventListener('click', fetchStudents);
    // initial load
    fetchStudents();
  </script>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  // simple routing
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(rootHtml);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/students') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    let client;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM students');
      const rows = result.rows || [];
      // escape all values before sending back to client as JSON-safe strings
      const safe = rows.map(r => {
        const obj = {};
        for (const k of Object.keys(r)) obj[k] = r[k] === null || r[k] === undefined ? null : String(r[k]);
        return obj;
      });
      res.writeHead(200);
      res.end(JSON.stringify(safe));
    } catch (err) {
      console.error('DB error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Database error', message: err.message }));
    } finally {
      if (client) client.release();
    }
    return;
  }

  // fallback 404
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

async function shutdown(signal) {
  try {
    console.log(`Received ${signal}, closing server and DB pool...`);
    server.close();
    await pool.end();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
