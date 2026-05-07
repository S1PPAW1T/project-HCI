"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isValidAge = age !== "" && Number(age) >= 18 && Number(age) <= 25;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      console.log("Logging in to:", apiUrl);
      
      const response = await fetch(
        `${apiUrl}/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            name, 
            age: parseInt(age, 10), // Convert to number
            consent 
          }),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }

      const data = await response.json();

      // Store user data and ID in localStorage for use in audio upload
      localStorage.setItem("audioSessionId", data.data.id);
      localStorage.setItem("userInfo", JSON.stringify({
        name: data.data.name,
        age: data.data.age,
      }));

      console.log("Login successful:", data);
      router.push("/test");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.\n\nError: " + (error instanceof Error ? error.message : "Unknown error"));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[844px] w-[390px] mx-auto bg-white font-sans">
      {/* Logo */}
      <div className="w-full flex justify-end pt-8 pr-8">
        <Image src="/picture/logo.png" alt="Logo" width={40} height={49} />
      </div>

      {/* Content */}
      <main className="flex flex-col items-center justify-center flex-1 w-full px-6 pt-2 pb-8">
        <div className="space-y-6 w-full">
          {/* Informed Consent Section */}
          <div className='bg-[#F0F0F0] px-4 py-4 rounded-xl'>
            <h2 className="text-xl font-bold text-black mb-4 text-center">
              Informed Consent
            </h2>

            <ul className="space-y-5 text-sm text-black">
              <li className="grid grid-cols-[90px_1fr] gap-4">
                <span className="font-bold">Purpose:</span>
                <span>
                  I understand that my voice will be recorded and used as primary data for this research study.
                </span>
              </li>

              <li className="grid grid-cols-[90px_1fr] gap-4">
                <span className="font-bold">Privacy:</span>
                <span>
                  My data will remain anonymous and be stored securely for academic purposes only.
                </span>
              </li>

              <li className="grid grid-cols-[90px_1fr] gap-4">
                <span className="font-bold">Voluntary Participation:</span>
                <span>
                  I acknowledge that I can withdraw from the study at any time without any penalty.
                </span>
              </li>
            </ul>

            {/* Consent Checkbox */}
            <div className="mt-6 flex items-start gap-3">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-5 h-5 mt-1 border-2 border-[##7C2AE8] accent-purple-600 cursor-pointer hover:scale-105"
              />
              <label htmlFor="consent" className="text-sm text-[#7018B3] cursor-pointer">
                I have read and understood the terms and conditions
                <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          {/* Participant Information Section */}
          <div className=''>
            <h2 className="text-xl font-bold text-black mb-4">
              Participant Information
            </h2>

            <p className="text-sm text-black mb-6">
              Please provide your information to proceed:
            </p>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-sm border border-purple-200 bg-purple-100 text-black placeholder-[#B47FDC] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  required
                />
                <p className="text-xs text-[#B47FDC] mt-1">
                  * To protect your privacy, you may use a nickname or initials
                </p>
              </div>

              {/* Age Field */}
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  value={age}
                  min={18}
                  max={25}
                  onChange={(e) => setAge(e.target.value)}
                  className={`w-full px-4 py-2 text-sm rounded-lg border bg-purple-100 text-black placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors
                    ${
                      age && !isValidAge
                        ? "border-red-500 focus:ring-red-500"
                        : "border-purple-200 focus:ring-purple-500"
                    }`}                  
                  required
                />
                {age && !isValidAge && (
                  <p className="text-xs text-red-500 mt-1">
                    Age must be between 18 and 25 years old.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <form onSubmit={handleSubmit} className="flex justify-center pt-4 w-full">
            <button
              type="submit"
              disabled={isLoading || !consent || !name || !age || !isValidAge}
              className="w-full h-[48px] bg-[#7C2AE8] text-white font-medium rounded-lg hover:bg-[#6a23c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}