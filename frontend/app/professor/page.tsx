"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProfessorPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    console.log("Password submitted:", { password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[844px] w-[390px] mx-auto bg-white font-sans">
      {/* Logo */}
      <div className="w-full flex justify-end pt-8 pr-8">
        <Image src="/picture/logo.png" alt="Logo" width={40} height={49} />
      </div>

      {/* Content */}
      <main className="flex flex-col items-center justify-center flex-1 w-full px-6 pt-2 pb-8">
        <div className="text-center mt-4">
          {/* Title */}
          <div className="text-2xl font-bold text-black leading-tight mb-6">
            Instruction for Expert
          </div>

          {/* Instructions - English */}
          <div className="text-sm text-zinc-700 mb-6 max-w-xs mx-auto">
            <p className="mb-4">
              Please listen to the recording of each participant and rate their Clarity and Intelligibility. Focus on their pronunciation, word stress, and final consonants.
            </p>
            <p>
              Your rating will be used to classify participants into High/Low clarity groups for our ASR research.
            </p>
          </div>

          {/* Instructions - Thai */}
          <div className="text-sm text-zinc-600 mb-8 max-w-xs mx-auto">
            <p>
              คำแนะนำ: โปรดฟังเสียงและประเมินความชัดเจน โดยเน้นการออกเสียง การสงค์หมายเหนือและเสียงที่ท้ายคำ คะแนนของท่านจะใช้ในการแบ่งกลุ่มผู้เข้าร่วมออกสู่กลุ่มสำเร็จการวิจัย
            </p>
          </div>

          {/* Password Field */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
            <div className="w-full max-w-xs">
              <label className="block text-sm font-medium text-zinc-700 mb-3 text-left">
                fill the password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full h-10 bg-purple-100 rounded-lg px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Enter Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-24 h-10 bg-[#7C2AE8] text-white text-sm font-medium rounded-lg hover:bg-[#6a23c8] transition-colors disabled:opacity-50 mt-2 self-end mr-0"
            >
              {isLoading ? "..." : "enter"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
