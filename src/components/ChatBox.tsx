import { Message } from "../app/bot/page";
import MessageBubble from "../components/MessageBubble";

export default function ChatBox({
  messages,
  streamingMessage,
  isStreaming,
}: {
  messages: Message[];
  streamingMessage: string;
  isStreaming: boolean;
}) {
  return (
    <div className="bg-gray-800 rounded-xl h-[400px] overflow-y-auto p-4 space-y-3 shadow-lg">
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
