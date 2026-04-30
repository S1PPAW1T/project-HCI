/**
 * EXAMPLE: How to record and upload audio
 * 
 * Use this as a reference for implementing audio recording and upload
 * in your Task 1 page
 */

"use client";

import { useState, useRef } from "react";
import { uploadAudio, getSessionInfo, clearSession } from "@/app/services/audioService";

export default function AudioRecordingExample() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setUploadStatus("idle");
      setErrorMessage("");
    } catch (error) {
      console.error("Microphone access denied:", error);
      setErrorMessage("Please allow microphone access to record audio");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  // Upload recording
  const handleUpload = async () => {
    if (audioChunksRef.current.length === 0) {
      setErrorMessage("No recording to upload");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const result = await uploadAudio(audioBlob);

      console.log("Upload successful:", result);
      setUploadStatus("success");

      // Audio has been saved, clear session if needed
      // clearSession();
    } catch (error: any) {
      console.error("Upload failed:", error);
      setErrorMessage(error.message);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  // Get current session info
  const sessionInfo = getSessionInfo();

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-2xl font-bold">Audio Recording Example</h2>

      {/* Session Info */}
      {sessionInfo && (
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Name:</strong> {sessionInfo.name}
          </p>
          <p className="text-sm">
            <strong>Age:</strong> {sessionInfo.age}
          </p>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex gap-2">
        <button
          onClick={startRecording}
          disabled={isRecording || isUploading}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          {isRecording ? "Recording..." : "Start Recording"}
        </button>

        <button
          onClick={stopRecording}
          disabled={!isRecording || isUploading}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          Stop Recording
        </button>

        <button
          onClick={handleUpload}
          disabled={isUploading || isRecording || audioChunksRef.current.length === 0}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload Audio"}
        </button>
      </div>

      {/* Status Messages */}
      {uploadStatus === "success" && (
        <div className="bg-green-100 p-4 rounded-lg text-green-800">
          <p>✓ Audio uploaded successfully!</p>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="bg-red-100 p-4 rounded-lg text-red-800">
          <p>✗ {errorMessage}</p>
        </div>
      )}
    </div>
  );
}
