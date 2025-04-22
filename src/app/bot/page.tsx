/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { checkForCrisis } from "../panic_words";

type Props = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

// Voice Input Types
interface CustomSpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface CustomSpeechRecognitionErrorEvent extends Event {
  error: string;
}

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
  const [speakEnabled, setSpeakEnabled] = useState(true);

  // Voice Output
  const speakText = (text: string) => {
    if (!speakEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  // Voice Input
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: Event) => {
      const speechEvent = event as CustomSpeechRecognitionEvent;
      const transcript = speechEvent.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript); // auto-send after speech input
    };

    recognition.onerror = (event: Event) => {
      const errorEvent = event as CustomSpeechRecognitionErrorEvent;
      console.error("Speech recognition error:", errorEvent.error);
    };

    recognition.start();
  };

  // Updated to optionally accept value (for speech input)
  const sendMessage = async (value?: string) => {
    const content = value ?? input;
    if (!content.trim()) return;

    // Crisis detection
    if (checkForCrisis(content)) {
      setCrisisDetected(true);
      return;
    }
    setCrisisDetected(false);

    const systemPrompt: Message = {
      role: "system",
      content: `You are a compassionate, supportive mental health companion. Your role is to help users feel heard, valued, and emotionally supported. Always respond with empathy, kindness, and calm language. Use active listening, validate emotions, and gently encourage self-reflection. Avoid diagnosing or giving medical advice. If a user is in crisis, encourage them to seek immediate help from a mental health professional or call a crisis helpline. Your role is to help users feel heard, valued, and emotionally supported. Respond like a calm, kind human friend. Keep your answers short and natural unless the user needs detailed help, like mental exercises or calming techniques.`,
    };

    const baseMessages = messages.find((m) => m.role === "system")
      ? messages
      : [systemPrompt, ...messages];

    const newMessages: Message[] = [...baseMessages, { role: "user", content }];

    setMessages(newMessages);
    setInput("");
    setStreamingMessage("");
    setIsStreaming(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        model: "yeco",
        messages: newMessages,
      }),
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
          console.error("Streaming parse error:", err);
        }
      }
    }

    setMessages([...newMessages, { role: "assistant", content: fullText }]);
    setStreamingMessage("");
    setIsStreaming(false);
    speakText(fullText); // speak the final AI message
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🧠 CalmConnect</h1>

      {/* Crisis Alert */}
      {crisisDetected && (
        <div className="mb-4 p-4 border border-red-600 bg-red-100 text-red-800 rounded shadow">
          <strong>🚨 Crisis Detected:</strong> It seems like you&apos;re going
          through a very difficult time. You are not alone. Please reach out to
          a mental health professional or call a crisis helpline immediately.
        </div>
      )}

      {/* Chat Box */}
      <div className="border p-4 h-96 overflow-y-auto rounded mb-4 bg-white shadow">
        {messages
          .filter((msg) => msg.role !== "system")
          .map((msg, idx) => (
            <p
              key={idx}
              className={
                msg.role === "user" ? "text-blue-700" : "text-green-700"
              }
            >
              <strong>{msg.role === "user" ? "You" : "AI"}:</strong>{" "}
              {msg.content}
            </p>
          ))}
        {isStreaming && (
          <p className="text-green-700">
            <strong>AI:</strong> {streamingMessage}
            <span className="animate-pulse">▍</span>
          </p>
        )}
      </div>

      {/* Input & Buttons */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          placeholder="How are you feeling today?"
          className="flex-grow px-3 py-2 border rounded"
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={() => sendMessage()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
        <button
          onClick={startVoiceInput}
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 text-black"
        >
          🎤 Speak
        </button>
      </div>
      {/* Toggle Speak */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="toggle-speech"
          checked={speakEnabled}
          onChange={(e) => setSpeakEnabled(e.target.checked)}
          className="accent-blue-600"
        />
        <label htmlFor="toggle-speech" className="text-sm">
          🔊 Enable Voice Output
        </label>
      </div>
    </main>
  );
}
