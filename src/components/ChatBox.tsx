import React, { useEffect, useState } from "react";
import { Message } from "../app/bot/page";
import MessageBubble from "../components/MessageBubble";
import { useSession } from "next-auth/react";

export default function ChatBox({
  messages,
  streamingMessage,
  isStreaming,
}: {
  messages: Message[];
  streamingMessage: string;
  isStreaming: boolean;
}) {
  const [userName, setUserName] = useState("there");
  const [showWelcome, setShowWelcome] = useState(true);
  const { data: session } = useSession();

  // Get user's name from session when component mounts
  useEffect(() => {
    if (session?.user?.name) {
      // Extract first name if there's a full name
      const firstName = session.user.name.split(" ")[0];
      setUserName(firstName);
    }

    // Hide welcome message if there are actual messages
    if (messages.filter((m) => m.role !== "system").length > 0) {
      setShowWelcome(false);
    }
  }, [messages, session]);

  return (
    <div className="bg-gray-800 rounded-xl h-[400px] overflow-y-auto p-4 space-y-3 shadow-lg">
      {showWelcome &&
        messages.filter((m) => m.role !== "system").length === 0 && (
          <div className="text-green-400">
            <strong>YECO:</strong> Hey {userName}! How can I help you today?
          </div>
        )}

      {messages
        .filter((m) => m.role !== "system")
        .map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} />
        ))}

      {isStreaming && (
        <div className="text-green-400 animate-pulse">
          <strong>YECO:</strong> {streamingMessage}
        </div>
      )}
    </div>
  );
}
