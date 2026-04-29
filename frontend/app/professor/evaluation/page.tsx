"use client";

import Image from "next/image";
import { useState } from "react";

interface ParticipantRating {
  id: string;
  clarity: "clear" | "unclear" | null;
  progress: number;
}

export default function EvaluationPage() {
  const [participants, setParticipants] = useState<ParticipantRating[]>([
    { id: "P01", clarity: "clear", progress: 50 },
    { id: "P02", clarity: null, progress: 100 },
  ]);

  const handleClarityChange = (participantId: string, clarity: "clear" | "unclear") => {
    setParticipants(
      participants.map((p) =>
        p.id === participantId ? { ...p, clarity } : p
      )
    );
  };

  const handleSubmit = () => {
    console.log("Ratings submitted:", participants);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-[390px] mx-auto bg-white font-sans">
      {/* Logo */}
      <div className="w-full flex justify-end pt-8 pr-8">
        <Image src="/picture/logo.png" alt="Logo" width={40} height={49} />
      </div>

      {/* Content */}
      <main className="flex flex-col items-center flex-1 w-full px-6 pt-6 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Expert Evaluation</h1>
          <p className="text-base text-zinc-600">Speech Intelligibility & Clarity Assessment</p>
        </div>

        {/* Participants Section */}
        <div className="w-full space-y-8">
          {participants.map((participant) => (
            <div key={participant.id} className="w-full">
              {/* Participant ID */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[#7C2AE8]">Participant ID: {participant.id}</h2>
                <button className="w-8 h-8 rounded-full border-2 border-[#7C2AE8] flex items-center justify-center hover:bg-purple-50">
                  <span className="text-[#7C2AE8] text-lg">▶</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-purple-200 rounded-full h-3 mb-6">
                <div
                  className="bg-[#7C2AE8] h-3 rounded-full transition-all"
                  style={{ width: `${participant.progress}%` }}
                ></div>
              </div>

              {/* Radio Options */}
              <div className="space-y-4">
                {/* Clear Option */}
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id={`clear-${participant.id}`}
                    name={`clarity-${participant.id}`}
                    checked={participant.clarity === "clear"}
                    onChange={() => handleClarityChange(participant.id, "clear")}
                    className="w-5 h-5 mt-1 cursor-pointer"
                  />
                  <label htmlFor={`clear-${participant.id}`} className="cursor-pointer flex-1">
                    <div className="font-semibold text-black mb-1">Clear (High Clarity)</div>
                    <div className="text-xs text-zinc-600 leading-relaxed">
                      Description: Speech is mostly intelligible with accurate pronunciation and standard word stress. Minor accents are acceptable if they do not impede understanding.
                    </div>
                  </label>
                </div>

                {/* Unclear Option */}
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id={`unclear-${participant.id}`}
                    name={`clarity-${participant.id}`}
                    checked={participant.clarity === "unclear"}
                    onChange={() => handleClarityChange(participant.id, "unclear")}
                    className="w-5 h-5 mt-1 cursor-pointer"
                  />
                  <label htmlFor={`unclear-${participant.id}`} className="cursor-pointer flex-1">
                    <div className="font-semibold text-black mb-1">Unclear (Low Clarity)</div>
                    <div className="text-xs text-zinc-600 leading-relaxed">
                      Description: Speech is difficult to understand due to significant mispronunciation, slurring, or missing final consonants. Requires high effort from the listener to comprehend.
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="w-full flex justify-end mt-8">
          <button
            onClick={handleSubmit}
            className="w-32 h-12 bg-[#7C2AE8] text-white text-lg font-medium rounded-lg hover:bg-[#6a23c8] transition-colors shadow-md"
          >
            submit
          </button>
        </div>
      </main>
    </div>
  );
}
