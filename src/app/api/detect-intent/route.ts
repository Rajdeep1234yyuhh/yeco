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
        content: `You are an intent classifier. Given a user message, classify it into exactly one of these intents:
- "talk_to_ai" — the user wants to chat with an AI, talk about feelings, get emotional support, or talk to a bot
- "view_mood" — the user wants to see mood trends, mood reports, mood analytics, or mood history
- "mental_health" — the user wants mental health exercises, meditation, breathing, or wellness activities
- "general" — anything else that does not fit the above categories

Reply with ONLY the intent label, nothing else. No explanation, no punctuation.`,
      },
      {
        role: "user",
        content: query,
      },
    ],
    temperature: 0,
    max_tokens: 20,
  });

  const intent = completion.choices[0]?.message?.content?.trim().toLowerCase() || "general";

  return NextResponse.json({ intent });
}
