"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfessorPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("professorToken");
    if (token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${apiUrl}/api/professor/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.ok) {
          router.push("/professor/evaluation");
        } else {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("professorToken", data.data.token);
        localStorage.setItem("professorId", data.data.id);
        router.push("/professor/evaluation");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Login failed");
        setIsLoading(false);
      }
    } catch (err) {
      alert("Network error");
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[844px] w-[390px] mx-auto bg-white font-sans">
        <div>Verifying...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[844px] w-[390px] mx-auto bg-white font-sans">
      {/* Logo */}
      <div className="w-full flex justify-end pt-8 pr-8">
        <Image src="/picture/logo.png" alt="Logo" width={40} height={49} />
      </div>

      {/* Content */}
      <main className="flex flex-col items-center flex-1 w-full px-6 pt-2 pb-8">
        <div className="mt-4">
          {/* Title */}
          <div className="text-2xl font-bold text-black text-center leading-tight mb-6">
            Instruction for Expert
          </div>
        
          {/* Instructions - English */}
          <div className="text-sm text-black mb-4 max-w-xs mx-auto mt-4">
            <p>
              Please listen to the recording of each participant and rate their Clarity and Intelligibility. Focus on their pronunciation, word stress, and final consonants.
            </p>
            <p>
              Your rating will be used to classify participants into High/Low clarity groups for our ASR research.
            </p>
          </div>

          {/* Instructions - Thai */}
          <div className="text-sm text-black mb-8 max-w-xs mx-auto">
            <p>
              คำแนะนำ: โปรดฟังเสียงและประเมินความชัดเจน โดยเน้นการออกเสียง การสงค์หมายเหนือและเสียงที่ท้ายคำ คะแนนของท่านจะใช้ในการแบ่งกลุ่มผู้เข้าร่วมออกสู่กลุ่มสำเร็จการวิจัย
            </p>
          </div>
          
          {/* Password Field */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
            <div className="w-full max-w-xs mt-6">
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
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894l4.293 4.293m-4.293-4.293a10.43 10.43 0 01-1.932 2.125" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Enter Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-20 h-10 bg-[#7C2AE8] text-white text-sm font-medium rounded-lg hover:bg-[#6a23c8] transition-colors disabled:opacity-50 mt-2 self-end mr-0"
            >
              {isLoading ? "Logging in..." : "Enter"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
