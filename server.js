// 1. เรียกใช้งาน Module สำหรับทำเว็บเซิร์ฟเวอร์ และ PostgreSQL
const http = require('http');
const { Pool } = require('pg');

// 2. กำหนดพอร์ตสำหรับ Railway / Cloud
const port = process.env.PORT || 3000;

// 3. ตั้งค่าการเชื่อมต่อ PostgreSQL (รองรับ DATABASE_URL บน Railway และ SSL)
const connectionString = process.env.DATABASE_URL;

const dbConfig = connectionString 
  ? {
      connectionString,
      ssl: { rejectUnauthorized: false }
    }
  : {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'my_database',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

// สร้าง Connection Pool
const pool = new Pool(dbConfig);

// ข้อมูลนักเรียนเริ่มต้นกรณีพึ่งสร้างตารางใหม่
const defaultStudent = {
    id: '69319010047',
    name: 'นางสาวณัฐชา พิมพ์ทวด',
    level: 'HIT.1/1 (VB)',
    major: 'เทคโนโลยีสารสนเทศ'
};

// 4. ฟังก์ชันสำหรับสร้างตารางและใส่ข้อมูลเริ่มต้น (ถ้ายังไม่มี)
async function initDatabase() {
    try {
        const client = await pool.connect();
        
        // สร้างตารางถ้ายังไม่มี
        await client.query(`
            CREATE TABLE IF NOT EXISTS students (
                id VARCHAR(20) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                level VARCHAR(50) DEFAULT 'HIT.1/1 (VB)',
                major VARCHAR(100) DEFAULT 'เทคโนโลยีสารสนเทศ'
            )
        `);

        // เช็กว่ามีข้อมูลในตารางไหม ถ้าไม่มีให้ใส่ข้อมูลเริ่มต้น
        const checkResult = await client.query('SELECT COUNT(*) FROM students');
        if (parseInt(checkResult.rows[0].count) === 0) {
            await client.query(
                'INSERT INTO students (id, name, level, major) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                [defaultStudent.id, defaultStudent.name, defaultStudent.level, defaultStudent.major]
            );
            console.log('✨ สร้างตารางและเพิ่มข้อมูลเริ่มต้นเรียบร้อย');
        }

        client.release();
    } catch (error) {
        console.error('⚠️ ข้อผิดพลาดในการเริ่มต้นฐานข้อมูล:', error.message);
    }
}

// 5. ฟังก์ชันดึงสถานะฐานข้อมูล
async function getServerInfo() {
    let info = {
        status: '❌ ไม่เชื่อมต่อ',
        serverTime: 'N/A',
        version: 'N/A',
        message: ''
    };
    
    try {
        const client = await pool.connect();
        const timeResult = await client.query('SELECT NOW() as current_time');
        info.serverTime = timeResult.rows[0].current_time;
        
        const versionResult = await client.query('SELECT version()');
        info.version = versionResult.rows[0].version;
        
        info.status = '✅ เชื่อมต่อสำเร็จ';
        client.release();
    } catch (error) {
        info.status = '⚠️ ข้อผิดพลาด';
        info.message = error.message;
    }
    
    return info;
}

// 6. ฟังก์ชันดึงรายการนักศึกษาทั้งหมด
async function getAllStudents() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM students');
        client.release();
        return result.rows;
    } catch (error) {
        console.error('❌ ดึงข้อมูลนักศึกษาล้มเหลว:', error.message);
        return [];
    }
}

// 7. สร้างเซิร์ฟเวอร์ HTTP
const server = http.createServer(async (req, res) => {

    // ดักจับ Favicon
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API Endpoint: ดูสถานะระบบ
    if (req.url === '/api/status' && req.method === 'GET') {
        const info = await getServerInfo();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(info, null, 2));
        return;
    }

    // API Endpoint: ดูข้อมูลนักศึกษาในรูปแบบ JSON
    if (req.url === '/api/students' && req.method === 'GET') {
        const students = await getAllStudents();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(students.length > 0 ? students : [defaultStudent], null, 2));
        return;
    }

    // หน้าแรก (HTML Web Page)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const serverInfo = await getServerInfo();
    const students = await getAllStudents();

    // สร้างแถวตาราง HTML จากข้อมูลที่ดึงมาจากฐานข้อมูล
    let tableRowsHTML = '';
    if (students.length === 0) {
        tableRowsHTML = `<tr><td colspan="4" style="text-align: center; color: #db7093; padding: 15px;">ไม่พบข้อมูลนักศึกษาในระบบ</td></tr>`;
    } else {
        students.forEach(row => {
            // รองรับทั้งชื่อคอลัมน์ id/student_id และ name/student_name
            const id = row.id || row.student_id || '-';
            const name = row.name || row.student_name || '-';
            const level = row.level || 'HIT.1/1 (VB)';
            const major = row.major || 'เทคโนโลยีสารสนเทศ';

            tableRowsHTML += `
                <tr>
                    <td class="highlight">${id}</td>
                    <td style="font-weight: 600;">${name}</td>
                    <td>${level}</td>
                    <td>${major}</td>
                </tr>
            `;
        });
    }

    res.end(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Disneyland Princess Server</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Sarabun:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #ffd1e8 0%, #f8bbd0 25%, #f3aed9 50%, #e896d3 75%, #d78ec6 100%);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            font-family: 'Sarabun', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: #333;
            overflow: auto;
            padding: 20px;
            position: relative;
        }

        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .star {
            position: fixed;
            font-size: 1.5rem;
            color: rgba(255, 255, 255, 0.7);
            animation: twinkle 3s ease-in-out infinite;
            z-index: 1;
        }

        .star:nth-child(1) { top: 10%; left: 15%; animation-delay: 0s; }
        .star:nth-child(2) { top: 20%; right: 20%; animation-delay: 0.5s; }
        .star:nth-child(3) { top: 40%; left: 10%; animation-delay: 1s; }
        .star:nth-child(4) { bottom: 20%; right: 15%; animation-delay: 1.5s; }
        .star:nth-child(5) { bottom: 30%; left: 20%; animation-delay: 2s; }

        @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.2) rotate(10deg); }
        }

        .floating-orb {
            position: fixed;
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(255, 182, 193, 0.8);
            animation: float 4s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
        }

        .orb-1 {
            width: 60px;
            height: 60px;
            background: radial-gradient(circle at 30% 30%, #ffb6c1, #ff69b4);
            top: 15%;
            left: 5%;
            animation-duration: 5s;
        }

        .orb-2 {
            width: 40px;
            height: 40px;
            background: radial-gradient(circle at 30% 30%, #ffc0cb, #db7093);
            bottom: 20%;
            right: 8%;
            animation-duration: 7s;
            animation-delay: 1s;
        }

        .orb-3 {
            width: 50px;
            height: 50px;
            background: radial-gradient(circle at 30% 30%, #ffb6d9, #ff1493);
            top: 30%;
            right: 5%;
            animation-duration: 6s;
            animation-delay: 2s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
            50% { transform: translateY(-30px) translateX(15px) scale(1.1); }
        }

        .container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 750px;
        }

        .card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 240, 245, 0.98));
            border-radius: 30px;
            box-shadow: 0 20px 60px rgba(219, 112, 147, 0.4),
                        0 0 40px rgba(255, 182, 193, 0.3),
                        inset 0 0 30px rgba(255, 220, 230, 0.5);
            padding: 45px 35px;
            text-align: center;
            width: 100%;
            border: 5px solid #ff69b4;
            position: relative;
            box-sizing: border-box;
            backdrop-filter: blur(10px);
            animation: cardGlow 3s ease-in-out infinite;
            margin: 20px auto;
        }

        @keyframes cardGlow {
            0%, 100% { box-shadow: 0 20px 60px rgba(219, 112, 147, 0.4), 0 0 40px rgba(255, 182, 193, 0.3), inset 0 0 30px rgba(255, 220, 230, 0.5); }
            50% { box-shadow: 0 20px 60px rgba(219, 112, 147, 0.6), 0 0 50px rgba(255, 105, 180, 0.5), inset 0 0 30px rgba(255, 220, 230, 0.7); }
        }

        .mickey-brand {
            display: flex;
            justify-content: center;
            position: relative;
            margin: 0 auto 15px;
            width: 100px;
            height: 85px;
            animation: bobbing 3s ease-in-out infinite;
        }

        @keyframes bobbing {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
        }

        .mickey-head {
            width: 54px;
            height: 54px;
            background: linear-gradient(135deg, #ff69b4, #db7093);
            border-radius: 50%;
            position: absolute;
            bottom: 0;
            box-shadow: 0 0 20px rgba(255, 105, 180, 0.6);
        }

        .mickey-ear-left {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #ff69b4, #ff1493);
            border-radius: 50%;
            position: absolute;
            top: 0;
            left: 5px;
            box-shadow: 0 0 15px rgba(255, 20, 147, 0.5);
            animation: earWiggle 2s ease-in-out infinite;
        }

        .mickey-ear-right {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #ff69b4, #ff1493);
            border-radius: 50%;
            position: absolute;
            top: 0;
            right: 5px;
            box-shadow: 0 0 15px rgba(255, 20, 147, 0.5);
            animation: earWiggle 2s ease-in-out infinite;
            animation-delay: 0.2s;
        }

        @keyframes earWiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
        }

        .magic-spell {
            font-family: 'Cinzel', serif;
            font-size: 1.3rem;
            font-weight: 700;
            background: linear-gradient(135deg, #ff69b4, #db7093);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: 2px;
            margin-bottom: 8px;
            text-transform: uppercase;
            animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }

        h1 {
            color: #c2185b;
            font-size: 1.5rem;
            margin: 12px 0 8px 0;
            font-weight: 600;
        }

        h2 {
            background: linear-gradient(135deg, #ff69b4, #db7093);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0 0 20px 0;
            font-size: 1.8rem;
            font-weight: 700;
            border-bottom: 3px dashed #ffb6d9;
            padding-bottom: 15px;
        }

        /* ตกแต่งตาราง */
        .table-responsive {
            overflow-x: auto;
            margin: 20px 0;
        }

        .student-table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(255, 105, 180, 0.2);
        }

        .student-table th {
            background: linear-gradient(135deg, #ff69b4, #db7093);
            color: white;
            padding: 12px 15px;
            font-size: 1rem;
        }

        .student-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #ffe4e1;
            color: #c2185b;
            font-size: 0.95rem;
        }

        .student-table tr:hover {
            background-color: #fff0f5;
        }

        .highlight {
            color: #ff1493;
            font-weight: bold;
        }

        .status {
            background: linear-gradient(135deg, #ff69b4, #db7093);
            color: #fff;
            padding: 15px 25px;
            border-radius: 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: bold;
            font-size: 1rem;
            margin-top: 25px;
            box-shadow: 0 8px 25px rgba(255, 105, 180, 0.4);
            border: 2px solid #fff;
            width: 100%;
            box-sizing: border-box;
            transition: all 0.3s ease;
            animation: statusPulse 2s ease-in-out infinite;
        }

        @keyframes statusPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }

        .status:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 12px 35px rgba(255, 105, 180, 0.6);
        }

        .status::before {
            content: '✨';
            font-size: 1.3rem;
            animation: rotate 3s linear infinite;
        }

        @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .db-status {
            background: linear-gradient(135deg, rgba(255, 182, 193, 0.4), rgba(255, 220, 230, 0.4));
            padding: 20px;
            border-radius: 15px;
            margin-top: 20px;
            border-left: 5px solid #ff69b4;
            font-size: 0.9rem;
            color: #333;
            text-align: left;
        }

        .db-status p {
            margin: 8px 0;
            word-break: break-all;
        }

        .db-status strong {
            color: #c2185b;
        }

        .db-status .success {
            color: #28a745;
        }

        .db-status .error {
            color: #ff1493;
        }

        .interactive-btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #ff1493, #ff69b4);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 5px 20px rgba(255, 20, 147, 0.4);
        }

        .interactive-btn:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 8px 30px rgba(255, 20, 147, 0.6);
            background: linear-gradient(135deg, #ff69b4, #ff1493);
        }

        .interactive-btn:active {
            transform: translateY(-1px) scale(1.02);
        }

        .api-links {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 2px dashed #ffb6d9;
        }

        .api-link {
            display: inline-block;
            margin: 10px 5px;
            padding: 10px 20px;
            background: linear-gradient(135deg, rgba(255, 105, 180, 0.2), rgba(219, 112, 147, 0.2));
            border: 2px solid #ff69b4;
            border-radius: 15px;
            text-decoration: none;
            color: #c2185b;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .api-link:hover {
            background: linear-gradient(135deg, rgba(255, 105, 180, 0.4), rgba(219, 112, 147, 0.4));
            transform: scale(1.05);
        }
    </style>
</head>
<body>

    <div class="star">✨</div>
    <div class="star">⭐</div>
    <div class="star">✨</div>
    <div class="star">⭐</div>
    <div class="star">✨</div>

    <div class="floating-orb orb-1"></div>
    <div class="floating-orb orb-2"></div>
    <div class="floating-orb orb-3"></div>

    <div class="container">
        <div class="card">
            <div class="mickey-brand">
                <div class="mickey-ear-left"></div>
                <div class="mickey-ear-right"></div>
                <div class="mickey-head"></div>
            </div>
            
            <div class="magic-spell">✨ Princess Magic ✨</div>
            <h1>ยินดีต้อนรับสู่ Web Server</h1>
            <h2>ฐานข้อมูลนักศึกษา (PostgreSQL)</h2>
            
            <!-- ตารางแสดงรายการข้อมูลนักศึกษาจากโค้ดชุดแรก -->
            <div class="table-responsive">
                <table class="student-table">
                    <thead>
                        <tr>
                            <th>รหัสนักศึกษา</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>ระดับชั้น</th>
                            <th>สาขาวิชา</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHTML}
                    </tbody>
                </table>
            </div>
            
            <div class="status">ดินแดนเวทมนตร์บนระบบ Railway 👑</div>

            <div class="db-status">
                <p><strong>🗄️ สถานะฐานข้อมูล:</strong> <span class="${serverInfo.status.includes('✅') ? 'success' : 'error'}">${serverInfo.status}</span></p>
                <p><strong>⏰ เวลาเซิร์ฟเวอร์:</strong> ${serverInfo.serverTime}</p>
                <p><strong>📦 PostgreSQL Version:</strong> ${serverInfo.version ? serverInfo.version.substring(0, 50) : 'N/A'}...</p>
                ${serverInfo.message ? `<p class="error"><strong>⚠️ ข้อผิดพลาด:</strong> ${serverInfo.message}</p>` : ''}
            </div>

            <button class="interactive-btn">✨ คลิกเพื่อร่ายเวทมนตร์ ✨</button>

            <div class="api-links">
                <p style="margin-bottom: 10px;"><strong>📡 API Endpoints:</strong></p>
                <a href="/api/status" class="api-link" target="_blank">API Status</a>
                <a href="/api/students" class="api-link" target="_blank">API Students</a>
            </div>
        </div>
    </div>

    <script>
        document.querySelector('.interactive-btn').addEventListener('click', function() {
            for (let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.pointerEvents = 'none';
                particle.textContent = ['✨', '💗', '⭐', '💖'][Math.floor(Math.random() * 4)];
                particle.style.fontSize = Math.random() * 20 + 20 + 'px';
                particle.style.left = this.offsetLeft + this.offsetWidth / 2 + 'px';
                particle.style.top = this.offsetTop + this.offsetHeight / 2 + 'px';
                particle.style.animation = `particle-fall ${2 + Math.random()}s ease-out forwards`;
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
            }
        });
    </script>

    <style>
        @keyframes particle-fall {
            0% {
                transform: translateY(0) translateX(0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translateY(300px) translateX(${Math.random() * 200 - 100}px) scale(0);
                opacity: 0;
            }
        }
    </style>

</body>
</html>
    `);
});

// 8. เริ่มต้นระบบและเปิดเซิร์ฟเวอร์
(async () => {
    console.log('🚀 เริ่มต้นเซิร์ฟเวอร์...');
    
    // สร้างตารางและข้อมูลตั้งต้น
    await initDatabase();

    // เริ่มรับฟัง HTTP Request
    server.listen(port, () => {
        console.log(`✨ Princess Magical Server is running! ดินแดนดิสนีย์แลนด์เปิดใช้งานแล้ว`);
        console.log(`🌐 URL: http://localhost:${port}`);
    });
})();

// ปิดการเชื่อมต่อเมื่อหยุดการทำงาน
process.on('SIGINT', async () => {
    console.log('\n🌟 ปิดเซิร์ฟเวอร์ดินแดนเวทมนตร์...');
    await pool.end();
    process.exit(0);
});
