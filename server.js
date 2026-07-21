// 1. เรียกใช้งาน Module ที่ชื่อว่า 'http' สำหรับทำเว็บเซิร์ฟเวอร์
const http = require('http');

// 2. เรียกใช้งาน Pool จากไลบรารี pg สำหรับจัดการการเชื่อมต่อฐานข้อมูล
const { Pool } = require('pg');

// 3. ตั้งค่าการเชื่อมต่อ โดยดึง URL มาจาก Environment Variable ของ Railway
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// 4. กำหนดช่องทาง (Port) ให้รองรับการทำงานบน Cloud เช่น Railway หรือดีฟอลต์พอร์ต 3000
const port = process.env.PORT || 3000;

// 5. สร้างเซิร์ฟเวอร์เพื่อคอยรับและตอบกลับคำขอของผู้ใช้งาน
const server = http.createServer(async (req, res) => {

    // ตรวจสอบและดักจับคำขอ Favicon เพื่อป้องกันเซิร์ฟเวอร์ทำงานซ้ำซ้อน
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 5.1 ตัดเส้นทาง URL เพื่อกำหนดการทำงาน
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    try {
        // เส้นทางหลัก: หน้าแรก (หน้า Dashboard)
        if (pathname === '/') {
            res.statusCode = 200;
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
            /* พื้นหลังไล่เฉดสีชมพูและม่วงขอบฟ้าเศษ */
            background: linear-gradient(135deg, #ffd1e8 0%, #f8bbd0 25%, #f3aed9 50%, #e896d3 75%, #d78ec6 100%);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            font-family: 'Sarabun', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #333;
            overflow: hidden;
            position: relative;
        }

        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* ดาวระยิบระยับด้านหลัง */
        .star {
            position: absolute;
            font-size: 1.5rem;
            color: rgba(255, 255, 255, 0.7);
            animation: twinkle 3s ease-in-out infinite;
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

        /* ปุ่มเวทมนตร์ลอยสูง */
        .floating-orb {
            position: absolute;
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(255, 182, 193, 0.8);
            animation: float 4s ease-in-out infinite;
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

        /* การ์ดข้อมูลสไตล์เจ้าหญิง */
        .card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 240, 245, 0.98));
            border-radius: 30px;
            box-shadow: 0 20px 60px rgba(219, 112, 147, 0.4), 
                        0 0 40px rgba(255, 182, 193, 0.3),
                        inset 0 0 30px rgba(255, 220, 230, 0.5);
            padding: 45px 35px;
            text-align: center;
            max-width: 520px;
            width: 92%;
            border: 5px solid #ff69b4;
            position: relative;
            box-sizing: border-box;
            backdrop-filter: blur(10px);
            animation: cardGlow 3s ease-in-out infinite;
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

        .mickey-ear-left, .mickey-ear-right {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #ff69b4, #ff1493);
            border-radius: 50%;
            position: absolute;
            top: 0;
            box-shadow: 0 0 15px rgba(255, 20, 147, 0.5);
            animation: earWiggle 2s ease-in-out infinite;
        }

        .mickey-ear-left { left: 5px; }
        .mickey-ear-right { right: 5px; animation-delay: 0.2s; }

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
            margin: 0 0 28px 0;
            font-size: 2rem;
            font-weight: 700;
            border-bottom: 3px dashed #ffb6d9;
            padding-bottom: 18px;
        }

        .info-group {
            margin-bottom: 25px;
        }

        .info-text {
            font-size: 1.1rem;
            margin: 10px 0;
            color: #c2185b;
            display: flex;
            justify-content: space-between;
            padding: 12px 18px;
            background: linear-gradient(135deg, rgba(255, 182, 193, 0.3), rgba(255, 220, 230, 0.3));
            border-radius: 15px;
            border-left: 5px solid #ff69b4;
            transition: all 0.3s ease;
        }

        .info-text:hover {
            transform: translateX(8px) scale(1.02);
            box-shadow: 0 5px 20px rgba(255, 105, 180, 0.3);
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
            font-weight: bold;
            margin-top: 25px;
            box-shadow: 0 8px 25px rgba(255, 105, 180, 0.4);
            animation: statusPulse 2s ease-in-out infinite;
        }

        @keyframes statusPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }

        .nav-links {
            margin-top: 20px;
        }

        .nav-links a {
            display: inline-block;
            margin: 8px;
            padding: 12px 25px;
            background: linear-gradient(135deg, #ff1493, #ff69b4);
            color: white;
            text-decoration: none;
            border-radius: 20px;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(255, 20, 147, 0.3);
        }

        .nav-links a:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 20, 147, 0.5);
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

    <div class="card">
        <div class="mickey-brand">
            <div class="mickey-ear-left"></div>
            <div class="mickey-ear-right"></div>
            <div class="mickey-head"></div>
        </div>
        
        <div class="magic-spell">✨ Princess Magic ✨</div>
        <h1>ยินดีต้อนรับสู่ Web Server ของ</h1>
        <h2>นางสาวณัฐชา พิมพ์ทวด</h2>
        
        <div class="info-group">
            <div class="info-text">
                <span>🎓 รหัสนักศึกษา:</span>
                <span class="highlight">69319010047</span>
            </div>
            <div class="info-text">
                <span>📚 ระดับชั้น:</span>
                <span class="highlight">HIT.1/1 (VB)</span>
            </div>
            <div class="info-text">
                <span>💻 สาขา:</span>
                <span class="highlight">เทคโนโลยีสารสนเทศ</span>
            </div>
        </div>
        
        <div class="status">✨ ดินแดนเวทมนตร์บนระบบ Railway เปิดทำงานแล้ว! ✨</div>

        <div class="nav-links">
            <a href="/students">📊 ดูข้อมูลนักศึกษา</a>
        </div>
    </div>

</body>
</html>
            `);
        }
        // เส้นทาง: ดูข้อมูลนักศึกษา (เชื่อมต่อฐานข้อมูล PostgreSQL)
        else if (pathname === '/students') {
            const client = await pool.connect();
            try {
                // 3. ขอเชื่อมต่อและส่งคำสั่ง SQL ไปดึงข้อมูลจากตาราง students
                const result = await client.query('SELECT * FROM students ORDER BY student_id LIMIT 100');
                
                // 4. นำข้อมูลที่ได้ (result.rows) มาประกอบเป็นตาราง HTML
                let tableHtml = `
                    <div style="background: linear-gradient(135deg, #ffd1e8, #d78ec6); min-height: 100vh; padding: 40px 20px; font-family: 'Sarabun', sans-serif;">
                        <div style="max-width: 1000px; margin: 0 auto;">
                            <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 40px rgba(219, 112, 147, 0.3);">
                                <h1 style="color: #c2185b; margin-bottom: 10px; text-align: center;">📚 ข้อมูลนักศึกษา</h1>
                                <p style="text-align: center; color: #db7093; margin-bottom: 20px; font-size: 1.1rem;">
                                    จำนวนทั้งหมด: <strong style="color: #ff1493;">${result.rows.length}</strong> คน
                                </p>
                `;

                if (result.rows.length > 0) {
                    tableHtml += `
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                    <thead>
                                        <tr style="background: linear-gradient(135deg, #ff69b4, #db7093); color: white; font-weight: bold;">
                                            <th style="padding: 15px; text-align: left; border: 2px solid #ffb6d9;">🎓 รหัสนักศึกษา</th>
                                            <th style="padding: 15px; text-align: left; border: 2px solid #ffb6d9;">👤 ชื่อ-นามสกุล</th>
                                            <th style="padding: 15px; text-align: left; border: 2px solid #ffb6d9;">📧 อีเมล</th>
                                            <th style="padding: 15px; text-align: left; border: 2px solid #ffb6d9;">📞 เบอร์โทรศัพท์</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                    `;

                    // วนลูปนำข้อมูลแต่ละแถวมาแสดง
                    result.rows.forEach((row, index) => {
                        const bgColor = index % 2 === 0 ? '#ffffff' : '#fff5f8';
                        tableHtml += `
                            <tr style="background: ${bgColor}; transition: all 0.3s ease;">
                                <td style="padding: 12px 15px; border: 1px solid #ffb6d9; color: #c2185b; font-weight: bold;">${row.student_id || '-'}</td>
                                <td style="padding: 12px 15px; border: 1px solid #ffb6d9; color: #333;">${row.student_name || '-'}</td>
                                <td style="padding: 12px 15px; border: 1px solid #ffb6d9; color: #333;">${row.student_email || '-'}</td>
                                <td style="padding: 12px 15px; border: 1px solid #ffb6d9; color: #333;">${row.student_phone || '-'}</td>
                            </tr>
                        `;
                    });

                    tableHtml += `
                                    </tbody>
                                </table>
                    `;
                } else {
                    tableHtml += `
                                <div style="text-align: center; padding: 40px; background: #fff5f8; border-radius: 15px; color: #db7093;">
                                    <p style="font-size: 1.1rem;">❌ ไม่มีข้อมูลนักศึกษาในฐานข้อมูล</p>
                                    <p style="font-size: 0.9rem; margin-top: 10px;">กรุณาเพิ่มข้อมูลนักศึกษาในฐานข้อมูล PostgreSQL</p>
                                </div>
                    `;
                }

                tableHtml += `
                                <div style="text-align: center; margin-top: 20px;">
                                    <a href="/" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #ff1493, #ff69b4); color: white; text-decoration: none; border-radius: 20px; font-weight: bold; transition: all 0.3s ease; box-shadow: 0 5px 15px rgba(255, 20, 147, 0.3);">← กลับไปหน้าแรก</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                res.statusCode = 200;
                res.end(tableHtml);
            } finally {
                // คืนการเชื่อมต่อเมื่อใช้งานเสร็จ
                client.release();
            }
        }
        // หน้า 404 สำหรับเส้นทางที่ไม่ถูกต้อง
        else {
            res.statusCode = 404;
            res.end(`
                <div style="background: linear-gradient(135deg, #ffd1e8, #d78ec6); min-height: 100vh; display: flex; justify-content: center; align-items: center; font-family: 'Sarabun', sans-serif;">
                    <div style="text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(219, 112, 147, 0.3);">
                        <h1 style="color: #c2185b; font-size: 3rem; margin-bottom: 10px;">404</h1>
                        <p style="color: #db7093; font-size: 1.2rem; margin-bottom: 20px;">ไม่พบเพจที่ค้นหา</p>
                        <a href="/" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #ff1493, #ff69b4); color: white; text-decoration: none; border-radius: 20px; font-weight: bold;">← กลับไปหน้าแรก</a>
                    </div>
                </div>
            `);
        }

    } catch (err) {
        // กรณีเชื่อมต่อไม่ได้หรือเขียนชื่อตารางผิด
        console.error('Database Error:', err);
        res.statusCode = 500;
        res.end(`
            <div style="background: linear-gradient(135deg, #ffd1e8, #d78ec6); min-height: 100vh; display: flex; justify-content: center; align-items: center; font-family: 'Sarabun', sans-serif;">
                <div style="text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(219, 112, 147, 0.3); max-width: 500px;">
                    <h1 style="color: #c2185b; margin-bottom: 10px;">⚠️ เกิดข้อผิดพลาด</h1>
                    <p style="color: #db7093; margin-bottom: 20px;"><strong>รายละเอียด:</strong></p>
                    <p style="color: #666; font-size: 0.95rem; margin-bottom: 20px; background: #f5f5f5; padding: 15px; border-radius: 10px; border-left: 4px solid #ff69b4; word-break: break-all;">
                        ${err.message}
                    </p>
                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 15px; font-weight: bold;">✓ ตรวจสอบให้แน่ใจว่า:</p>
                    <ul style="color: #666; text-align: left; margin-left: 20px; margin-bottom: 20px; line-height: 1.8;">
                        <li>✓ ตั้งค่า <strong>DATABASE_URL</strong> ใน Environment Variable แล้ว</li>
                        <li>✓ ฐานข้อมูล PostgreSQL เปิดใช้งาน</li>
                        <li>✓ ตารางชื่อ <strong>students</strong> มีอยู่ในฐานข้อมูล</li>
                        <li>✓ คอลัมน์: student_id, student_name, student_email, student_phone</li>
                    </ul>
                    <div style="background: #fff5f8; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: left; font-size: 0.85rem;">
                        <p style="color: #c2185b; font-weight: bold; margin-bottom: 10px;">📝 SQL สำหรับสร้างตาราง:</p>
                        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; color: #333;">CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY,
    student_name VARCHAR(255),
    student_email VARCHAR(255),
    student_phone VARCHAR(20)
);</pre>
                    </div>
                    <a href="/" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #ff1493, #ff69b4); color: white; text-decoration: none; border-radius: 20px; font-weight: bold;">← กลับไปหน้าแรก</a>
                </div>
            </div>
        `);
    }

});

// 6. สั่งให้เซิร์ฟเวอร์เริ่มต้นเปิดรับฟังการทำงานตาม Port ที่กำหนดไว้
server.listen(port, () => {
    console.log(`✨ Princess Magical Server is running!`);
    console.log(`📍 ดินแดนดิสนีย์แลนด์เจ้าหญิงเปิดใช้งานแล้วที่ช่อง ${port}`);
    console.log(`🌐 URL: http://localhost:${port}`);
    console.log(`📊 ดูข้อมูลนักศึกษา: http://localhost:${port}/students`);
});