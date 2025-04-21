// app/api/chat/route.ts
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text(); // read as text because it's streamed later

  const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  return new Response(ollamaResponse.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
