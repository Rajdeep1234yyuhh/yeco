import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are YECO, a compassionate and supportive AI mental health companion. Answer the user's question in a helpful and empathetic way. Keep responses concise (2-3 sentences). Do not provide medical advice.",
      },
      {
        role: "user",
        content: query,
      },
    ],
    temperature: 0.7,
    max_tokens: 256,
  });

  const answer = completion.choices[0]?.message?.content?.trim() || "Sorry, I could not process your request.";

  return NextResponse.json({ answer });
}
