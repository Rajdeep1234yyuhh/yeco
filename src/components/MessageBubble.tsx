import { Message } from "../app/bot/page";

export default function MessageBubble({ msg }: { msg: Message }) {
  return (
    <div
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
  );
}
