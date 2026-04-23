"use client";

import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);

    window.location.href =
      "https://ai-realtime-chat-backend-4r7n.onrender.com/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg mb-6">
            <svg
              width="42"
              height="42"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 20C16 17.7909 17.7909 16 20 16H44C46.2091 16 48 17.7909 48 20V36C48 38.2091 46.2091 40 44 40H28L20 48V40C17.7909 40 16 38.2091 16 36V20Z"
                fill="white"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900">
            AI Real Chat
          </h1>

          <p className="text-gray-500 mt-3 leading-relaxed">
            Smart real-time messaging with beautiful conversations,
            AI replies, and modern team communication.
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.6 10.23c0-.71-.06-1.4-.18-2.05H10v3.87h5.38c-.24 1.25-.96 2.31-2.04 3.02v2.51h3.3c1.93-1.78 3.04-4.4 3.04-7.35z"
              fill="#4285F4"
            />
            <path
              d="M10 20c2.75 0 5.06-.9 6.75-2.44l-3.3-2.51c-.9.6-2.05.95-3.45.95-2.65 0-4.9-1.79-5.7-4.19H.74v2.59C2.42 17.74 6.04 20 10 20z"
              fill="#34A853"
            />
            <path
              d="M4.3 11.81c-.2-.6-.3-1.24-.3-1.81s.1-1.21.3-1.81V5.6H.74C.27 6.54 0 7.6 0 8.8s.27 2.26.74 3.2l3.56-2.19z"
              fill="#FBBC05"
            />
            <path
              d="M10 3.95c1.5 0 2.85.52 3.91 1.54l2.92-2.92C15.05 1.05 12.75 0 10 0 6.04 0 2.42 2.26.74 5.6l3.56 2.19c.8-2.4 3.05-4.19 5.7-4.19z"
              fill="#EA4335"
            />
          </svg>

          <span>
            {isLoading
              ? "Signing in..."
              : "Continue with Google"}
          </span>
        </button>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider leading-relaxed">
            By continuing, you agree to our Terms of Service
            and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}