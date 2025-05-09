"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Assistant() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMessages([
      {
        role: "bot",
        text: "👋 Hi! Welcome to YECO Assistant. How can I help you today?",
      },
    ]);
  }, []);

  const handleSuggestionClick = (text: string) => {
    setUserInput(text);
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: userInput }]);
    setUserInput("");
    setLoading(true);

    let detectedIntent: string | null = null;

    try {
      const intentRes = await fetch("http://localhost:8000/detect_intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userInput }),
      });

      const intentData = await intentRes.json();
      detectedIntent = intentData.intent;
    } catch (error) {
      console.error("Intent detection failed:", error);
    }

    // if (detectedIntent === "negative") {
    //   setMessages((prev) => [
    //     ...prev,
    //     { role: "bot", text: "👍 Okay, I won't proceed with that." },
    //   ]);
    //   setLoading(false);
    //   return;
    // }

    if (
      ["talk_to_ai", "view_mood", "mental_health"].includes(
        detectedIntent || ""
      )
    ) {
      if (!session) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "🔒 Please login first before continuing." },
        ]);
        setLoading(false);
        return;
      }

      const redirects: Record<string, string> = {
        talk_to_ai: "/bot",
        view_mood: "/mood",
        mental_health: "/exercise_suggestion",
      };

      const messagesMap: Record<string, string> = {
        talk_to_ai: "🤖 🔁 Redirecting you to AI Support Chat...",
        view_mood: "📊 🔁 Opening Mood Trends Report...",
        mental_health: "🧘 🔁 Taking you to Mental Health Exercises...",
      };

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: messagesMap[detectedIntent!] },
      ]);

      // Use setTimeout to allow rendering before opening a new tab
      setTimeout(() => {
        window.open(redirects[detectedIntent!], "_blank");
      }, 500);

      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        body: JSON.stringify({ query: userInput }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      const { answer, intent } = data;

      const displayAnswer = intent
        ? `${answer} \n\n🧠 Detected intent: ${intent}`
        : answer;

      setMessages((prev) => [...prev, { role: "bot", text: displayAnswer }]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-md text-white flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs break-words px-4 py-2 rounded-2xl text-sm ${
                msg.role === "bot"
                  ? "bg-gray-700 text-blue-300 rounded-bl-none"
                  : "bg-green-600 text-white rounded-br-none"
              }`}
            >
              {msg.role === "bot" ? "🤖" : "🧑"} {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion prompts styled as subtle clickable text */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-white/80">
        <span
          onClick={() => handleSuggestionClick("I want to talk to AI Support")}
          className="cursor-pointer hover:text-white transition-colors"
        >
          🧠 Talk to AI Support
        </span>
        <span
          onClick={() =>
            handleSuggestionClick("I want to view Mood Trends Reports")
          }
          className="cursor-pointer hover:text-white transition-colors"
        >
          📈 View Mood Trends
        </span>
        <span
          onClick={() =>
            handleSuggestionClick("I want to explore Mental Health Exercises")
          }
          className="cursor-pointer hover:text-white transition-colors"
        >
          🏋️‍♂️ Mental Health Exercises
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-grow px-4 py-2 rounded-lg text-white bg-gray-700 focus:outline-none"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>

      {loading && <p className="text-gray-400 mt-3 text-center">Thinking...</p>}
    </div>
  );
}
