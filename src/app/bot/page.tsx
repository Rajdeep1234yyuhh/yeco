"use client";

import Link from "next/link";
import { useState } from "react";
import { analyzeEmotion } from "../utils/emotionAnalysis";
import { checkForCrisis } from "../panic_words";
import { Mic, Send } from "lucide-react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

type Props = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function ChatClient({ user }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);

  const speakText = (text: string) => {
    if (!speakEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.start();
  };

  const sendMessage = async (value?: string) => {
    const content = value ?? input;
    if (!content.trim()) return;

    const emotion = analyzeEmotion(content);
    const userKey = user?.email || "guest";
    const logs = JSON.parse(localStorage.getItem("emotionLogs") || "{}");

    localStorage.setItem(
      "emotionLogs",
      JSON.stringify({
        ...logs,
        [userKey]: [...(logs[userKey] || []), emotion],
      })
    );

    if (checkForCrisis(content)) {
      setCrisisDetected(true);
      return;
    }
    setCrisisDetected(false);

    const systemPrompt: Message = {
      role: "system",
      content: `You are a compassionate, supportive mental health companion...`,
    };

    const newMessages: Message[] = [
      ...(messages.find((m) => m.role === "system")
        ? messages
        : [systemPrompt, ...messages]),
      { role: "user", content },
    ];

    setMessages(newMessages);
    setInput("");
    setStreamingMessage("");
    setIsStreaming(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ model: "yeco", messages: newMessages }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.trim().startsWith("{"));
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            fullText += json.message.content;
            setStreamingMessage(fullText);
          }
        } catch (err) {
          console.error("Streaming error:", err);
        }
      }
    }

    setMessages([...newMessages, { role: "assistant", content: fullText }]);
    setStreamingMessage("");
    setIsStreaming(false);
    speakText(fullText);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-center">🧠 YECO</h1>

        {crisisDetected && (
          <div className="bg-red-600 text-white text-sm px-4 py-3 rounded-lg">
            🚨 Crisis detected! Please seek immediate professional help or
            contact a helpline.
          </div>
        )}

        <div className="bg-gray-800 rounded-xl h-[400px] overflow-y-auto p-4 space-y-3 shadow-lg">
          {messages
            .filter((m) => m.role !== "system")
            .map((msg, idx) => (
              <div
                key={idx}
                className={`text-sm p-2 rounded-md ${
                  msg.role === "user"
                    ? "bg-blue-700/30 self-end"
                    : "bg-green-700/30 self-start"
                }`}
              >
                <span className="block font-semibold">
                  {msg.role === "user" ? "You" : "AI"}
                </span>
                <span>{msg.content}</span>
              </div>
            ))}
          {isStreaming && (
            <div className="text-green-400 animate-pulse">
              <strong>AI:</strong> {streamingMessage}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts..."
            className="flex-grow px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => sendMessage()}
            className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition"
            title="Send"
          >
            <Send size={20} />
          </button>
          <button
            onClick={startVoiceInput}
            className="bg-gray-600 p-2 rounded-lg hover:bg-gray-500 transition"
            title="Voice input"
          >
            <Mic size={20} />
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={speakEnabled}
            onChange={(e) => setSpeakEnabled(e.target.checked)}
            className="accent-blue-500"
          />
          🔊 Voice Output
        </label>

        <div className="text-left text-sm">
          <Link href="/mood" className=" text-sm">
            <InteractiveHoverButton className="bg-gray-800">
              📊 Mood
            </InteractiveHoverButton>
          </Link>
        </div>
      </div>
    </main>
  );
}
