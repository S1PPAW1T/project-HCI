"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showConsent, setShowConsent] = useState(false);
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[844px] w-[390px] mx-auto bg-white font-sans">
      {/* Logo */}
      <div className="w-full flex justify-end pt-8 pr-8">
        <Image src="/picture/logo.png" alt="Logo" width={40} height={49} />
      </div>
      {/* Content */}
      <main className="flex flex-col items-center flex-1 w-full px-6 pt-2 pb-8">
        <div className="text-center mt-4">
          <div className="text-lg font-normal text-zinc-700 mb-1">Research Project Title</div>
          <div className="text-xl font-bold text-black leading-tight mb-4">
            An Analysis of Speech Recognition<br />
            Inequity: The Impact of Speech<br />
            Clarity on User Experience
          </div>
        </div>
        <div className="text-sm text-zinc-600 mb-8 max-w-xs mx-auto mt-4 pb-8">
            This research study explores the performance of Automated Speech Recognition (ASR) technology across diverse speaking profiles. We aim to understand how speech clarity and linguistic background influence AI accuracy. Your participation will contribute to creating more inclusive voice technology for everyone.
          </div>
        {/* Main Button */}
        <button
          className="w-[320px] h-[64px] bg-[#7C2AE8] text-white text-2xl font-medium rounded-full mb-3 shadow-md hover:bg-[#6a23c8] transition-colors"
          onClick={() => setShowConsent(true)}
        >
          เริ่มทำแบบประเมิน
        </button>
        {/* Secondary Link */}
        <a
          href="#"
          className="text-[#4F46E5] text-base font-medium underline mb-8 hover:text-[#6a23c8]"
          onClick={() => {
               setShowConsent(false);
               router.push("/login");
          }}
        >
          [สำหรับผู้เชี่ยวชาญด้านภาษากรุณาคลิกที่นี่]
        </a>
        {/* Footer */}
        <div className="text-xs text-zinc-500 text-center mt-36 mb-2 max-w-xs mx-auto">
          This website is a part of the research project for HCI and Generative AI: Practical Research and Case Studies
        </div>
        <div className="text-xs text-zinc-400 text-center mt-2">Produced by: Group 3-S</div>
      </main>

      {/* Consent Popup Modal */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-4xl shadow-lg p-8 w-[320px] relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 bg-[#E6CAFB] text-[#FFFFFF] hover:text-[#E6CAFB] text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#7C2AE8]"
              onClick={() => setShowConsent(false)}
              aria-label="Close"
            >
              ×
            </button>

            {/* Content */}
            <div className="mt-2">
              <ul className="text-sm text-gray-700 mb-6 space-y-3 list-disc pl-5 text-left">
                <li>I understand that my voice will be recorded for research purposes.</li>
                <li>My data will remain anonymous and be stored securely for academic use only.</li>
                <li>I can withdraw from the study at any time without any penalty.</li>
              </ul>
            </div>

            {/* Button */}
            <button
               className="w-full h-12 bg-[#7C2AE8] text-white text-base font-medium rounded-lg hover:bg-[#6a23c8] transition-colors"
               onClick={() => {
               setShowConsent(false);
               router.push("/login");
  }}
            >
              I AGREE & START
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
