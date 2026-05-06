"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestStimuliPage() {
  const router = useRouter();
  const [currentTask, setCurrentTask] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [transcribedText, setTranscribedText] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [ratings, setRatings] = useState({});
  const [audioUrl, setAudioUrl] = useState(""); // Store audio URL from Firebase
  const [modelResults, setModelResults] = useState<{
    assembly: string;
    whisper: string;
    deepgram: string;
  } | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  // 💡 State สำหรับการ์ดแจ้งเตือน
  const [showWarning, setShowWarning] = useState(false);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("idle"); // idle, recording, recorded, uploaded, error
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const getTaskPrompt = () => {
    if (currentTask === 1) {
      return "Last Thursday, I requested a new project task. My boss asked if the finished report was fixed and uploaded. Specifically, I processed the data twice to ensure the results were accurate. If the system crashes again, we might miss the deadline, and the entire business will suffer.";
    }
    if (currentTask === 2) {
      return "Please sit in the correct seat before we begin. I need to ship the sheep to the island by noon. It is a great opportunity to improve my leadership skills. If we slip on the floor, we might sleep in the hospital tonight.";
    }
    if (currentTask === 3) {
      return "The photographer took many photographs for the biography section. We must evaluate the economic situation immediately. He was comfortable with the technology, but the delivery was delayed. It is necessary to communicate with the entire community.";
    }
    if (currentTask === 4) {
      return "The strong structure of the bridge attracts many strangers. We brought three fresh fruits from the street market. It starts at eight o'clock sharp. Please don't forget to check the clocks and spring into action.";
    }
    if (currentTask === 5) {
      return "I can't understand why he shouldn't accept the offer. Actually, specifically, it wasn't available yesterday. The quality of the product doesn't match the description. We mustn't ignore the problem, or it won't be solved easily.";
    }
    return "";
  };

  const normalizeWord = (text: string) => text.toLowerCase().replace(/^[^a-z0-9ก-๙]+|[^a-z0-9ก-๙]+$/gi, "");

  const renderComparedText = (original: string, transcript: string) => {
    const safeOriginal = original || "";
    const safeTranscript = transcript || "";

    const originalWords = safeOriginal.split(/\s+/).map((word) => normalizeWord(word)).filter(Boolean);
    const transcriptWords = safeTranscript.split(/\s+/).map((word) => ({ raw: word, normalized: normalizeWord(word) })).filter((item) => item.normalized);

    const m = originalWords.length;
    const n = transcriptWords.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i += 1) {
      for (let j = 1; j <= n; j += 1) {
        if (originalWords[i - 1] === transcriptWords[j - 1].normalized) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const matchedIndices = new Set<number>();
    let i = m;
    let j = n;
    while (i > 0 && j > 0) {
      if (originalWords[i - 1] === transcriptWords[j - 1].normalized) {
        matchedIndices.add(j - 1);
        i -= 1;
        j -= 1;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i -= 1;
      } else {
        j -= 1;
      }
    }

    return transcriptWords.map((word, index) => {
      const isWrong = !matchedIndices.has(index);
      return (
        <span key={`${word.raw}-${index}`} className={isWrong ? "text-blue-900 font-semibold" : "text-black"}>
          {word.raw}{" "}
        </span>
      );
    });
  };

  const getModelTitle = () => {
    if (currentPage === 2) return "Deepgram";
    if (currentPage === 3) return "OpenAI Whisper";
    if (currentPage === 4) return "AssemblyAI";
    return "";
  };

  const getModelResultText = () => {
    if (!modelResults) return "Loading transcription... Please wait.";
    if (currentPage === 2) return modelResults.deepgram;
    if (currentPage === 3) return modelResults.whisper;
    if (currentPage === 4) return modelResults.assembly;
    return "";
  };  
  
  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const totalTasks = 5;
  const totalPages = 4;

  const reviewQuestions = [
    "The system accurately recognized my speech.",
    "I felt frustrated when the system misunderstood my speech.",
    "Errors made me feel that the system was unreliable.",
    "I think my accent affected how well the system understood me."
  ];

  // Check if user is logged in on component mount
  useEffect(() => {
    const sessionId = localStorage.getItem("audioSessionId");
    if (!sessionId) {
      router.push("/login");
    }
  }, [router]);

  // Scroll to top when user navigates between pages or tasks
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, currentTask]);

  useEffect(() => {
    if (currentPage === 1) {
      setShowOriginal(false);
    }
  }, [currentPage]);

  const handleMicrophoneClick = async () => {
    try {
      if (isRecording) {
        // Stop recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setIsRecording(false);
        setRecordingStatus("recorded");
      } else {
        // Start recording (ลดขนาดไฟล์ด้วย 16kHz Mono)
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1
          } 
        });
        streamRef.current = stream;
        
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = []; // Clear previous recording

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstart = () => {
          setIsRecording(true);
          setRecordingStatus("recording");
          setUploadError("");
        };

        mediaRecorder.onstop = () => {
          setIsRecording(false);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      }
    } catch (error) {
      console.error("Microphone error:", error);
      setUploadError("Microphone access denied. Please allow microphone permission.");
      setRecordingStatus("error");
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      const nextPage = currentPage - 1;
      setCurrentPage(nextPage);

      if (nextPage === 1) {
        setRecordingStatus("idle");
        setUploadError("");
        setIsUploading(false);
        setModelResults(null);
        setTranscribedText("");
        audioChunksRef.current = [];
      }
    }
  };

  const handleNext = async () => {
    // 🛡️ ระบบตรวจสอบ: ต้องให้คะแนนครบทุกข้อก่อนในหน้า 2, 3, 4
    if (currentPage > 1) {
      const modelKey = getModelKey();
      
      const isAllRated = reviewQuestions.every((_, index) => {
        const key = `task${currentTask}_${modelKey}_q${index}`;
        return (ratings as Record<string, number>)[key] && (ratings as Record<string, number>)[key] > 0;
      });

      if (!isAllRated) {
        // 💡 เรียกเปิดการ์ดแจ้งเตือนแทนการใช้ alert()
        setShowWarning(true);
        return; 
      }
    }

    // Stop recording if still active
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsRecording(false);
    }

    // Upload audio for all tasks on page 1
    if (currentPage === 1) {
      await uploadAudio();
      return; // Don't proceed until upload completes
    }

    // Normal navigation for pages 2+
    if (currentTask === totalTasks && currentPage === totalPages) {
      setShowThankYou(true);
    } else if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (currentTask < totalTasks) {
      setCurrentTask(currentTask + 1);
      setCurrentPage(1);
      setTranscribedText("");
      setRecordingStatus("idle");
      setUploadError("");
      setModelResults(null); // Reset model results for new task
    }
  };

  const uploadAudio = async () => {
    if (audioChunksRef.current.length === 0) {
      setUploadError("No recording to upload. Please record audio first.");
      setRecordingStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const sessionId = localStorage.getItem("audioSessionId");
      if (!sessionId) {
        throw new Error("No active session. Please login again.");
      }

      // ใช้ไฟล์รูปแบบดั้งเดิมเพื่อความเร็ว และรองรับเบราว์เซอร์
      const audioBlob = new Blob(audioChunksRef.current);
      const isMp4 = audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a');
      const fileExt = isMp4 ? 'mp4' : 'webm';

      const formData = new FormData();
      formData.append("id", sessionId);
      formData.append("task", currentTask.toString()); 
      formData.append("audio", audioBlob, `task${currentTask}.${fileExt}`);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/audio/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      console.log("Audio uploaded successfully:", data);
      
      // Store the audio URL from Firebase if available
      if (data.data.audioUrl) {
        setAudioUrl(data.data.audioUrl);
        localStorage.setItem(`audioUrl_task${currentTask}`, data.data.audioUrl);
      }

      // If transcription results are included, store them for display
      if (data.data.models) {
        setModelResults({
          assembly: data.data.models.assembly,
          whisper: data.data.models.whisper,
          deepgram: data.data.models.deepgram,
        });

        // Show the assembly result by default as the first model page
        setTranscribedText(data.data.models.assembly);
      } else if (currentTask === 1) {
        setTranscribedText(`Audio uploaded successfully!\n\nName: ${data.data.name}\nAge: ${data.data.age}`);
      }
      
      console.log("Audio processed:", data);

      // Handle different task responses
      if (currentTask === 1) {
        setTranscribedText(`Audio uploaded successfully!\n\nName: ${data.data.name}\nAge: ${data.data.age}`);
      } else {
        setTranscribedText(`Task ${currentTask} - Speech to Text:\n\n"${data.data.text}"`);
      }

      setRecordingStatus("uploaded");

      // Proceed to next page after successful upload
      setTimeout(() => {
        if (currentPage < totalPages) {
          setCurrentPage(currentPage + 1);
        } else if (currentTask < totalTasks) {
          setCurrentTask(currentTask + 1);
          setCurrentPage(1);
          setRecordingStatus("idle");
          setUploadError("");
          setModelResults(null); 
          audioChunksRef.current = [];
        }
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setUploadError(errorMsg);
      setRecordingStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReturnHome = async () => {
    try {
      const sessionId = localStorage.getItem("audioSessionId");
      if (!sessionId) {
        router.push("/");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/audio/${sessionId}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ratings: ratings,
        }),
      });

      if (!response.ok) {
        console.warn("Failed to save ratings, but continuing...");
      }

      router.push("/");
    } catch (error) {
      console.error("Error saving ratings:", error);
      router.push("/");
    }
  };

  const getModelKey = () => {
    if (currentPage === 2) return "deepgram";
    if (currentPage === 3) return "whisper";
    if (currentPage === 4) return "assembly";
    return "task";
  };

  const handleStarRating = (questionIndex: number, rating: number) => {
    const ratingKey = `task${currentTask}_${getModelKey()}_q${questionIndex}`;
    setRatings(prev => ({
      ...prev,
      [ratingKey]: rating,
    }));
  };

  const renderStars = (questionIndex: number) => {
    const ratingKey = `task${currentTask}_${getModelKey()}_q${questionIndex}`;
    const currentRating = (ratings as Record<string, number>)[ratingKey] || 0;
    
    return (
      <div className="flex gap-1 justify-center my-2 items-center px-4">
        <span className="text-xl px-2">👎</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarRating(questionIndex, star)}
            className={`text-2xl px-2 transition-transform hover:scale-110 ${
              star <= currentRating ? "text-purple-300" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
        <span className="text-xl px-2">👍</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-[390px] mx-auto bg-white font-sans relative">
      
      {/* 💡 การ์ดแจ้งเตือน (Warning Modal) */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border-t-4 border-[#7C2AE8] transform transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-bold text-gray-900 text-lg">Action Required</h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 text-sm mb-1">
                Please rate all questions before proceeding.
              </p>
            </div>
            <button 
              onClick={() => setShowWarning(false)}
              className="w-full bg-[#7C2AE8] text-white rounded-lg py-2.5 font-semibold hover:bg-[#6a23c8] transition-colors shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="w-full flex justify-end pt-8 pr-8">
        <Image src="/picture/logo.png" alt="Logo" width={40} height={49} />
      </div>

      {/* Content */}
      <main className="flex flex-col items-center flex-1 w-full px-6 pt-6 pb-8 overflow-y-auto">
        {showThankYou ? (
          <>
            <h1 className="text-4xl font-bold text-black mb-8 text-center">Thank You!</h1>
            <p className="text-lg text-black text-center mb-8">
              Thank you for completing all the tasks. Your responses have been recorded.
            </p>
            <p className="text-sm text-zinc-600 text-center mb-12">
              Your speech recordings and transcriptions have been saved.
            </p>
            <button
              onClick={handleReturnHome}
              className="w-40 h-12 bg-[#7C2AE8] text-white text-lg font-semibold rounded-lg hover:bg-[#6a23c8] transition-colors shadow-lg"
            >
              Return to Home
            </button>
          </>
        ) : (
          <>
            {/* Title */}
            <h1 className="text-3xl font-bold text-black mb-8">Test Stimuli</h1>

            {/* Progress Bars */}
            <div className="w-full max-w-sm mb-8">
          {/* Task Progress */}
          <div className="mb-4">
            <div className="text-sm font-semibold text-black mb-2">
              Task {currentTask} of {totalTasks}
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-[#7C2AE8] h-2 rounded-full transition-all"
                style={{ width: `${(currentTask / totalTasks) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Page Progress */}
          <div className="flex flex-row items-center mb-2">
            <div className="text-xs text-black min-w-fit px-4">
              Page {currentPage} of {totalPages}
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-[#7C2AE8] h-2 rounded-full transition-all"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Result Model Button - Pages 2-4 */}
        {currentPage > 1 && (
          <div className="mr-auto mb-6">
            <div className="flex flex-col gap-2">
              <div>
                <h2 className="text-lg text-purple-800 font-semibold">
                  {getModelTitle()}
                </h2>
                <p className="text-sm text-gray-600">
                  Model {currentPage - 1} of 3
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOriginal((prev) => !prev)}
                className="self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {showOriginal ? "Hide Original" : "Show Original"}
              </button>
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className="w-full max-w-sm mb-8">
          {currentPage === 1 ? (
            <p className="text-m text-black leading-relaxed text-justify">
              {getTaskPrompt()}
            </p>
          ) : (
            <div className="w-full space-y-4 relative">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-2">Speech-to-Text Result:</p>
                <p className="text-sm leading-relaxed">
                  {modelResults ? (
                    renderComparedText(getTaskPrompt(), getModelResultText())
                  ) : (
                    "Loading transcription... Please wait."
                  )}
                </p>
              </div>

              {isTranscribing && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-semibold">
                    ⏳ Transcribing audio with models...
                  </p>
                </div>
              )}

              {showOriginal && currentPage > 1 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                  <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Original sentence</p>
                        <p className="text-xs text-slate-500">Compare original text with the model result</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowOriginal(false)}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Close
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-900">
                      {getTaskPrompt()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Review Cards */}
              <div className="space-y-4">
                {reviewQuestions.map((question, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                    <p className="text-sm text-black mb-3 leading-relaxed">{question}</p>
                    {renderStars(index)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Please Note Section - Page 1 Only */}
        {currentPage === 1 && (
          <>
            <div className="w-full max-w-sm mb-8">
              <div className="text-xs font-semibold text-black mb-2">Please note:</div>
              <ul className="text-xs text-zinc-600 space-y-2 list-disc pl-5">
                <li>If you press the microphone button again, the system will start a new recording and overwrite the previous one.</li>
                <li>Click Next after recording to translate your audio.</li>
              </ul>
            </div>

            {/* Status Messages */}
            {recordingStatus === "recording" && (
              <div className="w-full max-w-sm bg-red-100 p-3 rounded-lg mb-4 text-center">
                <p className="text-sm text-red-800 font-semibold">🔴 Recording in progress... Press again to stop recording.</p>
              </div>
            )}

            {/* ซ่อนข้อความ Recording complete เมื่อกำลัง Translating */}
            {recordingStatus === "recorded" && !isUploading && (
              <div className="w-full max-w-sm bg-indigo-100 p-3 rounded-lg mb-4 text-center">
                <p className="text-sm text-indigo-800 font-semibold">✓ Recording complete. Press Next to translate.</p>
              </div>
            )}

            {recordingStatus === "uploaded" && (
              <div className="w-full max-w-sm bg-green-100 p-3 rounded-lg mb-4 text-center">
                <p className="text-sm text-green-800 font-semibold">✓ Audio translated successfully!</p>
              </div>
            )}

            {recordingStatus === "error" && (
              <div className="w-full max-w-sm bg-red-100 p-3 rounded-lg mb-4 text-center">
                <p className="text-sm text-red-800 font-semibold">✗ Error: {uploadError}</p>
              </div>
            )}

            {isUploading && (
              <div className="w-full max-w-sm bg-blue-100 p-3 rounded-lg mb-4 text-center">
                <p className="text-sm text-blue-800 font-semibold">⏳ Translating audio...</p>
              </div>
            )}

            {/* Microphone Button - Page 1 Only */}
            <button
              onClick={handleMicrophoneClick}
              disabled={isUploading}
              className={`w-48 h-48 rounded-full flex items-center justify-center mb-12 transition-all shadow-lg ${
                isRecording
                  ? "bg-red-300 hover:bg-red-400"
                  : "bg-gray-300 hover:bg-gray-400"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Image src="/picture/microphone.png" alt="Microphone" width={84} height={84} />
            </button>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex w-full justify-between items-center gap-3">
          {currentPage > 1 ? (
            <button
              onClick={handlePrevious}
              className="w-32 h-12 bg-gray-200 text-gray-800 text-m font-semibold rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
            >
              Previous
            </button>
          ) : (
            <div className="w-32" />
          )}

          <button
            onClick={handleNext}
            disabled={isUploading || isTranscribing || (currentTask === 1 && currentPage === 1 && isRecording)}
            className={`w-32 h-12 bg-[#7C2AE8] text-white text-m font-semibold rounded-lg hover:bg-[#6a23c8] transition-colors shadow-lg ${
              (isUploading || isTranscribing || (currentTask === 1 && currentPage === 1 && isRecording))
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isUploading ? "Translating..." : "Next"}
          </button>
        </div>
          </>
        )}
      </main>
    </div>
  );
}