import { Mic, Send, Volume2, BarChart2 } from "lucide-react";
import Link from "next/link";

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
  return (
    <>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your thoughts..."
          className="flex-grow px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition"
          title="Send"
        >
          <Send size={20} />
        </button>

        <button
          onClick={startVoiceInput}
          className={`p-2 rounded-lg transition ${
            isListening
              ? "bg-red-600 animate-pulse"
              : "bg-gray-600 hover:bg-gray-500"
          }`}
          title="Voice input"
        >
          <Mic size={20} className={isListening ? "animate-bounce" : ""} />
        </button>

        <button
          onClick={() => setSpeakEnabled(!speakEnabled)}
          className={`p-2 rounded-lg transition ${
            speakEnabled
              ? "bg-yellow-600 hover:bg-yellow-500"
              : "bg-gray-600 hover:bg-gray-500"
          }`}
          title="Toggle Voice Output"
        >
          <Volume2 size={20} />
        </button>

        <Link
          href="/mood"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
          title="View Mood Graph"
        >
          <BarChart2 size={20} />
        </Link>
      </div>

      {isListening && (
        <p className="text-sm text-blue-300 mt-2 animate-pulse">
          🎙️ Listening... <span className="italic">{interimTranscript}</span>
        </p>
      )}
    </>
  );
}
