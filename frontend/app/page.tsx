"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-md mx-auto bg-white font-sans">
      <div className="w-full flex justify-end pt-8 pr-8">
        <Image src="/picture/logo.png" alt="Logo" width={40} height={49} />
      </div>
      <main className="flex flex-col items-center flex-1 w-full px-6 pt-2 pb-8">
        <div className="text-center mt-4">
          <div className="text-lg font-normal text-zinc-700 mb-1">Research Project Title</div>
          <div className="text-xl font-bold text-black leading-tight mb-4">
            An Analysis of Speech Recognition<br />
            Inequity: The Impact of Speech<br />
            Clarity on User Experience
          </div>
        </div>
        <div className="text-sm text-zinc-600 mb-8 max-w-xs mx-auto mt-4 pb-8 text-center">
            This research study explores the performance of Automated Speech Recognition (ASR) technology across diverse speaking profiles. We aim to understand how speech clarity and linguistic background influence AI accuracy. Your participation will contribute to creating more inclusive voice technology for everyone.
          </div>
        <button
          className="w-[320px] h-[64px] bg-[#7C2AE8] text-white text-2xl font-medium rounded-full mb-3 shadow-md hover:bg-[#6a23c8] transition-colors"
          onClick={() => router.push("/login")}
        >
          Start Evaluation
        </button>
        <a
          href="#"
          className="text-[#4F46E5] text-base font-medium underline mb-8 hover:text-[#6a23c8]"
          onClick={(e) => {
               e.preventDefault();
               router.push("/professor");
          }}
        >
          [Access for Expert Validation]
        </a>
        <div className="text-xs text-zinc-500 text-center mt-auto mb-2 max-w-xs mx-auto">
          This website is a part of the research project for HCI and Generative AI: Practical Research and Case Studies
        </div>
        <div className="text-xs text-zinc-400 text-center mt-2">Produced by: Group 3-S</div>
      </main>
    </div>
  );
}