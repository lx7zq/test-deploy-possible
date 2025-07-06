import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LineCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("กำลังเชื่อมต่อกับ LINE...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    
    if (code) {
      setStatus("กำลังขอข้อมูลจาก LINE...");
      
      // เรียก backend เพื่อขอ userId LINE
      axios
        .get(`https://test-deploy-back-hlov.onrender.com/api/v1/auth/line/callback?code=${code}`)
        .then(async (res) => {
          const { lineUserId } = res.data;
          setStatus("กำลังผูกบัญชี LINE กับโปรไฟล์...");
          
          // ส่ง userId นี้ไปผูกกับ user ที่ล็อกอินในระบบ
          await axios.post(
            "https://test-deploy-back-hlov.onrender.com/api/v1/auth/line/save-line-userid",
            { lineUserId },
            { withCredentials: true }
          );
          
          setStatus("เชื่อมบัญชี LINE สำเร็จ!");
          setTimeout(() => {
            navigate("/profile");
          }, 2000);
        })
        .catch((error) => {
          console.error("Error:", error);
          setStatus("เกิดข้อผิดพลาดในการเชื่อมต่อ LINE");
          setTimeout(() => {
            navigate("/profile");
          }, 3000);
        });
    } else {
      setStatus("ไม่พบข้อมูลการเชื่อมต่อ");
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          LINE Login
        </h2>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
};

export default LineCallback; 