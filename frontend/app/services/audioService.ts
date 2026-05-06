/**
 * Audio Upload Service
 * Handles uploading recorded audio to the backend
 */

export const uploadAudio = async (audioBlob: Blob, apiUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") => {
  try {
    const sessionId = localStorage.getItem("audioSessionId");
    
    if (!sessionId) {
      throw new Error("No active session. Please login first.");
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append("id", sessionId);
    formData.append("audio", audioBlob, "recording.wav");

    const response = await fetch(`${apiUrl}/api/audio/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    return data.data;
  } catch (error) {
    console.error("Audio upload error:", error);
    throw error;
  }
};

/**
 * Get user session info
 */
export const getSessionInfo = () => {
  const sessionId = localStorage.getItem("audioSessionId");
  const userInfoStr = localStorage.getItem("userInfo");
  
  if (!sessionId || !userInfoStr) {
    return null;
  }

  return {
    id: sessionId,
    ...JSON.parse(userInfoStr),
  };
};

/**
 * Clear session
 */
export const clearSession = () => {
  localStorage.removeItem("audioSessionId");
  localStorage.removeItem("userInfo");
};
