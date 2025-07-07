import { useState } from "react";
import axios from "axios";

export default function BindLine() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleBind = async () => {
    try {
      const res = await axios.post(
        "/api/v1/auth/line/bind",
        { code },
        { withCredentials: true }
      );
      setMessage(res.data.message || "เชื่อมบัญชี LINE สำเร็จ");
    } catch (err) {
      setMessage(err.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2 style={{ marginBottom: 16 }}>เชื่อมบัญชี LINE</h2>
      <ol style={{ marginBottom: 16 }}>
        <li>1. แอดบอท LINE (สแกน QR Code ด้านล่าง)</li>
        <li>2. ทักแชทบอท (พิมพ์อะไรก็ได้)</li>
        <li>3. กรอกรหัสยืนยันที่ได้รับใน LINE ที่นี่</li>
      </ol>
      <input
        type="text"
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="กรอกรหัสยืนยัน 6 หลัก"
        style={{ width: "100%", padding: 8, marginBottom: 12, borderRadius: 4, border: "1px solid #ccc" }}
      />
      <button onClick={handleBind} style={{ width: "100%", padding: 10, background: "#06c755", color: "#fff", border: "none", borderRadius: 4, fontWeight: "bold" }}>
        เชื่อมบัญชี LINE
      </button>
      <div style={{ color: "green", marginTop: 12 }}>{message}</div>
      {/* แสดง QR Code ของบอท */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <a href="https://page.line.me/213kodby" target="_blank" rel="noopener noreferrer">
          <img src="https://scdn.line-apps.com/n/line_add_friends/btn/en.png" alt="เพิ่มเพื่อน LINE" style={{ width: 180, marginBottom: 8 }} />
        </a>
        <div style={{ fontSize: 12, color: "#888" }}>กดปุ่มหรือสแกน QR Code เพื่อเพิ่มเพื่อนบอท</div>
      </div>
    </div>
  );
} 