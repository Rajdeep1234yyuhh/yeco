/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // ⬅️ Updated line
import { useRouter } from "next/navigation";

import { analyzeEmotion } from "../utils/emotionAnalysis";
import { checkForCrisis } from "../utils/panic_words";
import ChatBox from "../../components/ChatBox";
import ChatInput from "../../components/ChatInput";
import CrisisAlert from "../../components/CrisisAlert";
import Navbar from "@/components/Nav";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function ChatClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

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
    if (!SpeechRecognition) return alert("Speech recognition not supported.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      let finalTranscript = "",
        interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      if (finalTranscript) {
        setInput(finalTranscript);
        sendMessage(finalTranscript);
      } else setInterimTranscript(interim);
    };
    recognition.start();
  };

  const sendMessage = async (value?: string) => {
    const content = (value ?? input)?.toString().trim();
    if (!content) return;

    const emotion = analyzeEmotion(content);
    const userKey = session?.user?.email || "guest"; // use session user email
    const logs = JSON.parse(localStorage.getItem("emotionLogs") || "{}");
    localStorage.setItem(
      "emotionLogs",
      JSON.stringify({
        ...logs,
        [userKey]: [...(logs[userKey] || []), emotion],
      })
    );

    if (checkForCrisis(content)) return setCrisisDetected(true);
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

  if (status === "loading") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col items-center px-4 py-20 relative">
        <div className="w-full max-w-3xl space-y-6">
          <div className="text-center mb-8 mt-4">
            <h2 className="text-xl font-semibold">
              Welcome to YECO&apos;s assistant chat!{" "}
            </h2>
          </div>
          {crisisDetected && <CrisisAlert />}
          <ChatBox
            messages={messages}
            streamingMessage={streamingMessage}
            isStreaming={isStreaming}
          />
          <ChatInput
            input={input}
            setInput={setInput}
            sendMessage={() => sendMessage()}
            startVoiceInput={startVoiceInput}
            isListening={isListening}
            interimTranscript={interimTranscript}
            speakEnabled={speakEnabled}
            setSpeakEnabled={setSpeakEnabled}
          />
        </div>
      </main>
    </>
  );
}
