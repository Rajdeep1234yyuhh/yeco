import { Mic, Send, Volume2, BarChart2 } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

type Props = {
  input: string;
  setInput: (val: string) => void;
  sendMessage: () => void;
  startVoiceInput: () => void;
  isListening: boolean;
  interimTranscript: string;
  speakEnabled: boolean;
  setSpeakEnabled: (val: boolean) => void;
};

export default function ChatInput({
  input,
  setInput,
  sendMessage,
  startVoiceInput,
  isListening,
  interimTranscript,
  speakEnabled,
  setSpeakEnabled,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize and detect mobile screens
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640); // 640px is a common breakpoint for small screens
    };

    // Initial check
    checkIfMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Handle pressing Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`flex flex-col sm:flex-row gap-2 ${
          isMobile ? "space-y-2" : ""
        }`}
      >
        <div className="flex flex-grow items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isMobile ? "Message..." : "Share your thoughts..."}
            className="flex-grow px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition flex-shrink-0"
            title="Send"
            aria-label="Send message"
          >
            <Send size={isMobile ? 18 : 20} />
          </button>
        </div>

        <div
          className={`flex items-center gap-2 ${
            isMobile ? "justify-between" : ""
          }`}
        >
          <button
            onClick={startVoiceInput}
            className={`p-2 rounded-lg transition flex-shrink-0 ${
              isListening
                ? "bg-red-600 animate-pulse"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
            title="Voice input"
            aria-label="Voice input"
          >
            <Mic
              size={isMobile ? 18 : 20}
              className={isListening ? "animate-bounce" : ""}
            />
          </button>

          <button
            onClick={() => setSpeakEnabled(!speakEnabled)}
            className={`p-2 rounded-lg transition flex-shrink-0 ${
              speakEnabled
                ? "bg-yellow-600 hover:bg-yellow-500"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
            title="Toggle Voice Output"
            aria-label="Toggle voice output"
          >
            <Volume2 size={isMobile ? 18 : 20} />
          </button>

          <Link
            href="/mood"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition flex-shrink-0"
            title="View Mood Graph"
            aria-label="View mood graph"
          >
            <BarChart2 size={isMobile ? 18 : 20} />
          </Link>
        </div>
      </div>

      {isListening && (
        <p className="text-xs sm:text-sm text-blue-300 mt-2 animate-pulse truncate">
          🎙️ Listening... <span className="italic">{interimTranscript}</span>
        </p>
      )}
    </div>
  );
}
