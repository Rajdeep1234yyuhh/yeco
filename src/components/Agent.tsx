/* eslint-disable @typescript-eslint/no-unused-vars */
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
    // Bot greets the user
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

    const inputLower = userInput.toLowerCase();

    setMessages((prev) => [...prev, { role: "user", text: userInput }]);
    setUserInput("");

    const isNegative =
      inputLower.includes("don't") ||
      inputLower.includes("not") ||
      inputLower.includes("no");

    if (isNegative) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "👍 Okay, I won't proceed with that." },
      ]);
      return;
    }

    if (
      inputLower.includes("talk") ||
      inputLower.includes("support") ||
      inputLower.includes("chat") ||
      inputLower.includes("help") ||
      inputLower.includes("assistant") ||
      inputLower.includes("ai") ||
      inputLower.includes("yeeco") ||
      inputLower.includes("bot")
    ) {
      if (!session) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "⚠️ Please login first to access this feature.",
          },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "🔁 Redirecting you to AI Support Chat..." },
      ]);
      setTimeout(() => window.open("/bot", "_blank"), 1000);
      return;
    }

    if (
      inputLower.includes("trend") ||
      inputLower.includes("report") ||
      inputLower.includes("mood")
    ) {
      if (!session) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "⚠️ Please login first to access this feature.",
          },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "🔁 Opening Mood Trends Report..." },
      ]);
      setTimeout(() => window.open("/mood", "_blank"), 1000);
      return;
    }

    if (
      inputLower.includes("exercise") ||
      inputLower.includes("workout") ||
      inputLower.includes("health")
    ) {
      if (!session) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "⚠️ Please login first to access this feature.",
          },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "🔁 Taking you to Mental Health Exercises..." },
      ]);
      setTimeout(() => window.open("/exercise_suggestion", "_blank"), 1000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        body: JSON.stringify({ query: userInput }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Sorry, something went wrong. Please try again.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-md text-white flex flex-col h-[60vh]">
      {/* Messages area */}
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

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleSuggestionClick("I want to talk to AI Support")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          🧠 Talk to AI Support
        </button>
        <button
          onClick={() =>
            handleSuggestionClick("I want to view Mood Trends Reports")
          }
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          📈 View Mood Trends
        </button>
        <button
          onClick={() =>
            handleSuggestionClick("I want to explore Mental Health Exercises")
          }
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          🏋️‍♂️ Mental Health Exercises
        </button>
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-grow px-4 py-2 rounded-lg text-white focus:outline-none"
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
