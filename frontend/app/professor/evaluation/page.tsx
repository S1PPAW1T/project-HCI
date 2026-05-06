"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Participant {
  id: string;
  name: string;
  age: number;
  audioUrl: string;
  clarity: "clear" | "unclear" | null;
}

export default function EvaluationPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const itemsPerPage = 2;

  useEffect(() => {
    const token = localStorage.getItem("professorToken");
    if (!token) {
      router.push("/professor");
      return;
    }
    fetch(`${apiUrl}/api/professor/participants`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      const loadedParticipants = data.data || [];
      setParticipants(loadedParticipants);
      setProgress(data.progress || 0);
      const firstUnratedIndex = loadedParticipants.findIndex((p: Participant) => p.clarity === null);
      if (firstUnratedIndex >= 0) {
        setCurrentPage(Math.floor(firstUnratedIndex / itemsPerPage));
      } else {
        setCurrentPage(0);
      }
      setIsLoading(false);
    }).catch(() => {
      localStorage.removeItem("professorToken");
      router.push("/professor");
    });
  }, [router, apiUrl]);

  const handleClarityChange = (participantId: string, clarity: "clear" | "unclear") => {
    const prevClarity = participants.find(p => p.id === participantId)?.clarity;
    setParticipants(participants.map(p => p.id === participantId ? { ...p, clarity } : p));
    const token = localStorage.getItem("professorToken");
    fetch(`${apiUrl}/api/professor/rating`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ participantId, clarity }),
    }).then(res => {
      if (!res.ok) {
        // revert
        setParticipants(participants.map(p => p.id === participantId ? { ...p, clarity: prevClarity || null } : p));
        alert("Failed to submit rating");
      } else {
        // update progress if new
        if (prevClarity === null) {
          setProgress(prev => prev + 1);
        }
      }
    }).catch(() => {
      setParticipants(participants.map(p => p.id === participantId ? { ...p, clarity: prevClarity || null } : p));
      alert("Failed to submit rating");
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[844px] w-[390px] mx-auto bg-white font-sans">
        <div>Loading...</div>
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
      <main className="flex flex-col items-center flex-1 w-full px-6 pt-6 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Expert Evaluation</h1>
          <p className="text-base text-zinc-600">Progress: {progress} / {participants.length}</p>
          <div className="w-full bg-purple-200 rounded-full h-3 mt-2">
            <div
              className="bg-[#B47FDC] h-3 rounded-full transition-all"
              style={{ width: `${participants.length > 0 ? (progress / participants.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Participants Section */}
        {(() => {
          const totalPages = Math.ceil(participants.length / itemsPerPage);
          const displayedParticipants = participants.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
          return (
            <>
              <div className="w-full space-y-8">
                {displayedParticipants.map((participant) => (
                  <div key={participant.id} className="w-full">
                    {/* Participant ID */}
                    <h2 className="text-base font-bold text-[#7018B3]">
                      Participant ID: {participant.id}
                    </h2>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-purple-200 rounded-full h-3">
                        <div
                          className="bg-[#B47FDC] h-3 rounded-full"
                          style={{ width: `${participant.clarity ? 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Audio Player */}
                    {participant.audioUrl ? (
                      <div className="mb-4">
                        <audio
                          controls
                          className="w-full rounded-xl bg-white border border-gray-200"
                          src={participant.audioUrl}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ) : (
                      <div className="mb-4 text-sm text-red-500">No audio available</div>
                    )}

                    

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
                          <div className="text-xs text-zinc-600 leading-relaxed grid grid-cols-[60px_1fr] gap-4">
                            <span>Description:</span>
                            <span>Speech is mostly intelligible with accurate pronunciation and standard word stress. Minor accents are acceptable if they do not impede understanding.
                            </span>
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
                          <div className="text-xs text-zinc-600 leading-relaxed grid grid-cols-[60px_1fr] gap-4">
                            <span>Description:</span>
                            <span>Speech is difficult to understand due to significant mispronunciation, slurring, or missing final consonants. Requires high effort from the listener to comprehend.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="w-full flex flex-col items-center gap-3 mt-8">
                <div className="w-full flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage + 1} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <div className="w-full flex flex-wrap justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`px-3 py-2 rounded-lg border ${currentPage === index ? "border-[#7C2AE8] bg-[#7C2AE8] text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="w-full flex justify-center mt-4">
                <button
                  onClick={() => {
                    localStorage.removeItem("professorToken");
                    localStorage.removeItem("professorId");
                    router.push("/");
                  }}
                  className="px-6 py-3 bg-[#7C2AE8] text-white text-lg font-medium rounded-lg hover:bg-[#6a23c8] transition-colors"
                >
                  Save Progress
                </button>
              </div>
            </>
          );
        })()}
      </main>
    </div>
  );
}
