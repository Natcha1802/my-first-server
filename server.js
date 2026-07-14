// 1. เรียกใช้งาน Module ที่ชื่อว่า 'http' สำหรับทำเว็บเซิร์ฟเวอร์
const http = require('http');

// 2. กำหนดช่องทาง (Port) ให้รองรับการทำงานบน Cloud เช่น Railway หรือดีฟอลต์พอร์ต 3000
const port = process.env.PORT || 3000;

// 3. สร้างเซิร์ฟเวอร์เพื่อคอยรับและตอบกลับคำขอของผู้ใช้งาน
const server = http.createServer((req, res) => {

    // ตรวจสอบและดักจับคำขอ Favicon เพื่อป้องกันเซิร์ฟเวอร์ทำงานซ้ำซ้อน
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 3.1 กำหนดรหัสสถานะเป็น 200 (ทำงานสำเร็จ)
    res.statusCode = 200;

    // 3.2 กำหนดให้ผลลัพธ์เป็นไฟล์ HTML รองรับภาษาไทย (utf-8)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    // 3.3 ส่งหน้าเว็บดีไซน์ธีม "Disneyland" สุดมหัศจรรย์กลับไป
    res.end(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Disneyland Magical Server</title>
    <!-- นำเข้าฟอนต์สไตล์เทพนิยายหรูหรา (Cinzel) และฟอนต์ภาษาไทยอ่านง่ายสะอาดตา (Sarabun) -->
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Sarabun:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        body {
            /* พื้นหลังไล่เฉดสีฟ้าครามค่ำคืนประดับละอองดาวสไตล์ดิสนีย์ */
            background: radial-gradient(circle at center, #1b263b 0%, #0d1b2a 100%);
            font-family: 'Sarabun', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            color: #333;
            overflow: hidden;
            position: relative;
        }

        /* เอฟเฟกต์แสงระยิบระยับเวทมนตร์ด้านหลัง */
        body::before {
            content: '✨';
            position: absolute;
            font-size: 2rem;
            color: rgba(212, 175, 55, 0.4);
            top: 15%;
            left: 20%;
            animation: float 4s ease-in-out infinite;
        }

        body::after {
            content: '⭐';
            position: absolute;
            font-size: 1.5rem;
            color: rgba(212, 175, 55, 0.4);
            bottom: 20%;
            right: 15%;
            animation: float 6s ease-in-out infinite alternate;
        }

        @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
            50% { transform: translateY(-15px) rotate(10deg); opacity: 1; }
            100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
        }

        /* การ์ดข้อมูลสไตล์เจ้าหญิงดิสนีย์ */
        .card {
            background-color: rgba(255, 255, 255, 0.96);
            border-radius: 24px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.3);
            padding: 40px 30px;
            text-align: center;
            max-width: 480px;
            width: 90%;
            border: 4px double #D4AF37; /* ขอบทองคู่หรูหรา */
            position: relative;
            box-sizing: border-box;
        }

        /* หัวการ์ดลายมิกกี้เมาส์เวทมนตร์สีทอง */
        .mickey-brand {
            display: flex;
            justify-content: center;
            position: relative;
            margin: 0 auto 10px;
            width: 80px;
            height: 65px;
        }

        .mickey-head {
            width: 46px;
            height: 46px;
            background: linear-gradient(135deg, #D4AF37, #AA7C11);
            border-radius: 50%;
            position: absolute;
            bottom: 0;
        }

        .mickey-ear-left {
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #D4AF37, #AA7C11);
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 8px;
        }

        .mickey-ear-right {
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #D4AF37, #AA7C11);
            border-radius: 50%;
            position: absolute;
            top: 2px;
            right: 8px;
        }

        /* ข้อความต้อนรับเวทมนตร์ */
        .magic-spell {
            font-family: 'Cinzel', serif;
            font-size: 1.4rem;
            font-weight: 700;
            color: #AA7C11;
            letter-spacing: 2px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        h1 {
            color: #1b263b;
            font-size: 1.6rem;
            margin: 10px 0 5px 0;
            font-weight: 600;
        }

        h2 {
            color: #003057;
            margin: 0 0 25px 0;
            font-size: 1.8rem;
            font-weight: 700;
            border-bottom: 2px dashed #E2E8F0;
            padding-bottom: 15px;
        }

        /* ข้อมูลของนักเรียน */
        .info-group {
            margin-bottom: 20px;
        }

        .info-text {
            font-size: 1.1rem;
            margin: 8px 0;
            color: #4a5568;
            display: flex;
            justify-content: space-between;
            padding: 5px 15px;
            background: #f7fafc;
            border-radius: 10px;
            border-left: 4px solid #D4AF37;
        }

        .info-label {
            font-weight: 600;
            color: #718096;
        }

        .highlight {
            color: #1b263b;
            font-weight: bold;
        }

        /* แถบสถานะระบบ */
        .status {
            background: linear-gradient(135deg, #0d1b2a, #1b263b);
            color: #fff;
            padding: 12px 20px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: bold;
            font-size: 0.95rem;
            margin-top: 20px;
            box-shadow: 0 4px 15px rgba(27, 38, 59, 0.3);
            border: 1px solid #D4AF37;
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
        }

        .status::before {
            content: '🏰';
            font-size: 1.2rem;
        }
    </style>
</head>
<body>

    <div class="card">
        <!-- สัญลักษณ์ Mickey Mouse ตกแต่งด้านบนการ์ด -->
        <div class="mickey-brand">
            <div class="mickey-ear-left"></div>
            <div class="mickey-ear-right"></div>
            <div class="mickey-head"></div>
        </div>
        
        <div class="magic-spell">✨ Bippity Boppity Boo! ✨</div>
        <h1>ยินดีต้อนรับสู่ Web Server ของ</h1>
        <h2>นางสาวณัฐชา พิมพ์ทวด</h2>
        
        <div class="info-group">
            <div class="info-text">
                <span class="info-label">รหัสนักศึกษา:</span>
                <span class="highlight">69319010047</span>
            </div>
            <div class="info-text">
                <span class="info-label">ระดับชั้น:</span>
                <span class="highlight">HIT.1/1 (VB)</span>
            </div>
            <div class="info-text">
                <span class="info-label">สาขา:</span>
                <span class="highlight">เทคโนโลยีสารสนเทศ</span>
            </div>
        </div>
        
        <div class="status">ดินแดนเวทมนตร์บนระบบ Railway เปิดทำงานปกติแล้วค่ะ!</div>
    </div>

</body>
</html>
    `);

});

// 4. สั่งให้เซิร์ฟเวอร์เริ่มต้นเปิดรับฟังการทำงานตาม Port ที่กำหนดไว้
server.listen(port, () => {
    console.log(`✨ Magical Server is running! ดินแดนดิสนีย์แลนด์เปิดใช้งานแล้วที่ช่องทางพอร์ต: ${port}`);
});
