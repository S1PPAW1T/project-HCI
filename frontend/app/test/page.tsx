"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestStimuliPage() {
  const router = useRouter();
  const [currentTask, setCurrentTask] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [transcribedText, setTranscribedText] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [ratings, setRatings] = useState({});

  const totalTasks = 5;
  const totalPages = 4;

  const reviewQuestions = [
    "The system accurately recognized my speech.",
    "I felt frustrated when the system misunderstood my speech.",
    "Errors made me feel that the system was unreliable.",
    "I think my accent affected how well the system understood me."
  ];

  const handleNext = () => {
    if (currentTask === totalTasks && currentPage === totalPages) {
      setShowThankYou(true);
    } else if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (currentTask < totalTasks) {
      setCurrentTask(currentTask + 1);
      setCurrentPage(1);
      setTranscribedText("");
    }
  };

  const handleReturnHome = () => {
    router.push("/");
  };

  const handleStarRating = (questionIndex, rating) => {
    const ratingKey = `task${currentTask}_q${questionIndex}`;
    setRatings(prev => ({
      ...prev,
      [ratingKey]: rating
    }));
  };

  const renderStars = (questionIndex) => {
    const ratingKey = `task${currentTask}_q${questionIndex}`;
    const currentRating = ratings[ratingKey] || 0;
    
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

  const handleMicrophoneClick = () => {
    // Simulate speech-to-text conversion
    const mockTranscriptions = {
      1: "This is the transcribed text from the microphone recording for task one.",
      2: "Speech to text conversion results are displayed here for task two.",
      3: "The recorded audio has been converted to text format for task three.",
      4: "This represents the transcribed content from the voice recording task four.",
      5: "Audio transcription results are shown here for the final task five."
    };
    
    setTranscribedText(mockTranscriptions[currentTask] || "");
    console.log("Recording started and converted to text");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-[390px] mx-auto bg-white font-sans">
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
          <button
            className="mr-auto text-lg text-purple-800 font-semibold rounded-lg mb-6 hover:bg-purple-300 transition-colors"
          >
            {currentPage === 2 ? "Result Model 1" : currentPage === 3 ? "Result Model 2" : "Result Model 3"}
          </button>
        )}

        {/* Text Content */}
        <div className="w-full max-w-sm mb-8">
          {currentPage === 1 ? (
            <p className="text-m text-black leading-relaxed text-justify">
              {currentTask === 1 
                ? "Last Thursday, I requested a new project task. My boss asked if the finished report was fixed and uploaded. Specifically, I processed the data twice to ensure the results were accurate. If the system crashes again, we might miss the deadline, and the entire business will suffer."
                : currentTask === 2
                ? "Please sit in the correct seat before we begin. I need to ship the sheep to the island by noon. It is a great opportunity to improve my leadership skills. If we slip on the floor, we might sleep in the hospital tonight."
                : currentTask === 3
                ? "The photographer took many photographs for the biography section. We must evaluate the economic situation immediately. He was comfortable with the technology, but the delivery was delayed. It is necessary to communicate with the entire community."
                : currentTask === 4
                ? "The strong structure of the bridge attracts many strangers. We brought three fresh fruits from the street market. It starts at eight o'clock sharp. Please don't forget to check the clocks and spring into action."
                : currentTask === 5
                ? "I can't understand why he shouldn't accept the offer. Actually, specifically, it wasn't available yesterday. The quality of the product doesn't match the description. We mustn't ignore the problem, or it won't be solved easily."
                : ""}
            </p>
          ) : (
            <div className="w-full space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-2">Speech-to-Text Results:</p>
                <p className="text-sm text-black leading-relaxed">
                  {transcribedText || "No transcription available yet. Please record on page 1 first."}
                </p>
              </div>
              
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
              </ul>
            </div>

            {/* Microphone Button - Page 1 Only */}
            <button
              onClick={handleMicrophoneClick}
              className="w-48 h-48 rounded-full bg-gray-300 flex items-center justify-center mb-12 hover:bg-gray-400 transition-colors shadow-lg"
            >
              <Image src="/picture/microphone.png" alt="Microphone" width={84} height={84} />
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="ml-auto w-32 h-12 bg-[#7C2AE8] text-white text-m font-semibold rounded-lg hover:bg-[#6a23c8] transition-colors shadow-lg"
        >
          Next
        </button>
          </>
        )}
      </main>
    </div>
  );
}
