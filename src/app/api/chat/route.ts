import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Add your Groq API key in .env.local
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    stream: true,
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          // Send in a format compatible with the frontend parser
          const data = JSON.stringify({ message: { content } });
          controller.enqueue(encoder.encode(data + "\n"));
        }
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
