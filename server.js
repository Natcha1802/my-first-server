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

    // 3.3 ส่งหน้าเว็บดีไซน์ธีม "Disneyland Princess" สุดมหัศจรรย์กลับไป
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

        /* โครมมิกกี้เจ้าหญิงชมพู */
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

        /* ข้อความต้อนรับเวทมนตร์ */
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
            text-shadow: 2px 2px 4px rgba(255, 182, 193, 0.2);
        }

        /* ข้อมูลของนักเรียน */
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
            border-right: 2px solid #ffb6d9;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .info-text::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: shine 3s ease-in-out infinite;
        }

        @keyframes shine {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
        }

        .info-text:hover {
            transform: translateX(8px) scale(1.02);
            box-shadow: 0 5px 20px rgba(255, 105, 180, 0.3);
        }

        .info-label {
            font-weight: 600;
            color: #db7093;
        }

        .highlight {
            color: #ff1493;
            font-weight: bold;
        }

        /* แถบสถานะระบบ */
        .status {
            background: linear-gradient(135deg, #ff69b4, #db7093);
            color: #fff;
            padding: 15px 25px;
            border-radius: 15px;
            display: inline-flex;
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

        /* ปุ่มปฏิสัมพันธ์ */
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
    </style>
</head>
<body>

    <!-- ดาวระยิบระยับด้านหลัง -->
    <div class="star">✨</div>
    <div class="star">⭐</div>
    <div class="star">✨</div>
    <div class="star">⭐</div>
    <div class="star">✨</div>

    <!-- ปุ่มเวทมนตร์ลอยสูง -->
    <div class="floating-orb orb-1"></div>
    <div class="floating-orb orb-2"></div>
    <div class="floating-orb orb-3"></div>

    <div class="card">
        <!-- สัญลักษณ์ Mickey Mouse เจ้าหญิงชมพู ตกแต่งด้านบนการ์ด -->
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
                <span class="info-label">🎓 รหัสนักศึกษา:</span>
                <span class="highlight">69319010047</span>
            </div>
            <div class="info-text">
                <span class="info-label">📚 ระดับชั้น:</span>
                <span class="highlight">HIT.1/1 (VB)</span>
            </div>
            <div class="info-text">
                <span class="info-label">💻 สาขา:</span>
                <span class="highlight">เทคโนโลยีสารสนเทศ</span>
            </div>
        </div>
       
        <div class="status">ดินแดนเวทมนตร์บนระบบ Railway เปิดทำงานปกติแล้วค่ะ! 👑</div>

        <button class="interactive-btn">✨ คลิกเพื่อต่อการเวทมนตร์ ✨</button>
    </div>

    <script>
        // เพิ่มเสียงและเอฟเฟกต์เมื่อคลิกปุ่ม
        document.querySelector('.interactive-btn').addEventListener('click', function() {
            // สร้างอนุภาคเล็กๆ ตกลงมา
            for (let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.pointerEvents = 'none';
                particle.textContent = ['✨', '💗', '⭐', '💖'][Math.floor(Math.random() * 4)];
                particle.style.fontSize = Math.random() * 20 + 20 + 'px';
                particle.style.left = this.offsetLeft + this.offsetWidth / 2 + 'px';
                particle.style.top = this.offsetTop + this.offsetHeight / 2 + 'px';
                particle.style.animation = \`particle-fall \${2 + Math.random()}s ease-out forwards\`;
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
                transform: translateY(300px) translateX(\${Math.random() * 200 - 100}px) scale(0);
                opacity: 0;
            }
        }
    </style>

</body>
</html>
    `);

});

// 4. สั่งให้เซิร์ฟเวอร์เริ่มต้นเปิดรับฟังการทำงานตาม Port ที่กำหนดไว้
server.listen(port, () => {
    console.log(`✨ Princess Magical Server is running! ดินแดนดิสนีย์แลนด์เจ้าหญิงเปิดใช้งานแล้วที่ช่องทางพอร์ต: ${port}`);
});
