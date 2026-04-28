"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    console.log("Form submitted:", { name, age, consent });
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
          <div>
            <h2 className="text-xl font-bold text-black mb-4">
              Informed Consent
            </h2>

            <ul className="space-y-3 text-sm text-zinc-700">
              <li className="flex gap-3">
                <span className="font-bold min-w-fit">Purpose:</span>
                <span>
                  I understand that my voice will be recorded and used as primary data for this research study.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold min-w-fit">Privacy:</span>
                <span>
                  My data will remain anonymous and be stored securely for academic purposes only.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold min-w-fit">Voluntary Participation:</span>
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
                className="w-5 h-5 mt-1 rounded border-2 border-purple-500 cursor-pointer"
              />
              <label htmlFor="consent" className="text-sm text-zinc-700 cursor-pointer">
                I have read and understood the terms and conditions
                <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          {/* Participant Information Section */}
          <div>
            <h2 className="text-xl font-bold text-black mb-4">
              Participant Information
            </h2>

            <p className="text-sm text-zinc-600 mb-6">
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
                  placeholder="To protect your privacy, you may use a nickname or initials"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-purple-100 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-sm"
                  required
                />
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
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-purple-100 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <form onSubmit={handleSubmit} className="flex justify-center pt-4 w-full">
            <button
              type="submit"
              disabled={isLoading || !consent || !name || !age}
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