"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WarningModal from "@/app/components/WarningModal";

export default function ProfessorPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "" });

  useEffect(() => {
    const token = localStorage.getItem("professorToken");
    if (token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${apiUrl}/api/professor/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.ok) router.push("/professor/evaluation");
        else {
          localStorage.removeItem("professorToken");
          setIsVerifying(false);
        }
      }).catch(() => {
        localStorage.removeItem("professorToken");
        setIsVerifying(false);
      });
    } else {
      setIsVerifying(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const response = await fetch(`${apiUrl}/api/professor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("professorToken", data.data.token);
        localStorage.setItem("professorId", data.data.id);
        router.push("/professor/evaluation");
      } else {
        const errorData = await response.json();
        setModalConfig({ isOpen: true, title: "Login Failed", message: errorData.message || "Invalid password" });
        setIsLoading(false);
      }
    } catch (err) {
      setModalConfig({ isOpen: true, title: "Network Error", message: "Could not connect to the server." });
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-md mx-auto bg-white font-sans">
        <div>Verifying...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-md mx-auto bg-white font-sans">
      <WarningModal 
        isOpen={modalConfig.isOpen} 
        title={modalConfig.title} 
        message={modalConfig.message} 
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />

      <div className="w-full flex justify-end pt-8 pr-8">
        <Image src="/picture/logo.png" alt="Logo" width={40} height={49} />
      </div>

      <main className="flex flex-col items-center flex-1 w-full px-6 pt-2 pb-8">
        <div className="mt-4 w-full">
          <div className="text-2xl font-bold text-black text-center leading-tight mb-6">
            Instruction for Expert
          </div>
        
          <div className="text-sm text-black mb-4 mx-auto mt-4 text-center">
            <p className="mb-2">Please listen to the recording of each participant and rate their Clarity and Intelligibility. Focus on their pronunciation, word stress, and final consonants.</p>
            <p>Your rating will be used to classify participants into High/Low clarity groups for our ASR research.</p>
          </div>

          <div className="text-sm text-black mb-8 mx-auto text-center">
            <p>คำแนะนำ: โปรดฟังเสียงและประเมินความชัดเจน โดยเน้นการออกเสียง การสงค์หมายเหนือและเสียงที่ท้ายคำ คะแนนของท่านจะใช้ในการแบ่งกลุ่มผู้เข้าร่วมออกสู่กลุ่มสำเร็จการวิจัย</p>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
            <div className="w-full mt-6">
              <label className="block text-m font-medium text-black mb-3 text-left">
                Fill the password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-10 bg-purple-100 rounded-lg px-4 pr-10 text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full h-10 bg-[#7C2AE8] text-white text-sm font-medium rounded-lg hover:bg-[#6a23c8] transition-colors disabled:opacity-50 mt-4"
            >
              {isLoading ? "Logging in..." : "Enter"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}